from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from datetime import datetime, date, timedelta
import uuid

from ..database import get_session
from ..models import (
    User, Product,
    ManufacturerPurchase, ManufacturerPurchaseCreate,
    ProductionBatch, ProductionBatchCreate,
    ManufacturerSale, ManufacturerSaleCreate,
    ManufacturerExpense, ManufacturerExpenseCreate,
)
from ..deps import get_current_user

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


@router.get("/purchases", response_model=List[ManufacturerPurchase])
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
    return result.all()


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


@router.get("/sales", response_model=List[ManufacturerSale])
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
    return result.all()


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
