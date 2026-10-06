from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime, date, timedelta
import uuid

from ..database import get_session
from ..models import (
    User, UserRole, Product,
    ManufacturerPurchase, ManufacturerPurchaseCreate,
    ProductionBatch, ProductionBatchCreate,
    ManufacturerSale, ManufacturerSaleCreate,
    ManufacturerExpense, ManufacturerExpenseCreate,
    MillProfile, FarmerProfile,
    MillProcurementRequest, MillProcurementRequestCreate,
    MillProcurementRequestUpdate, MillProcurementRequestRead,
)
from ..deps import get_current_user
from ..utils import get_password_hash
from .orders import get_user_contact_info

router = APIRouter(prefix="/manufacturer", tags=["manufacturer"])


def check_manufacturer_role(user: User):
    if user.role != "manufacturer":
        raise HTTPException(status_code=403, detail="Not authorized as Manufacturer")


def _period_start(period: str) -> Optional[datetime]:
    now = datetime.utcnow()
    if period == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "7d":
        return now - timedelta(days=7)
    if period == "30d":
        return now - timedelta(days=30)
    if period == "90d":
        return now - timedelta(days=90)
    if period == "1y":
        return now - timedelta(days=365)
    return None  # "all"


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_manufacturer_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    uid = current_user.id

    # Stock
    raw_stock = (await session.exec(
        select(func.sum(Product.quantity))
        .where(Product.user_id == uid, Product.category == "raw_material")
    )).first() or 0

    finished_stock = (await session.exec(
        select(func.sum(Product.quantity))
        .where(Product.user_id == uid, Product.category == "processed")
    )).first() or 0

    # Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_purchases = (await session.exec(
        select(func.sum(ManufacturerPurchase.total_cost))
        .where(ManufacturerPurchase.manufacturer_id == uid, ManufacturerPurchase.date >= today_start)
    )).first() or 0.0

    today_sales = (await session.exec(
        select(func.sum(ManufacturerSale.total_amount))
        .where(ManufacturerSale.manufacturer_id == uid, ManufacturerSale.date >= today_start)
    )).first() or 0.0

    # Month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    month_revenue = (await session.exec(
        select(func.sum(ManufacturerSale.total_amount))
        .where(ManufacturerSale.manufacturer_id == uid, ManufacturerSale.date >= month_start)
    )).first() or 0.0

    month_purchases = (await session.exec(
        select(func.sum(ManufacturerPurchase.total_cost))
        .where(ManufacturerPurchase.manufacturer_id == uid, ManufacturerPurchase.date >= month_start)
    )).first() or 0.0

    month_processing = (await session.exec(
        select(func.sum(ProductionBatch.processing_cost))
        .where(ProductionBatch.manufacturer_id == uid, ProductionBatch.date >= month_start)
    )).first() or 0.0

    month_expenses = (await session.exec(
        select(func.sum(ManufacturerExpense.amount))
        .where(ManufacturerExpense.manufacturer_id == uid, ManufacturerExpense.created_at >= month_start)
    )).first() or 0.0

    net_profit = month_revenue - month_purchases - month_processing - month_expenses

    # Production stats
    total_batches = (await session.exec(
        select(func.count(ProductionBatch.id))
        .where(ProductionBatch.manufacturer_id == uid)
    )).first() or 0

    avg_efficiency_row = (await session.exec(
        select(func.avg(ProductionBatch.efficiency))
        .where(ProductionBatch.manufacturer_id == uid)
    )).first()
    avg_efficiency = round(float(avg_efficiency_row or 0), 1)

    return {
        "raw_stock": raw_stock,
        "finished_stock": finished_stock,
        "today_purchases": today_purchases,
        "today_sales": today_sales,
        "month_revenue": month_revenue,
        "month_purchases": month_purchases,
        "net_profit": net_profit,
        "total_batches": total_batches,
        "avg_efficiency": avg_efficiency,
    }


# ── Sales Trend ───────────────────────────────────────────────────────────────

@router.get("/sales-trend")
async def get_sales_trend(
    period: str = Query("7d"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    start = _period_start(period)
    stmt = select(ManufacturerSale).where(ManufacturerSale.manufacturer_id == current_user.id)
    if start:
        stmt = stmt.where(ManufacturerSale.date >= start)
    result = await session.exec(stmt)
    sales = result.all()

    daily: dict = {}
    for s in sales:
        day = s.date.strftime("%Y-%m-%d") if hasattr(s.date, "strftime") else str(s.date)[:10]
        daily[day] = daily.get(day, 0) + float(s.total_amount)

    trend = [{"date": d, "sales": round(v, 2)} for d, v in sorted(daily.items())]
    return trend


# ── Purchases ────────────────────────────────────────────────────────────────

@router.post("/purchases", response_model=ManufacturerPurchase)
async def create_purchase(
    purchase_in: ManufacturerPurchaseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)

    total_cost = (purchase_in.quantity * purchase_in.price_per_unit) + purchase_in.transport_cost
    batch_id = f"M-PUR-{uuid.uuid4().hex[:6].upper()}"

    db_purchase = ManufacturerPurchase(
        manufacturer_id=current_user.id,
        farmer_id=purchase_in.farmer_id,
        farmer_name=purchase_in.farmer_name,
        crop_name=purchase_in.crop_name,
        quantity=purchase_in.quantity,
        unit=purchase_in.unit,
        price_per_unit=purchase_in.price_per_unit,
        total_cost=total_cost,
        transport_cost=purchase_in.transport_cost,
        quality_grade=purchase_in.quality_grade,
        batch_id=batch_id
    )
    session.add(db_purchase)

    new_product = Product(
        user_id=current_user.id,
        name=f"Raw {purchase_in.crop_name}",
        category="raw_material",
        brand=purchase_in.farmer_name,
        price=0,
        cost_price=purchase_in.price_per_unit,
        quantity=purchase_in.quantity,
        unit=purchase_in.unit,
        batch_number=batch_id,
        description=f"Purchased from {purchase_in.farmer_name}",
        traceability_json="{}"
    )
    session.add(new_product)

    await session.commit()
    await session.refresh(db_purchase)
    return db_purchase


@router.get("/purchases")
async def get_purchases(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    result = await session.exec(
        select(ManufacturerPurchase)
        .where(ManufacturerPurchase.manufacturer_id == current_user.id)
        .order_by(ManufacturerPurchase.date.desc())
    )
    purchases = result.all()

    # Enrich with farmer contact info
    farmer_ids = list({p.farmer_id for p in purchases if p.farmer_id})
    farmer_contact_map: Dict[int, dict] = {}
    for fid in farmer_ids:
        contact = await get_user_contact_info(session, fid)
        if contact:
            farmer_contact_map[fid] = contact

    enriched = []
    for p in purchases:
        p_dict = {
            "id": p.id,
            "manufacturer_id": p.manufacturer_id,
            "farmer_id": p.farmer_id,
            "farmer_name": p.farmer_name,
            "farmer_contact": farmer_contact_map.get(p.farmer_id) if p.farmer_id else None,
            "crop_name": p.crop_name,
            "quantity": p.quantity,
            "unit": p.unit,
            "price_per_unit": p.price_per_unit,
            "total_cost": p.total_cost,
            "transport_cost": p.transport_cost,
            "quality_grade": p.quality_grade,
            "batch_id": p.batch_id,
            "date": p.date.isoformat() if p.date else None,
        }
        enriched.append(p_dict)

    return enriched


# ── Production ────────────────────────────────────────────────────────────────

@router.post("/production", response_model=ProductionBatch)
async def create_production_batch(
    batch_in: ProductionBatchCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)

    input_product = await session.get(Product, batch_in.input_product_id)
    if not input_product or input_product.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Input product not found")
    if input_product.quantity < batch_in.input_qty:
        raise HTTPException(status_code=400, detail="Insufficient raw material stock")

    input_product.quantity -= batch_in.input_qty
    session.add(input_product)

    batch_num = f"M-PROD-{uuid.uuid4().hex[:6].upper()}"
    efficiency = (batch_in.output_qty / batch_in.input_qty) * 100 if batch_in.input_qty > 0 else 0
    waste = max(0, batch_in.input_qty - batch_in.output_qty)

    db_batch = ProductionBatch(
        manufacturer_id=current_user.id,
        input_product_id=batch_in.input_product_id,
        input_qty=batch_in.input_qty,
        output_product_name=batch_in.output_product_name,
        output_qty=batch_in.output_qty,
        output_unit=batch_in.output_unit,
        processing_cost=batch_in.processing_cost,
        waste_qty=waste,
        efficiency=efficiency,
        batch_number=batch_num
    )
    session.add(db_batch)

    raw_cost = (input_product.cost_price or 0) * batch_in.input_qty
    total_batch_cost = raw_cost + batch_in.processing_cost
    unit_cost = total_batch_cost / batch_in.output_qty if batch_in.output_qty > 0 else 0

    finished_product = Product(
        user_id=current_user.id,
        name=batch_in.output_product_name,
        category="processed",
        brand=current_user.full_name,
        price=unit_cost * 1.2,
        cost_price=unit_cost,
        quantity=batch_in.output_qty,
        unit=batch_in.output_unit,
        batch_number=batch_num,
        description=f"Processed from {input_product.name}",
    )
    session.add(finished_product)

    await session.commit()
    await session.refresh(db_batch)
    return db_batch


@router.get("/production", response_model=List[ProductionBatch])
async def get_production_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    result = await session.exec(
        select(ProductionBatch)
        .where(ProductionBatch.manufacturer_id == current_user.id)
        .order_by(ProductionBatch.date.desc())
    )
    return result.all()


# ── Sales / Orders ────────────────────────────────────────────────────────────

@router.post("/sales", response_model=ManufacturerSale)
async def create_sale(
    sale_in: ManufacturerSaleCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)

    product = await session.get(Product, sale_in.product_id)
    if not product or product.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.quantity < sale_in.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    product.quantity -= sale_in.quantity
    session.add(product)

    total = (sale_in.quantity * sale_in.selling_price) - sale_in.discount
    invoice_id = f"INV-{uuid.uuid4().hex[:6].upper()}"

    db_sale = ManufacturerSale(
        manufacturer_id=current_user.id,
        buyer_type=sale_in.buyer_type,
        buyer_id=sale_in.buyer_id,
        buyer_name=sale_in.buyer_name,
        product_id=sale_in.product_id,
        quantity=sale_in.quantity,
        selling_price=sale_in.selling_price,
        discount=sale_in.discount,
        total_amount=total,
        payment_mode=sale_in.payment_mode,
        invoice_id=invoice_id
    )
    session.add(db_sale)

    await session.commit()
    await session.refresh(db_sale)
    return db_sale


@router.get("/sales")
async def get_sales_history(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    result = await session.exec(
        select(ManufacturerSale)
        .where(ManufacturerSale.manufacturer_id == current_user.id)
        .order_by(ManufacturerSale.date.desc())
    )
    sales = result.all()

    # Enrich with buyer contact info
    buyer_ids = list({s.buyer_id for s in sales if s.buyer_id})
    buyer_contact_map: Dict[int, dict] = {}
    for bid in buyer_ids:
        contact = await get_user_contact_info(session, bid)
        if contact:
            buyer_contact_map[bid] = contact

    enriched = []
    for s in sales:
        s_dict = {
            "id": s.id,
            "manufacturer_id": s.manufacturer_id,
            "buyer_type": s.buyer_type,
            "buyer_id": s.buyer_id,
            "buyer_name": s.buyer_name,
            "buyer_contact": buyer_contact_map.get(s.buyer_id) if s.buyer_id else None,
            "product_id": s.product_id,
            "quantity": s.quantity,
            "selling_price": s.selling_price,
            "discount": s.discount,
            "total_amount": s.total_amount,
            "payment_mode": s.payment_mode,
            "invoice_id": s.invoice_id,
            "delivery_status": s.delivery_status,
            "date": s.date.isoformat() if s.date else None,
        }
        enriched.append(s_dict)

    return enriched


@router.patch("/sales/{sale_id}/status")
async def update_sale_delivery_status(
    sale_id: int,
    body: dict,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    sale = await session.get(ManufacturerSale, sale_id)
    if not sale or sale.manufacturer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sale not found")
    new_status = body.get("delivery_status", "pending")
    sale.delivery_status = new_status
    session.add(sale)
    await session.commit()
    await session.refresh(sale)
    return sale


# ── Accounting ────────────────────────────────────────────────────────────────

@router.get("/accounting/summary")
async def get_accounting_summary(
    period: str = Query("30d"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    uid = current_user.id
    start = _period_start(period)

    def date_filter(col, s):
        return col >= s if s else True

    # Revenue
    rev_q = select(func.sum(ManufacturerSale.total_amount)).where(ManufacturerSale.manufacturer_id == uid)
    if start:
        rev_q = rev_q.where(ManufacturerSale.date >= start)
    total_revenue = (await session.exec(rev_q)).first() or 0.0

    # Purchase cost
    pur_q = select(func.sum(ManufacturerPurchase.total_cost)).where(ManufacturerPurchase.manufacturer_id == uid)
    if start:
        pur_q = pur_q.where(ManufacturerPurchase.date >= start)
    total_purchase_cost = (await session.exec(pur_q)).first() or 0.0

    # Processing cost
    proc_q = select(func.sum(ProductionBatch.processing_cost)).where(ProductionBatch.manufacturer_id == uid)
    if start:
        proc_q = proc_q.where(ProductionBatch.date >= start)
    total_processing_cost = (await session.exec(proc_q)).first() or 0.0

    # Expenses
    exp_q = select(ManufacturerExpense).where(ManufacturerExpense.manufacturer_id == uid)
    if start:
        exp_q = exp_q.where(ManufacturerExpense.created_at >= start)
    expenses = (await session.exec(exp_q)).all()

    total_expenses = sum(e.amount for e in expenses)
    expense_by_category: dict = {}
    for e in expenses:
        expense_by_category[e.category] = expense_by_category.get(e.category, 0) + e.amount

    net_profit = total_revenue - total_purchase_cost - total_processing_cost - total_expenses

    # Order counts
    sale_q = select(ManufacturerSale).where(ManufacturerSale.manufacturer_id == uid)
    if start:
        sale_q = sale_q.where(ManufacturerSale.date >= start)
    all_sales = (await session.exec(sale_q)).all()
    total_sales_count = len(all_sales)
    avg_sale_value = (total_revenue / total_sales_count) if total_sales_count > 0 else 0.0

    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "total_purchase_cost": round(total_purchase_cost, 2),
        "total_processing_cost": round(total_processing_cost, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "total_sales_count": total_sales_count,
        "avg_sale_value": round(avg_sale_value, 2),
        "expense_by_category": {k: round(v, 2) for k, v in expense_by_category.items()},
    }


@router.get("/accounting/expenses")
async def get_expenses(
    period: str = Query("30d"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    start = _period_start(period)
    q = select(ManufacturerExpense).where(ManufacturerExpense.manufacturer_id == current_user.id)
    if start:
        q = q.where(ManufacturerExpense.created_at >= start)
    q = q.order_by(ManufacturerExpense.created_at.desc())
    result = await session.exec(q)
    return result.all()


@router.post("/accounting/expenses")
async def add_expense(
    expense_in: ManufacturerExpenseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    db_expense = ManufacturerExpense(
        manufacturer_id=current_user.id,
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description,
        expense_date=expense_in.expense_date or date.today(),
    )
    session.add(db_expense)
    await session.commit()
    await session.refresh(db_expense)
    return db_expense


# ── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics(
    period: str = Query("30d"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    uid = current_user.id
    start = _period_start(period)

    # Revenue
    rev_q = select(func.sum(ManufacturerSale.total_amount)).where(ManufacturerSale.manufacturer_id == uid)
    if start:
        rev_q = rev_q.where(ManufacturerSale.date >= start)
    total_revenue = float((await session.exec(rev_q)).first() or 0)

    # Purchase cost
    pur_q = select(func.sum(ManufacturerPurchase.total_cost)).where(ManufacturerPurchase.manufacturer_id == uid)
    if start:
        pur_q = pur_q.where(ManufacturerPurchase.date >= start)
    total_purchase_cost = float((await session.exec(pur_q)).first() or 0)

    # Processing cost
    proc_q = select(func.sum(ProductionBatch.processing_cost)).where(ProductionBatch.manufacturer_id == uid)
    if start:
        proc_q = proc_q.where(ProductionBatch.date >= start)
    total_processing_cost = float((await session.exec(proc_q)).first() or 0)

    # Other expenses
    exp_q = select(func.sum(ManufacturerExpense.amount)).where(ManufacturerExpense.manufacturer_id == uid)
    if start:
        exp_q = exp_q.where(ManufacturerExpense.created_at >= start)
    total_expenses = float((await session.exec(exp_q)).first() or 0)

    net_profit = total_revenue - total_purchase_cost - total_processing_cost - total_expenses
    profit_margin = round((net_profit / total_revenue * 100), 1) if total_revenue > 0 else 0.0

    # Total sales count
    sc_q = select(func.count(ManufacturerSale.id)).where(ManufacturerSale.manufacturer_id == uid)
    if start:
        sc_q = sc_q.where(ManufacturerSale.date >= start)
    total_sales_count = int((await session.exec(sc_q)).first() or 0)
    avg_sale_value = round(total_revenue / total_sales_count, 2) if total_sales_count > 0 else 0.0

    # Avg efficiency
    eff_q = select(func.avg(ProductionBatch.efficiency)).where(ProductionBatch.manufacturer_id == uid)
    if start:
        eff_q = eff_q.where(ProductionBatch.date >= start)
    avg_efficiency = round(float((await session.exec(eff_q)).first() or 0), 1)

    # Top crops bought (by total cost)
    pur_rows_q = select(ManufacturerPurchase).where(ManufacturerPurchase.manufacturer_id == uid)
    if start:
        pur_rows_q = pur_rows_q.where(ManufacturerPurchase.date >= start)
    pur_rows = (await session.exec(pur_rows_q)).all()

    crop_map: dict = {}
    for p in pur_rows:
        key = p.crop_name
        if key not in crop_map:
            crop_map[key] = {"crop_name": key, "total_cost": 0.0, "total_qty": 0.0, "count": 0}
        crop_map[key]["total_cost"] += float(p.total_cost)
        crop_map[key]["total_qty"] += float(p.quantity)
        crop_map[key]["count"] += 1
    top_crops = sorted(crop_map.values(), key=lambda x: x["total_cost"], reverse=True)[:10]

    # Top products sold (by revenue)
    sale_rows_q = select(ManufacturerSale).where(ManufacturerSale.manufacturer_id == uid)
    if start:
        sale_rows_q = sale_rows_q.where(ManufacturerSale.date >= start)
    sale_rows = (await session.exec(sale_rows_q)).all()

    # Get product names
    product_ids = list({s.product_id for s in sale_rows})
    prod_name_map: dict = {}
    for pid in product_ids:
        prod = await session.get(Product, pid)
        if prod:
            prod_name_map[pid] = prod.name

    prod_map: dict = {}
    for s in sale_rows:
        pid = s.product_id
        name = prod_name_map.get(pid, f"Product #{pid}")
        if pid not in prod_map:
            prod_map[pid] = {"product_id": pid, "product_name": name, "revenue": 0.0, "units_sold": 0.0, "count": 0}
        prod_map[pid]["revenue"] += float(s.total_amount)
        prod_map[pid]["units_sold"] += float(s.quantity)
        prod_map[pid]["count"] += 1
    top_products = sorted(prod_map.values(), key=lambda x: x["revenue"], reverse=True)[:10]

    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "total_purchase_cost": round(total_purchase_cost, 2),
        "total_processing_cost": round(total_processing_cost, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "profit_margin": profit_margin,
        "total_sales_count": total_sales_count,
        "avg_sale_value": avg_sale_value,
        "avg_efficiency": avg_efficiency,
        "top_crops": top_crops,
        "top_products": top_products,
    }


@router.delete("/accounting/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    check_manufacturer_role(current_user)
    expense = await session.get(ManufacturerExpense, expense_id)
    if not expense or expense.manufacturer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    await session.delete(expense)
    await session.commit()
    return {"ok": True}


# ─────────────────────────────────────────────────────────────────────────────
# Mill Marketplace & Direct Procurement Requests
# ─────────────────────────────────────────────────────────────────────────────

INITIAL_VERIFIED_MILLS = [
    {
        "email": "mill.lakshmi@agriflow.in",
        "phone": "9876543210",
        "full_name": "Sri Lakshmi Agro Industries",
        "mill_name": "Sri Lakshmi Narasimha Modern Rice Mill",
        "mill_type": "Modern Rice Mill",
        "crops_accepted": "Paddy, Basmati, Sona Masoori, Raw Rice",
        "price_offered_text": "₹2,250 - ₹2,480 / Quintal",
        "daily_capacity": "150 Tons/Day",
        "village": "Armoor Industrial Park",
        "mandal": "Armoor",
        "district": "Nizamabad",
        "state": "Telangana",
        "pincode": "503224",
        "rating": 4.9,
    },
    {
        "email": "mill.kisan@agriflow.in",
        "phone": "9988776655",
        "full_name": "Kisan Agro Processing Co.",
        "mill_name": "Kisan Mega Food & Flour Processing Unit",
        "mill_type": "Flour & Grain Mill",
        "crops_accepted": "Wheat, Barley, Maize, Gram",
        "price_offered_text": "₹2,180 - ₹2,350 / Quintal",
        "daily_capacity": "250 Tons/Day",
        "village": "GT Road Industrial Area",
        "mandal": "Karnal",
        "district": "Karnal",
        "state": "Haryana",
        "pincode": "132001",
        "rating": 4.8,
    },
    {
        "email": "mill.annapurna@agriflow.in",
        "phone": "9123456789",
        "full_name": "Annapurna Agro Processors",
        "mill_name": "Annapurna Pulse & Dal Processing Industries",
        "mill_type": "Dal & Pulse Mill",
        "crops_accepted": "Toor Dal, Chana, Moong, Urad",
        "price_offered_text": "₹6,400 - ₹6,800 / Quintal",
        "daily_capacity": "80 Tons/Day",
        "village": "Sanwer Road Sector C",
        "mandal": "Indore",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "pincode": "452015",
        "rating": 4.9,
    },
    {
        "email": "mill.cotton@agriflow.in",
        "phone": "8899001122",
        "full_name": "Kakatiya Fibres Ltd",
        "mill_name": "Warangal Agro Cotton Ginning & Pressing Mill",
        "mill_type": "Cotton Ginning Mill",
        "crops_accepted": "Cotton, Kapas, Hybrid Cotton",
        "price_offered_text": "₹7,100 - ₹7,450 / Quintal",
        "daily_capacity": "500 Bales/Day",
        "village": "Enumamula Market Complex",
        "mandal": "Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "pincode": "506005",
        "rating": 4.7,
    },
    {
        "email": "mill.oil@agriflow.in",
        "phone": "9765432109",
        "full_name": "Shree Ganesh Oil Industries",
        "mill_name": "Marathwada Bio-Oil & Seed Extraction Mill",
        "mill_type": "Oil Extraction Mill",
        "crops_accepted": "Soybean, Mustard, Sunflower, Groundnut",
        "price_offered_text": "₹4,600 - ₹5,200 / Quintal",
        "daily_capacity": "120 Tons/Day",
        "village": "MIDC Phase 2",
        "mandal": "Latur",
        "district": "Latur",
        "state": "Maharashtra",
        "pincode": "413531",
        "rating": 4.8,
    },
]

async def _ensure_seed_mills(session: AsyncSession):
    """Seed sample verified mills if fewer than 2 exist in the database."""
    count_stmt = select(func.count(MillProfile.id))
    count = (await session.exec(count_stmt)).first() or 0
    if count >= 3:
        return

    pwd_hash = get_password_hash("password123")
    for m in INITIAL_VERIFIED_MILLS:
        existing_user = (await session.exec(select(User).where(User.email == m["email"]))).first()
        if not existing_user:
            existing_user = User(
                email=m["email"],
                phone_number=m["phone"],
                full_name=m["full_name"],
                role="manufacturer",
                is_active=True,
                hashed_password=pwd_hash,
            )
            session.add(existing_user)
            await session.flush()

        existing_prof = (await session.exec(select(MillProfile).where(MillProfile.user_id == existing_user.id))).first()
        if not existing_prof:
            prof = MillProfile(
                user_id=existing_user.id,
                mill_name=m["mill_name"],
                license_number=f"REG-MILL-{m['pincode']}-01",
                mill_id=f"M-{m['pincode']}",
                father_name="Director",
                owner_name=m["full_name"],
                contact_number=m["phone"],
                phone_number=m["phone"],
                village=m["village"],
                mandal=m["mandal"],
                district=m["district"],
                state=m["state"],
                pincode=m["pincode"],
                mill_type=m["mill_type"],
                crops_accepted=m["crops_accepted"],
                price_offered_text=m["price_offered_text"],
                daily_capacity=m["daily_capacity"],
                is_verified=True,
                rating=m["rating"],
                bank_name="State Bank of India",
                account_number="9876543210123",
                ifsc_code="SBIN0001234"
            )
            session.add(prof)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()


@router.get("/mills/marketplace")
async def get_mills_marketplace(
    search: Optional[str] = None,
    crop: Optional[str] = None,
    mill_type: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Returns verified mills and processing units for farmers to connect and sell harvests directly.
    Computes approximate distance based on farmer's location profile.
    """
    await _ensure_seed_mills(session)

    farmer_district = None
    farmer_state = None
    if current_user.role == "farmer":
        farmer_prof = (await session.exec(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))).first()
        if farmer_prof:
            farmer_district = (farmer_prof.district or "").strip().lower()
            farmer_state = (farmer_prof.state or "").strip().lower()

    stmt = select(MillProfile, User).join(User, MillProfile.user_id == User.id)
    results = (await session.exec(stmt)).all()

    mills_data = []
    for profile, user in results:
        m_name = (profile.mill_name or "").lower()
        m_dist = (profile.district or "").lower()
        m_state = (profile.state or "").lower()
        m_type = (getattr(profile, "mill_type", None) or "Modern Processing Mill").lower()
        m_crops = (getattr(profile, "crops_accepted", None) or "").lower()

        if search:
            s = search.lower().strip()
            if not (s in m_name or s in m_dist or s in m_state or s in m_type or s in m_crops):
                continue
        if crop and crop.lower().strip() not in m_crops and crop.lower().strip() not in m_name:
            continue
        if mill_type and mill_type.lower().strip() not in m_type:
            continue
        if state and state.lower().strip() not in m_state:
            continue
        if district and district.lower().strip() not in m_dist:
            continue

        # Distance estimation
        dist_str = "12 km"
        if farmer_district and m_dist:
            if farmer_district == m_dist:
                dist_str = "8 - 14 km"
            elif farmer_state and farmer_state == m_state:
                dist_str = "35 - 55 km"
            else:
                dist_str = "120+ km"
        elif farmer_state and m_state:
            dist_str = "45 km" if farmer_state == m_state else "150+ km"

        location_parts = [p for p in [profile.village, profile.mandal, profile.district, profile.state] if p]
        full_location = ", ".join(location_parts) if location_parts else (profile.location_text or "Regional Agri Hub")

        phone = profile.phone_number or profile.contact_number or user.phone_number or "+91 9876543210"

        mills_data.append({
            "id": profile.id,
            "mill_id": profile.id,
            "user_id": profile.user_id,
            "name": profile.mill_name,
            "mill_name": profile.mill_name,
            "type": getattr(profile, "mill_type", None) or "Modern Processing Mill",
            "owner_name": profile.owner_name or user.full_name or "Authorized Mill Manager",
            "location": full_location,
            "district": profile.district or "",
            "state": profile.state or "",
            "distance": dist_str,
            "phone": phone,
            "verified": getattr(profile, "is_verified", True),
            "rating": getattr(profile, "rating", 4.8),
            "price_offered": getattr(profile, "price_offered_text", None) or "₹2,200 - ₹2,550/Quintal",
            "capacity": getattr(profile, "daily_capacity", None) or "150 Tons/Day",
            "crops_accepted": getattr(profile, "crops_accepted", None) or "Paddy, Wheat, Pulses",
            "license_number": profile.license_number or "AGRI-MILL-CERT",
        })

    return mills_data


@router.post("/procurement-requests", response_model=MillProcurementRequestRead)
async def create_procurement_request(
    request_in: MillProcurementRequestCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Farmer sends a direct harvest supply / sell request to a mill.
    """
    # Fetch farmer profile for contact details
    farmer_prof = (await session.exec(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))).first()
    farmer_phone = current_user.phone_number or ""
    farmer_location = None
    if farmer_prof:
        if not farmer_phone and farmer_prof.phone_number:
            farmer_phone = farmer_prof.phone_number
        loc_parts = [p for p in [farmer_prof.village, farmer_prof.mandal, farmer_prof.district, farmer_prof.state] if p]
        farmer_location = ", ".join(loc_parts) if loc_parts else None

    # Check mill exists: request_in.mill_id could be user_id or mill_profile.id
    mill_user = await session.get(User, request_in.mill_id)
    mill_prof = (await session.exec(select(MillProfile).where(MillProfile.user_id == request_in.mill_id))).first()
    if not mill_prof:
        mill_prof = await session.get(MillProfile, request_in.mill_id)
        if mill_prof:
            mill_user = await session.get(User, mill_prof.user_id)

    if not mill_prof or not mill_user:
        raise HTTPException(status_code=404, detail="Selected mill not found")

    new_req = MillProcurementRequest(
        mill_id=mill_user.id,
        farmer_id=current_user.id,
        crop_id=request_in.crop_id,
        crop_name=request_in.crop_name,
        quantity=request_in.quantity,
        unit=request_in.unit or "quintal",
        expected_price_per_unit=request_in.expected_price_per_unit,
        quality_grade=request_in.quality_grade or "Grade A",
        moisture_content=request_in.moisture_content,
        harvest_date=request_in.harvest_date,
        farmer_name=current_user.full_name or "Farmer Partner",
        farmer_phone=farmer_phone or "Unspecified",
        farmer_location=farmer_location or "Local Farmland",
        notes=request_in.notes,
        status="pending"
    )
    session.add(new_req)
    await session.commit()
    await session.refresh(new_req)

    return MillProcurementRequestRead(
        **new_req.dict(),
        mill_name=mill_prof.mill_name,
        mill_phone=mill_prof.phone_number or mill_prof.contact_number or mill_user.phone_number,
        mill_location=f"{mill_prof.district or ''}, {mill_prof.state or ''}".strip(", ")
    )


@router.get("/procurement-requests/my", response_model=List[MillProcurementRequestRead])
async def get_my_procurement_requests(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Farmer views all sell requests they have sent to mills.
    """
    stmt = (
        select(MillProcurementRequest)
        .where(MillProcurementRequest.farmer_id == current_user.id)
        .order_by(MillProcurementRequest.created_at.desc())
    )
    reqs = (await session.exec(stmt)).all()

    # Pre-fetch mill profiles to prevent N+1 queries
    mill_ids = list({r.mill_id for r in reqs})
    mill_map = {}
    if mill_ids:
        mills = (await session.exec(select(MillProfile).where(MillProfile.user_id.in_(mill_ids)))).all()
        for m in mills:
            mill_map[m.user_id] = m

    result = []
    for r in reqs:
        m = mill_map.get(r.mill_id)
        result.append(MillProcurementRequestRead(
            **r.dict(),
            mill_name=m.mill_name if m else f"Mill #{r.mill_id}",
            mill_phone=m.phone_number or m.contact_number if m else None,
            mill_location=f"{m.district or ''}, {m.state or ''}".strip(", ") if m else None
        ))
    return result


@router.delete("/procurement-requests/{request_id}")
async def cancel_procurement_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Farmer can cancel/delete their pending supply request.
    """
    req = await session.get(MillProcurementRequest, request_id)
    if not req or req.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
    await session.delete(req)
    await session.commit()
    return {"ok": True, "message": "Procurement request cancelled successfully"}


@router.get("/procurement-requests/inbound", response_model=List[MillProcurementRequestRead])
async def get_inbound_procurement_requests(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Mill owner views incoming harvest supply requests from farmers.
    """
    check_manufacturer_role(current_user)
    stmt = (
        select(MillProcurementRequest)
        .where(MillProcurementRequest.mill_id == current_user.id)
    )
    if status and status != "all":
        stmt = stmt.where(MillProcurementRequest.status == status)
    stmt = stmt.order_by(MillProcurementRequest.created_at.desc())
    reqs = (await session.exec(stmt)).all()

    return [MillProcurementRequestRead(**r.dict()) for r in reqs]


@router.post("/procurement-requests/{request_id}/accept")
async def accept_procurement_request(
    request_id: int,
    update_data: Optional[MillProcurementRequestUpdate] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Mill accepts a farmer's procurement request.
    Optionally updates offered_price_per_unit.
    Automatically records a ManufacturerPurchase and adds to raw materials!
    """
    check_manufacturer_role(current_user)
    req = await session.get(MillProcurementRequest, request_id)
    if not req or req.mill_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    agreed_price = req.expected_price_per_unit
    if update_data and update_data.offered_price_per_unit:
        agreed_price = update_data.offered_price_per_unit
        req.offered_price_per_unit = agreed_price

    if update_data and update_data.notes:
        req.notes = f"{req.notes or ''} | Note: {update_data.notes}".strip(" |")

    req.status = "accepted"
    req.updated_at = datetime.utcnow()
    session.add(req)

    # Automatically create ManufacturerPurchase
    batch_id = f"M-PUR-{uuid.uuid4().hex[:6].upper()}"
    total_cost = req.quantity * agreed_price

    purchase = ManufacturerPurchase(
        manufacturer_id=current_user.id,
        farmer_id=req.farmer_id,
        farmer_name=req.farmer_name,
        crop_name=req.crop_name,
        quantity=req.quantity,
        unit=req.unit,
        price_per_unit=agreed_price,
        total_cost=total_cost,
        transport_cost=0.0,
        quality_grade=req.quality_grade,
        batch_id=batch_id,
        date=datetime.utcnow()
    )
    session.add(purchase)

    # Register raw material in inventory
    raw_prod = Product(
        user_id=current_user.id,
        name=f"Raw {req.crop_name}",
        category="raw_material",
        brand=req.farmer_name,
        price=0,
        cost_price=agreed_price,
        quantity=req.quantity,
        unit=req.unit,
        batch_number=batch_id,
        description=f"Direct Procurement from {req.farmer_name} ({req.farmer_phone})",
        traceability_json="{}"
    )
    session.add(raw_prod)

    await session.commit()
    await session.refresh(req)

    return {
        "ok": True,
        "message": f"Harvest offer accepted. Created purchase batch {batch_id} for ₹{total_cost:,.2f}",
        "batch_id": batch_id,
        "request": MillProcurementRequestRead(**req.dict())
    }


@router.post("/procurement-requests/{request_id}/reject")
async def reject_procurement_request(
    request_id: int,
    update_data: Optional[MillProcurementRequestUpdate] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Mill declines a farmer's procurement request with reason.
    """
    check_manufacturer_role(current_user)
    req = await session.get(MillProcurementRequest, request_id)
    if not req or req.mill_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = "rejected"
    if update_data and update_data.rejection_reason:
        req.rejection_reason = update_data.rejection_reason
    req.updated_at = datetime.utcnow()
    session.add(req)
    await session.commit()
    await session.refresh(req)
    return {"ok": True, "message": "Request declined", "request": MillProcurementRequestRead(**req.dict())}

