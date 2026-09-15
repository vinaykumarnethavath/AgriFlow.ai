from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from ..database import get_session
from ..models import ShopOrder, ShopOrderCreate, ShopOrderRead, ShopOrderItem, Product, User, ShopOrderStatusUpdate
from ..models.expense import ShopExpense
from ..models.farmer import FarmerProfile
from ..models.shop import ShopProfile
from ..models.manufacturer import MillProfile
from ..models.customer import CustomerProfile
from ..deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


async def get_user_contact_info(session: AsyncSession, user_id: int) -> Optional[Dict]:
    """Look up a user's contact details from their profile for display in orders."""
    user = await session.get(User, user_id)
    if not user:
        return None

    contact = {
        "user_id": user.id,
        "full_name": user.full_name,
        "role": user.role,
        "phone_number": user.phone_number,
        "address": None,
        "profile_picture_url": None,
        "village": None,
        "mandal": None,
        "district": None,
        "state": None,
    }

    profile = None
    if user.role == "farmer":
        result = await session.exec(select(FarmerProfile).where(FarmerProfile.user_id == user_id))
        profile = result.first()
        if profile:
            contact["phone_number"] = profile.phone_number or user.phone_number
            contact["profile_picture_url"] = profile.profile_picture_url
            contact["village"] = profile.village
            contact["mandal"] = profile.mandal
            contact["district"] = profile.district
            contact["state"] = profile.state
            parts = [p for p in [profile.house_no, profile.street, profile.village, profile.mandal, profile.district, profile.state, profile.pincode] if p]
            contact["address"] = ", ".join(parts) if parts else None

    elif user.role == "shop":
        result = await session.exec(select(ShopProfile).where(ShopProfile.user_id == user_id))
        profile = result.first()
        if profile:
            contact["full_name"] = profile.owner_name or user.full_name
            contact["phone_number"] = profile.phone_number or profile.contact_number or user.phone_number
            contact["profile_picture_url"] = profile.profile_picture_url
            contact["village"] = profile.village
            contact["mandal"] = profile.mandal
            contact["district"] = profile.district
            contact["state"] = profile.state
            # Use shop_address if available, else build from components
            if profile.shop_address:
                contact["address"] = profile.shop_address
            else:
                parts = [p for p in [profile.house_no, profile.street, profile.village, profile.mandal, profile.district, profile.state, profile.pincode] if p]
                contact["address"] = ", ".join(parts) if parts else None

    elif user.role == "manufacturer":
        result = await session.exec(select(MillProfile).where(MillProfile.user_id == user_id))
        profile = result.first()
        if profile:
            contact["full_name"] = profile.owner_name or user.full_name
            contact["phone_number"] = profile.phone_number or profile.contact_number or user.phone_number
            contact["profile_picture_url"] = profile.profile_picture_url
            contact["village"] = profile.village
            contact["mandal"] = profile.mandal
            contact["district"] = profile.district
            contact["state"] = profile.state
            parts = [p for p in [profile.house_no, profile.street, profile.village, profile.mandal, profile.district, profile.state, profile.pincode] if p]
            contact["address"] = ", ".join(parts) if parts else None

    elif user.role == "customer":
        result = await session.exec(select(CustomerProfile).where(CustomerProfile.user_id == user_id))
        profile = result.first()
        if profile:
            contact["phone_number"] = profile.phone_number or user.phone_number
            contact["profile_picture_url"] = profile.profile_picture_url
            contact["village"] = profile.village
            contact["mandal"] = profile.mandal
            contact["district"] = profile.district
            contact["state"] = profile.state
            parts = [p for p in [profile.house_no, profile.street, profile.village, profile.mandal, profile.district, profile.state, profile.pincode] if p]
            contact["address"] = ", ".join(parts) if parts else None

    return contact

@router.post("/", response_model=ShopOrderRead)
async def create_shop_order(
    order_in: ShopOrderCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new multi-item order with optional expense tracking.
    """
    buyer_id = None
    buyer_name = None
    if current_user.role == "farmer":
        buyer_id = current_user.id
        buyer_name = current_user.full_name
    elif order_in.farmer_id:
        buyer_id = order_in.farmer_id
        farmer_user = await session.get(User, order_in.farmer_id)
        buyer_name = farmer_user.full_name if farmer_user else None

    total_amount = 0.0
    db_items = []
    shop_id = None

    for item_in in order_in.items:
        product = await session.get(Product, item_in.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")

        if product.quantity < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

        if shop_id is None:
            shop_id = product.user_id
        elif shop_id != product.user_id:
            raise HTTPException(status_code=400, detail="Cannot mix products from different shops in one order")

        product.quantity -= item_in.quantity
        session.add(product)

        item_total = product.price * item_in.quantity
        total_amount += item_total

        db_item = ShopOrderItem(
            product_id=product.id,
            product_name=product.name,
            quantity=item_in.quantity,
            unit_price=product.price,
            subtotal=item_total
        )
        db_items.append(db_item)

    if not shop_id:
        raise HTTPException(status_code=400, detail="No valid products in order")

    final_amount = total_amount - order_in.discount
    if final_amount < 0:
        final_amount = 0

    # Calculate total expenses
    total_expenses = (
        order_in.expense_transportation
        + order_in.expense_labour
        + order_in.expense_other
    )

    order_status = "pending" if current_user.role == "farmer" else "completed"

    db_order = ShopOrder(
        shop_id=shop_id,
        farmer_id=buyer_id,
        farmer_name=buyer_name,
        total_amount=total_amount,
        discount=order_in.discount,
        final_amount=final_amount,
        payment_mode=order_in.payment_mode,
        status=order_status,
        total_expenses=total_expenses,
    )
    session.add(db_order)
    await session.commit()
    await session.refresh(db_order)

    for item in db_items:
        item.order_id = db_order.id
        session.add(item)

    # Persist expense record if any expense was provided
    if total_expenses > 0 or order_in.expense_notes:
        expense = ShopExpense(
            order_id=db_order.id,
            transportation=order_in.expense_transportation,
            labour=order_in.expense_labour,
            other=order_in.expense_other,
            notes=order_in.expense_notes,
        )
        session.add(expense)

    await session.commit()

    statement = select(ShopOrder).where(ShopOrder.id == db_order.id).options(selectinload(ShopOrder.items))
    result = await session.exec(statement)
    return result.one()


@router.get("/shop-orders", response_model=List[ShopOrderRead])
async def read_shop_orders(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != "shop":
        raise HTTPException(status_code=403, detail="Not authorized")

    statement = (
        select(ShopOrder)
        .where(ShopOrder.shop_id == current_user.id)
        .options(selectinload(ShopOrder.items))
        .order_by(ShopOrder.created_at.desc())
    )
    result = await session.exec(statement)
    orders = result.all()

    # Attach expense details to each order
    rich_orders = []
    for order in orders:
        exp_stmt = select(ShopExpense).where(ShopExpense.order_id == order.id)
        exp_result = await session.exec(exp_stmt)
        expense = exp_result.first()
        order_dict = order.dict()
        if expense:
            order_dict["expense"] = {
                "transportation": expense.transportation,
                "labour": expense.labour,
                "other": expense.other,
                "notes": expense.notes,
                "total": expense.transportation + expense.labour + expense.other,
            }
        else:
            order_dict["expense"] = None
        rich_orders.append(order_dict)

    return orders  # Return the ORM objects so response_model serialises correctly


@router.get("/shop-orders-detailed")
async def read_shop_orders_detailed(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Returns shop orders with full expense & profit breakdown + farmer contact info."""
    if current_user.role != "shop":
        raise HTTPException(status_code=403, detail="Not authorized")

    statement = (
        select(ShopOrder)
        .where(ShopOrder.shop_id == current_user.id)
        .options(selectinload(ShopOrder.items))
        .order_by(ShopOrder.created_at.desc())
    )
    result = await session.exec(statement)
    orders = result.all()

    detailed = []
    # Gather all product ids for cost_price lookup
    product_ids = {item.product_id for o in orders for item in o.items}
    prod_dict: dict = {}
    if product_ids:
        prod_stmt = select(Product).where(Product.id.in_(product_ids))
        prod_res = await session.exec(prod_stmt)
        prod_dict = {p.id: p for p in prod_res.all()}

    # Pre-fetch contact info for all unique farmer_ids
    farmer_ids = list({o.farmer_id for o in orders if o.farmer_id})
    farmer_contact_map: Dict[int, Optional[Dict]] = {}
    for fid in farmer_ids:
        farmer_contact_map[fid] = await get_user_contact_info(session, fid)

    for order in orders:
        exp_stmt = select(ShopExpense).where(ShopExpense.order_id == order.id)
        exp_result = await session.exec(exp_stmt)
        expense = exp_result.first()

        # Cost = sum of (cost_price * qty) for items
        total_cost = sum(
            (prod_dict.get(item.product_id).cost_price or 0) * item.quantity
            if prod_dict.get(item.product_id) else 0
            for item in order.items
        )
        transport = expense.transportation if expense and expense.transportation is not None else 0.0
        labour = expense.labour if expense and expense.labour is not None else 0.0
        other = expense.other if expense and expense.other is not None else 0.0
        total_expenses = transport + labour + other
        
        profit = (order.final_amount or 0.0) - total_cost - total_expenses

        detailed.append({
            "id": order.id,
            "shop_id": order.shop_id,
            "farmer_id": order.farmer_id,
            "farmer_name": order.farmer_name,
            "farmer_contact": farmer_contact_map.get(order.farmer_id) if order.farmer_id else None,
            "total_amount": order.total_amount,
            "discount": order.discount or 0.0,
            "final_amount": order.final_amount,
            "payment_mode": order.payment_mode,
            "payment_status": order.payment_status,
            "payment_id": order.payment_id,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "total_cost": total_cost,
            "total_expenses": total_expenses,
            "profit": profit,
            "expense": {
                "transportation": transport,
                "labour": labour,
                "other": other,
                "notes": expense.notes if expense else None,
                "total": transport + labour + other,
            },
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "subtotal": item.subtotal,
                    "cost_price": (prod_dict.get(item.product_id).cost_price or 0) if prod_dict.get(item.product_id) else 0,
                }
                for item in order.items
            ],
        })

    return detailed


@router.put("/{order_id}/status", response_model=ShopOrderRead)
async def update_order_status(
    order_id: int,
    update_data: ShopOrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Update order status and/or record associated expenses."""
    statement = (
        select(ShopOrder)
        .where(ShopOrder.id == order_id)
        .options(selectinload(ShopOrder.items))
    )
    result = await session.exec(statement)
    order = result.one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role == "shop" and order.shop_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role == "farmer":
        if order.farmer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this order")
        if update_data.status and update_data.status != "cancelled":
            raise HTTPException(status_code=403, detail="Farmers can only transition orders to cancelled")
        if order.status != "pending":
            raise HTTPException(status_code=400, detail="Cannot cancel an order that is no longer pending")

    # Update Status if provided
    if update_data.status:
        valid_statuses = ["pending", "confirmed", "dispatched", "completed", "cancelled"]
        if update_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

        # DISPATCH VALIDATION: payment must be received before dispatching
        if update_data.status == "dispatched" and order.payment_status != "paid":
            raise HTTPException(
                status_code=400, 
                detail="Cannot dispatch order without receiving payment first. Please mark payment as received."
            )

        # QUANTITY RESTORATION LOGIC
        if update_data.status == "cancelled" and order.status != "cancelled":
            for item in order.items:
                product = await session.get(Product, item.product_id)
                if product:
                    product.quantity += item.quantity
                    session.add(product)
        elif update_data.status != "cancelled" and order.status == "cancelled":
            for item in order.items:
                product = await session.get(Product, item.product_id)
                if product:
                    if product.quantity < item.quantity:
                        raise HTTPException(status_code=400, detail="Not enough stock to restore order")
                    product.quantity -= item.quantity
                    session.add(product)

        order.status = update_data.status

    # Update payment_status if provided (shop owner marking cash as received)
    if current_user.role == "shop" and update_data.payment_status is not None:
        if update_data.payment_status in ["paid", "pending"]:
            order.payment_status = update_data.payment_status

    # Update Discount if provided (shop owner giving discount during confirm)
    if current_user.role == "shop" and update_data.discount is not None:
        order.discount = update_data.discount
        order.final_amount = max(0, order.total_amount - order.discount)

    # Update/Record Expenses if provided (only for shopkeepers)
    if current_user.role == "shop" and (
        update_data.expense_transportation is not None or 
        update_data.expense_labour is not None or 
        update_data.expense_other is not None
    ):
        exp_stmt = select(ShopExpense).where(ShopExpense.order_id == order.id)
        exp_res = await session.exec(exp_stmt)
        expense = exp_res.first()

        if not expense:
            expense = ShopExpense(order_id=order.id)
            session.add(expense)

        if update_data.expense_transportation is not None:
            expense.transportation = update_data.expense_transportation
        if update_data.expense_labour is not None:
            expense.labour = update_data.expense_labour
        if update_data.expense_other is not None:
            expense.other = update_data.expense_other
        if update_data.expense_notes is not None:
            expense.notes = update_data.expense_notes

        # Sync cached total_expenses on the order
        order.total_expenses = expense.transportation + expense.labour + expense.other

    session.add(order)
    await session.commit()

    # Re-fetch with items for response serialization
    statement = select(ShopOrder).where(ShopOrder.id == order.id).options(selectinload(ShopOrder.items))
    result = await session.exec(statement)
    return result.one()


@router.get("/my-orders")
async def read_my_orders(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    statement = (
        select(ShopOrder)
        .where(ShopOrder.farmer_id == current_user.id)
        .options(selectinload(ShopOrder.items))
        .order_by(ShopOrder.created_at.desc())
    )
    result = await session.exec(statement)
    orders = result.all()

    rich_orders = []

    shop_ids = list({o.shop_id for o in orders})
    shop_dict = {}
    if shop_ids:
        shop_stmt = select(User).where(User.id.in_(shop_ids))
        shops_res = await session.exec(shop_stmt)
        shop_dict = {s.id: s.full_name for s in shops_res.all()}

    # Pre-fetch contact info for all unique shop_ids
    shop_contact_map: Dict[int, Optional[Dict]] = {}
    for sid in shop_ids:
        shop_contact_map[sid] = await get_user_contact_info(session, sid)

    product_ids = {item.product_id for order in orders for item in order.items}
    prod_dict = {}
    if product_ids:
        prod_stmt = select(Product).where(Product.id.in_(product_ids))
        prod_res = await session.exec(prod_stmt)
        prod_dict = {p.id: p for p in prod_res.all()}

    for o in orders:
        rich_items = []
        for item in o.items:
            prod = prod_dict.get(item.product_id)
            rich_items.append({
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
                "image_url": prod.image_url if prod else None,
                "product_image_url": prod.product_image_url if prod else None,
                "brand": prod.brand if prod else None,
                "manufacturer": prod.manufacturer if prod else None,
                # Composition for farmers to see
                "main_composition": prod.main_composition if prod else None,
            })

        rich_orders.append({
            "id": o.id,
            "shop_id": o.shop_id,
            "shop_name": shop_dict.get(o.shop_id, "Unknown Shop"),
            "shop_contact": shop_contact_map.get(o.shop_id),
            "farmer_id": o.farmer_id,
            "total_amount": o.total_amount,
            "discount": o.discount,
            "final_amount": o.final_amount,
            "payment_mode": o.payment_mode,
            "payment_status": o.payment_status,
            "payment_id": o.payment_id,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "items": rich_items,
        })

    return rich_orders
