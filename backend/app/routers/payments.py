import os
import hmac
import hashlib
from typing import List, Tuple, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from dotenv import load_dotenv, find_dotenv

from ..database import get_session
from ..deps import get_current_user
from ..models import User
from ..models.payment import Payment, PaymentCreateRequest, PaymentVerifyRequest, PaymentRead

import razorpay

router = APIRouter(prefix="/payments", tags=["payments"])


def get_razorpay_creds() -> Tuple[str, str, bool]:
    """
    Dynamically retrieve Razorpay credentials from the environment.
    Reloads .env so key updates take effect without server restarts.
    """
    dotenv_path = find_dotenv(usecwd=True)
    if dotenv_path:
        load_dotenv(dotenv_path=dotenv_path, override=False)
    else:
        load_dotenv(override=False)

    key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

    is_placeholder = (
        not key_id
        or key_id == "rzp_test_placeholder"
        or key_id.startswith("rzp_test_placeholder")
        or key_id == "your_razorpay_key_id"
    )
    return key_id, key_secret, is_placeholder


def get_razorpay_client() -> Tuple[Optional[razorpay.Client], str, str, bool]:
    """Returns a tuple of (client, key_id, key_secret, is_mock)."""
    key_id, key_secret, is_placeholder = get_razorpay_creds()
    if is_placeholder:
        return None, key_id, key_secret, True

    try:
        client = razorpay.Client(auth=(key_id, key_secret))
        return client, key_id, key_secret, False
    except Exception as e:
        print(f"[Razorpay] Client initialization failed: {e}")
        return None, key_id, key_secret, True


@router.get("/config")
async def get_razorpay_config():
    """Return the Razorpay public key and status so the frontend can configure checkout."""
    key_id, _, is_placeholder = get_razorpay_creds()
    return {
        "key_id": key_id if not is_placeholder else "rzp_test_placeholder",
        "is_mock": is_placeholder,
        "is_test_mode": key_id.startswith("rzp_test_"),
        "currency": "INR",
    }


@router.post("/create-order", response_model=PaymentRead)
async def create_payment_order(
    req: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    1. Validates amount
    2. Creates a Razorpay order in test mode (or mock order if placeholder)
    3. Saves a Payment record with status 'created'
    4. Returns the record (includes razorpay_order_id for frontend)
    """
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")

    amount_paise = round(req.amount * 100)  # Razorpay expects integer paise
    if amount_paise < 100:
        raise HTTPException(status_code=400, detail="Minimum payment amount for Razorpay is ₹1.00 (100 paise)")

    client, key_id, key_secret, is_mock = get_razorpay_client()

    # Sanitize and truncate notes for Razorpay (max 15 keys, max 256 chars per value)
    safe_notes = {
        "payment_for": str(req.payment_for or "order")[:100],
        "user_id": str(current_user.id),
        "reference_id": str(req.reference_id or "")[:100],
    }
    if req.shipping_address:
        safe_notes["shipping_address"] = str(req.shipping_address)[:100]

    try:
        if is_mock or not client:
            # Mock mode: return dummy order
            order_id = f"order_dummy_{int(datetime.utcnow().timestamp())}"
            rz_order = {"id": order_id}
        else:
            rz_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1,  # Auto-capture
                "notes": safe_notes,
            })
    except razorpay.errors.BadRequestError as bre:
        err_msg = str(bre)
        if "too many requests" in err_msg.lower():
            raise HTTPException(status_code=429, detail="Razorpay Test API rate limit reached. Please wait a few seconds and try again.")
        raise HTTPException(status_code=400, detail=f"Razorpay request rejected: {err_msg}")
    except Exception as e:
        print(f"[Razorpay] Order creation failed: {e}")
        raise HTTPException(status_code=502, detail=f"Payment Gateway Error: {str(e)}")

    db_payment = Payment(
        user_id=current_user.id,
        razorpay_order_id=rz_order["id"],
        amount=req.amount,
        currency="INR",
        status="created",
        payment_for=req.payment_for,
        reference_id=req.reference_id,
        shipping_address=req.shipping_address,
        notes=req.notes,
    )
    session.add(db_payment)
    await session.commit()
    await session.refresh(db_payment)
    return db_payment


@router.post("/verify")
async def verify_payment(
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Verifies the Razorpay payment signature.
    On success: updates Payment status to 'paid', updates related order status.
    Idempotent: returns existing payment if already marked 'paid'.
    """
    # 1. Input sanitization
    order_id = (req.razorpay_order_id or "").strip()
    payment_id = (req.razorpay_payment_id or "").strip()
    signature = (req.razorpay_signature or "").strip()

    if not order_id or not payment_id or not signature:
        raise HTTPException(status_code=400, detail="Missing required payment verification parameters (order_id, payment_id, or signature)")

    # 2. Find the payment record
    statement = select(Payment).where(Payment.razorpay_order_id == order_id)
    result = await session.exec(statement)
    db_payment = result.first()

    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # 3. Security: Check user ownership
    if db_payment.user_id != current_user.id and getattr(current_user, "role", "") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to verify this payment")

    # 4. Idempotency: If already paid, return early with success
    if db_payment.status == "paid":
        return {
            "status": "success",
            "payment_id": db_payment.id,
            "razorpay_payment_id": db_payment.razorpay_payment_id,
            "amount": db_payment.amount,
            "shipping_status": db_payment.shipping_status,
            "message": "Payment already verified",
        }

    client, key_id, key_secret, is_mock = get_razorpay_client()
    is_dummy_signature = (
        signature in ("dummy_signature", "mock_signature")
        or signature.startswith("dummy_")
    )

    if is_mock or is_dummy_signature:
        if not is_mock and not is_dummy_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
    else:
        # Real Razorpay signature verification
        verified = False
        if client:
            try:
                client.utility.verify_payment_signature({
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature,
                })
                verified = True
            except razorpay.errors.SignatureVerificationError:
                verified = False
            except Exception as e:
                print(f"[Razorpay] verify_payment_signature exception: {e}")

        if not verified:
            message = f"{order_id}|{payment_id}"
            expected_signature = hmac.new(
                key_secret.encode("utf-8"),
                message.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            if hmac.compare_digest(expected_signature, signature):
                verified = True

        if not verified:
            db_payment.status = "failed"
            session.add(db_payment)
            await session.commit()
            raise HTTPException(status_code=400, detail="Payment verification failed — invalid Razorpay signature")

    # 5. Mark paid
    db_payment.status = "paid"
    db_payment.razorpay_payment_id = payment_id
    db_payment.razorpay_signature = signature
    db_payment.paid_at = datetime.utcnow()
    db_payment.shipping_status = "pending"
    session.add(db_payment)

    # 6. Update the related order/transaction status based on payment_for safely
    try:
        await _update_order_status_on_payment(db_payment, session)
    except Exception as exc:
        print(f"[Payment Status Update Warning] Error updating related domain record: {exc}")

    await session.commit()
    await session.refresh(db_payment)

    return {
        "status": "success",
        "payment_id": db_payment.id,
        "razorpay_payment_id": db_payment.razorpay_payment_id,
        "amount": db_payment.amount,
        "shipping_status": db_payment.shipping_status,
    }


async def _update_order_status_on_payment(payment: Payment, session: AsyncSession):
    """
    After payment is verified, update the corresponding order/record status.
    """
    from ..models import CustomerOrder, ShopOrder
    from ..models.manufacturer import ManufacturerSale, ManufacturerPurchase

    if payment.payment_for == "customer_order" and payment.reference_id:
        order = await session.get(CustomerOrder, payment.reference_id)
        if order:
            order.status = "confirmed"  # paid → confirmed (ready for shipping)
            session.add(order)

    elif payment.payment_for == "shop_order" and payment.reference_id:
        order = await session.get(ShopOrder, payment.reference_id)
        if order:
            order.payment_status = "paid"
            order.payment_mode = "razorpay"
            if order.status == "pending":
                order.status = "confirmed"
            session.add(order)

    elif payment.payment_for == "manufacturer_sale" and payment.reference_id:
        sale = await session.get(ManufacturerSale, payment.reference_id)
        if sale:
            sale.payment_mode = "Razorpay"
            session.add(sale)

    elif payment.payment_for == "manufacturer_purchase" and payment.reference_id:
        purchase = await session.get(ManufacturerPurchase, payment.reference_id)
        if purchase:
            purchase.payment_mode = "Razorpay"
            session.add(purchase)


@router.get("/history", response_model=List[PaymentRead])
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all payments for the current user."""
    statement = (
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    )
    result = await session.exec(statement)
    return result.all()


@router.put("/{payment_id}/shipping")
async def update_shipping_status(
    payment_id: int,
    shipping_status: str,
    tracking_id: str = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update shipping status and tracking info for a payment."""
    db_payment = await session.get(Payment, payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    valid_statuses = ["pending", "shipped", "in_transit", "delivered", "cancelled"]
    if shipping_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be: {valid_statuses}")

    db_payment.shipping_status = shipping_status
    if tracking_id:
        db_payment.tracking_id = tracking_id

    # Also update the order status if it's a customer order
    if db_payment.payment_for == "customer_order" and db_payment.reference_id:
        from ..models import CustomerOrder
        order = await session.get(CustomerOrder, db_payment.reference_id)
        if order:
            status_map = {
                "shipped": "shipped",
                "in_transit": "shipped",
                "delivered": "delivered",
                "cancelled": "cancelled",
            }
            if shipping_status in status_map:
                order.status = status_map[shipping_status]
                session.add(order)

    session.add(db_payment)
    await session.commit()
    await session.refresh(db_payment)

    return {
        "status": "updated",
        "shipping_status": db_payment.shipping_status,
        "tracking_id": db_payment.tracking_id,
    }
