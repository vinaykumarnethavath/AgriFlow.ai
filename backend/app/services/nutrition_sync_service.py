import re
from datetime import datetime
from typing import Optional, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, col
from app.models.crop import Crop, CropExpense
from app.models.plot_nutrition import PlotSoilData, FertilizerApplication
from app.models.farmer import LandRecord

FERTILIZER_KEYWORDS = [
    "urea", "dap", "npk", "potash", "mop", "ssp", "fertilizer", "fertiliser",
    "ammonium", "sulphate", "sulfate", "compost", "vermicompost", "manure", "fym",
    "zinc", "boron", "lime", "gypsum", "phosphate", "micronutrient", "micronutrients",
    "neem cake", "potassium", "nitrogen", "phosphorus", "super phosphate", "19:19:19",
    "20:20:0", "nutri"
]

def is_fertilizer_expense(expense: CropExpense) -> bool:
    category = (expense.category or "").lower().strip()
    exp_type = (expense.type or "").lower().strip()
    notes = (expense.notes or "").lower().strip()

    if category in ["fertilizer", "fertiliser", "fertilizers", "fertilisers", "nutrition"]:
        return True

    combined_text = f"{exp_type} {notes}"
    for kw in FERTILIZER_KEYWORDS:
        if kw in combined_text:
            return True

    return False

def extract_fertilizer_details(expense: CropExpense) -> dict:
    """
    Extracts standardized fertilizer name, quantity, unit, and method from a CropExpense.
    Handles units like 'bags', 'bag', 'kg', 'liters', 'tons'.
    """
    fertilizer_name = (expense.type or "").strip()
    if not fertilizer_name:
        fertilizer_name = "Fertilizer Application"
    
    qty = float(expense.quantity) if expense.quantity else 1.0
    unit = (expense.unit or "kg").strip().lower()
    
    # Normalize unit
    if unit in ["bags", "bag", "b"]:
        unit = "bags"
    elif unit in ["kg", "kgs", "kilogram", "kilograms"]:
        unit = "kg"
    elif unit in ["tons", "ton", "t"]:
        unit = "tons"
    elif unit in ["liters", "liter", "l", "ltr", "litres", "litre"]:
        unit = "liters"
    elif unit in ["quintal", "quintals", "qtl"]:
        unit = "quintals"

    # Infer application method from stage or notes
    notes_text = f"{expense.stage or ''} {expense.notes or ''}".lower()
    if any(k in notes_text for k in ["fertigation", "drip"]):
        method = "Fertigation"
    elif any(k in notes_text for k in ["spray", "foliar"]):
        method = "Foliar spray"
    elif any(k in notes_text for k in ["band", "placement"]):
        method = "Band placement"
    elif any(k in notes_text for k in ["top dress", "top-dressing", "dressing"]):
        method = "Top dressing"
    else:
        method = "Broadcasting"

    app_date = expense.date if expense.date else datetime.utcnow()
    if hasattr(app_date, "tzinfo") and app_date.tzinfo:
        app_date = app_date.replace(tzinfo=None)

    cost_str = f" • Rs.{expense.total_cost:,.0f}" if expense.total_cost else ""
    unit_size_str = f" ({expense.unit_size} kg/bag)" if expense.unit_size and expense.unit_size != 1.0 and unit == "bags" else ""
    desc = f"From crop expense: {expense.category} - {expense.type}{unit_size_str}{cost_str}"

    return {
        "fertilizer_name": fertilizer_name,
        "quantity": qty,
        "unit": unit,
        "application_date": app_date,
        "application_method": method,
        "notes": desc,
    }

async def _exec_stmt(session, stmt):
    if hasattr(session, "exec"):
        return await session.exec(stmt)
    res = await session.execute(stmt)
    return res.scalars()

async def sync_single_crop_expense(
    session,
    expense: CropExpense,
    crop_id: int,
    user_id: int
) -> Optional[FertilizerApplication]:
    """
    Synchronizes a single CropExpense to FertilizerApplication.
    Creates, updates, or deletes accordingly.
    """
    # 1. Check if it is a fertilizer expense
    if not is_fertilizer_expense(expense):
        # If it was previously synced, remove it
        if expense.id:
            existing_stmt = select(FertilizerApplication).where(FertilizerApplication.expense_id == expense.id)
            existing_res = await _exec_stmt(session, existing_stmt)
            existing = existing_res.first()
            if existing:
                await session.delete(existing)
                await session.commit()
        return None

    # 2. Find matching PlotSoilData for this crop or user
    soil_stmt = select(PlotSoilData).where(
        PlotSoilData.crop_id == crop_id,
        PlotSoilData.user_id == user_id
    )
    soil_res = await _exec_stmt(session, soil_stmt)
    soil = soil_res.first()

    if not soil:
        # If no plot soil has crop_id == crop_id, try finding by plot area or user's active plots
        crop = await session.get(Crop, crop_id)
        all_soils_stmt = select(PlotSoilData).where(PlotSoilData.user_id == user_id)
        all_soils_res = await _exec_stmt(session, all_soils_stmt)
        all_soils = all_soils_res.all()
        if len(all_soils) == 1:
            soil = all_soils[0]
            if not soil.crop_id:
                soil.crop_id = crop_id
                session.add(soil)
        elif crop and all_soils:
            for s in all_soils:
                lr = await session.get(LandRecord, s.land_record_id)
                if lr and abs(lr.area - crop.area) < 0.1:
                    soil = s
                    if not soil.crop_id:
                        soil.crop_id = crop_id
                        session.add(soil)
                    break

    if not soil:
        return None

    details = extract_fertilizer_details(expense)

    # 3. Check if already exists for this expense
    existing_stmt = select(FertilizerApplication).where(FertilizerApplication.expense_id == expense.id)
    existing_res = await _exec_stmt(session, existing_stmt)
    fert_app = existing_res.first()

    if fert_app:
        fert_app.plot_soil_data_id = soil.id
        fert_app.fertilizer_name = details["fertilizer_name"]
        fert_app.quantity = details["quantity"]
        fert_app.unit = details["unit"]
        fert_app.application_date = details["application_date"]
        fert_app.application_method = details["application_method"]
        fert_app.crop_id = crop_id
        fert_app.notes = details["notes"]
        fert_app.user_id = user_id
    else:
        fert_app = FertilizerApplication(
            plot_soil_data_id=soil.id,
            fertilizer_name=details["fertilizer_name"],
            quantity=details["quantity"],
            unit=details["unit"],
            application_date=details["application_date"],
            application_method=details["application_method"],
            crop_id=crop_id,
            notes=details["notes"],
            user_id=user_id,
            expense_id=expense.id
        )
        session.add(fert_app)

    await session.commit()
    await session.refresh(fert_app)
    return fert_app

async def delete_synced_fertilizer_expense(session, expense_id: int):
    """Removes the FertilizerApplication associated with a deleted CropExpense."""
    stmt = select(FertilizerApplication).where(FertilizerApplication.expense_id == expense_id)
    res = await _exec_stmt(session, stmt)
    fert_app = res.first()
    if fert_app:
        await session.delete(fert_app)
        await session.commit()

async def sync_crop_expenses_for_plot(
    session,
    plot_soil_id: int,
    user_id: int
):
    """
    Scans all CropExpenses for the crop linked to this plot (or user's matching crops)
    and ensures all fertilizer expenses are mirrored in FertilizerApplication.
    """
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != user_id:
        return

    if not soil.crop_id:
        return

    # Fetch all expenses for this crop
    exp_stmt = select(CropExpense).where(CropExpense.crop_id == soil.crop_id)
    exp_res = await _exec_stmt(session, exp_stmt)
    expenses = exp_res.all()

    changes = False
    for exp in expenses:
        if is_fertilizer_expense(exp):
            check_stmt = select(FertilizerApplication).where(FertilizerApplication.expense_id == exp.id)
            check_res = await _exec_stmt(session, check_stmt)
            existing = check_res.first()

            details = extract_fertilizer_details(exp)
            if not existing:
                # Also check by name, date and plot to prevent any duplicate if created earlier without expense_id
                dup_stmt = select(FertilizerApplication).where(
                    FertilizerApplication.plot_soil_data_id == soil.id,
                    FertilizerApplication.fertilizer_name == details["fertilizer_name"],
                    FertilizerApplication.quantity == details["quantity"],
                    FertilizerApplication.unit == details["unit"]
                )
                dup_res = await _exec_stmt(session, dup_stmt)
                dup = dup_res.first()
                if dup:
                    dup.expense_id = exp.id
                    session.add(dup)
                    changes = True
                    continue

                new_app = FertilizerApplication(
                    plot_soil_data_id=soil.id,
                    fertilizer_name=details["fertilizer_name"],
                    quantity=details["quantity"],
                    unit=details["unit"],
                    application_date=details["application_date"],
                    application_method=details["application_method"],
                    crop_id=soil.crop_id,
                    notes=details["notes"],
                    user_id=user_id,
                    expense_id=exp.id
                )
                session.add(new_app)
                changes = True
            else:
                existing.plot_soil_data_id = soil.id
                existing.fertilizer_name = details["fertilizer_name"]
                existing.quantity = details["quantity"]
                existing.unit = details["unit"]
                existing.application_date = details["application_date"]
                existing.application_method = details["application_method"]
                existing.notes = details["notes"]
                session.add(existing)
                changes = True

    if changes:
        await session.commit()
