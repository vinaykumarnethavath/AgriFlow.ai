"""
Season Comparison Router
========================
Endpoints for comparing farmer performance across agricultural seasons:
- Lists available season-year periods
- Side-by-side comparison of two seasons (Cost, Yield, Revenue, Profit, Profit Margin)
- Crop-by-crop comparative analysis (e.g. Wheat Last Year vs Wheat This Year: +33% profit)
- Multi-season trend overview
- Automated rule-based AI seasonal insights
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date
from collections import defaultdict
from pydantic import BaseModel

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop import Crop, CropExpense, CropHarvest

router = APIRouter(prefix="/season-comparison", tags=["season-comparison"])

class MetricComparison(BaseModel):
    season_a_val: float
    season_b_val: float
    difference: float
    percent_change: float # e.g. +33.3%
    is_positive: bool     # True if change is favorable (e.g. profit up or cost down)

class SeasonSummary(BaseModel):
    season_name: str
    year: int
    label: str # e.g. "Kharif 2025"
    crops_count: int
    total_area_acres: float
    total_cost: float
    total_yield_quintals: float
    total_revenue: float
    net_profit: float
    profit_margin_percent: float
    yield_per_acre: float
    cost_per_acre: float
    profit_per_acre: float

class CropComparisonItem(BaseModel):
    crop_name: str
    season_a_area: float
    season_b_area: float
    season_a_yield: float
    season_b_yield: float
    season_a_cost: float
    season_b_cost: float
    season_a_revenue: float
    season_b_revenue: float
    season_a_profit: float
    season_b_profit: float
    profit_change_percent: float
    yield_change_percent: float
    cost_change_percent: float
    status_text: str # e.g. "+₹15,000 profit (+33%)"

class SeasonComparisonResponse(BaseModel):
    season_a: SeasonSummary
    season_b: SeasonSummary
    profit_comparison: MetricComparison
    yield_comparison: MetricComparison
    cost_comparison: MetricComparison
    revenue_comparison: MetricComparison
    crop_comparisons: List[CropComparisonItem]
    ai_insights: List[str]

def _get_season_label(crop: Crop) -> str:
    """Format crop into a season label like 'Kharif 2025' or 'Rabi 2025'."""
    season = crop.season or "Kharif"
    year = crop.sowing_date.year if crop.sowing_date else datetime.utcnow().year
    return f"{season} {year}"

def _calculate_metric(val_a: float, val_b: float, higher_is_better: bool = True) -> MetricComparison:
    diff = val_b - val_a
    pct = 0.0
    if val_a > 0:
        pct = round((diff / val_a) * 100, 1)
    elif val_b > 0:
        pct = 100.0

    is_pos = (diff >= 0) if higher_is_better else (diff <= 0)
    return MetricComparison(
        season_a_val=round(val_a, 2),
        season_b_val=round(val_b, 2),
        difference=round(diff, 2),
        percent_change=pct,
        is_positive=is_pos,
    )

@router.get("/seasons", response_model=List[str])
async def list_available_seasons(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List all unique season periods for which the farmer has crop data."""
    statement = select(Crop).where(Crop.user_id == current_user.id)
    result = await session.execute(statement)
    crops = result.scalars().all()

    season_set = set()
    for c in crops:
        season_set.add(_get_season_label(c))

    # Sort descending by year / label
    sorted_seasons = sorted(list(season_set), reverse=True)
    if not sorted_seasons:
        # Provide sample default seasons so the UI is ready
        curr_year = datetime.utcnow().year
        return [f"Kharif {curr_year}", f"Rabi {curr_year - 1}", f"Kharif {curr_year - 1}"]
    return sorted_seasons

@router.get("/all-overview", response_model=List[SeasonSummary])
async def get_all_seasons_overview(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return overview summary metrics for all seasons for charting."""
    statement = select(Crop).where(Crop.user_id == current_user.id)
    result = await session.execute(statement)
    crops = result.scalars().all()

    groups: Dict[str, List[Crop]] = defaultdict(list)
    for c in crops:
        lbl = _get_season_label(c)
        groups[lbl].append(c)

    overview: List[SeasonSummary] = []
    for lbl, group_crops in groups.items():
        parts = lbl.split(" ")
        s_name = parts[0]
        s_year = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else datetime.utcnow().year

        total_area = sum(c.area or 0.0 for c in group_crops)
        total_cost = sum(c.total_cost or 0.0 for c in group_crops)
        total_yield = sum(c.actual_yield or 0.0 for c in group_crops)
        total_rev = sum(c.total_revenue or 0.0 for c in group_crops)
        net_profit = sum(c.net_profit if c.net_profit is not None else ((c.total_revenue or 0.0) - (c.total_cost or 0.0)) for c in group_crops)
        margin = round((net_profit / total_rev * 100), 1) if total_rev > 0 else 0.0

        overview.append(
            SeasonSummary(
                season_name=s_name,
                year=s_year,
                label=lbl,
                crops_count=len(group_crops),
                total_area_acres=round(total_area, 2),
                total_cost=round(total_cost, 2),
                total_yield_quintals=round(total_yield, 2),
                total_revenue=round(total_rev, 2),
                net_profit=round(net_profit, 2),
                profit_margin_percent=margin,
                yield_per_acre=round(total_yield / total_area, 2) if total_area > 0 else 0.0,
                cost_per_acre=round(total_cost / total_area, 2) if total_area > 0 else 0.0,
                profit_per_acre=round(net_profit / total_area, 2) if total_area > 0 else 0.0,
            )
        )

    # Sort chronological
    overview.sort(key=lambda s: (s.year, s.season_name))
    return overview

@router.get("/compare", response_model=SeasonComparisonResponse)
async def compare_seasons(
    season_a: Optional[str] = Query(None, description="Baseline season (e.g. Kharif 2025)"),
    season_b: Optional[str] = Query(None, description="Comparison season (e.g. Kharif 2026)"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Compare two seasons side-by-side with crop-level delta and AI insights."""
    statement = select(Crop).where(Crop.user_id == current_user.id)
    result = await session.execute(statement)
    crops = result.scalars().all()

    # Group crops by season label
    groups: Dict[str, List[Crop]] = defaultdict(list)
    for c in crops:
        lbl = _get_season_label(c)
        groups[lbl].append(c)

    available = sorted(list(groups.keys()), reverse=True)

    # Select defaults if not specified
    if not season_b:
        season_b = available[0] if available else f"Kharif {datetime.utcnow().year}"
    if not season_a:
        season_a = available[1] if len(available) > 1 else (available[0] if available else f"Kharif {datetime.utcnow().year - 1}")

    crops_a = groups.get(season_a, [])
    crops_b = groups.get(season_b, [])

    def summarize(label: str, crop_list: List[Crop]) -> SeasonSummary:
        parts = label.split(" ")
        s_name = parts[0]
        s_year = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else datetime.utcnow().year

        total_area = sum(c.area or 0.0 for c in crop_list)
        total_cost = sum(c.total_cost or 0.0 for c in crop_list)
        total_yield = sum(c.actual_yield or 0.0 for c in crop_list)
        total_rev = sum(c.total_revenue or 0.0 for c in crop_list)
        net_profit = sum(c.net_profit if c.net_profit is not None else ((c.total_revenue or 0.0) - (c.total_cost or 0.0)) for c in crop_list)
        margin = round((net_profit / total_rev * 100), 1) if total_rev > 0 else 0.0

        return SeasonSummary(
            season_name=s_name,
            year=s_year,
            label=label,
            crops_count=len(crop_list),
            total_area_acres=round(total_area, 2),
            total_cost=round(total_cost, 2),
            total_yield_quintals=round(total_yield, 2),
            total_revenue=round(total_rev, 2),
            net_profit=round(net_profit, 2),
            profit_margin_percent=margin,
            yield_per_acre=round(total_yield / total_area, 2) if total_area > 0 else 0.0,
            cost_per_acre=round(total_cost / total_area, 2) if total_area > 0 else 0.0,
            profit_per_acre=round(net_profit / total_area, 2) if total_area > 0 else 0.0,
        )

    summary_a = summarize(season_a, crops_a)
    summary_b = summarize(season_b, crops_b)

    profit_cmp = _calculate_metric(summary_a.net_profit, summary_b.net_profit, higher_is_better=True)
    yield_cmp = _calculate_metric(summary_a.total_yield_quintals, summary_b.total_yield_quintals, higher_is_better=True)
    cost_cmp = _calculate_metric(summary_a.total_cost, summary_b.total_cost, higher_is_better=False)
    rev_cmp = _calculate_metric(summary_a.total_revenue, summary_b.total_revenue, higher_is_better=True)

    # Crop-by-crop match
    crop_map_a: Dict[str, Crop] = {c.name.strip().title(): c for c in crops_a}
    crop_map_b: Dict[str, Crop] = {c.name.strip().title(): c for c in crops_b}

    all_crop_names = sorted(list(set(list(crop_map_a.keys()) + list(crop_map_b.keys()))))
    crop_comparisons: List[CropComparisonItem] = []

    for name in all_crop_names:
        ca = crop_map_a.get(name)
        cb = crop_map_b.get(name)

        a_area = ca.area if ca else 0.0
        b_area = cb.area if cb else 0.0
        a_yield = ca.actual_yield if ca else 0.0
        b_yield = cb.actual_yield if cb else 0.0
        a_cost = ca.total_cost if ca else 0.0
        b_cost = cb.total_cost if cb else 0.0
        a_rev = ca.total_revenue if ca else 0.0
        b_rev = cb.total_revenue if cb else 0.0
        a_profit = ca.net_profit if ca and ca.net_profit is not None else (a_rev - a_cost)
        b_profit = cb.net_profit if cb and cb.net_profit is not None else (b_rev - b_cost)

        p_diff = b_profit - a_profit
        p_pct = round((p_diff / a_profit * 100), 1) if a_profit > 0 else (100.0 if b_profit > 0 else 0.0)
        y_diff = b_yield - a_yield
        y_pct = round((y_diff / a_yield * 100), 1) if a_yield > 0 else (100.0 if b_yield > 0 else 0.0)
        c_diff = b_cost - a_cost
        c_pct = round((c_diff / a_cost * 100), 1) if a_cost > 0 else (100.0 if b_cost > 0 else 0.0)

        sign = "+" if p_diff >= 0 else ""
        status_text = f"{sign}₹{p_diff:,.0f} profit ({sign}{p_pct}%)"

        crop_comparisons.append(
            CropComparisonItem(
                crop_name=name,
                season_a_area=round(a_area, 2),
                season_b_area=round(b_area, 2),
                season_a_yield=round(a_yield, 2),
                season_b_yield=round(b_yield, 2),
                season_a_cost=round(a_cost, 2),
                season_b_cost=round(b_cost, 2),
                season_a_revenue=round(a_rev, 2),
                season_b_revenue=round(b_rev, 2),
                season_a_profit=round(a_profit, 2),
                season_b_profit=round(b_profit, 2),
                profit_change_percent=p_pct,
                yield_change_percent=y_pct,
                cost_change_percent=c_pct,
                status_text=status_text,
            )
        )

    # Generate Rule-based AI Insights
    insights: List[str] = []
    if profit_cmp.difference > 0:
        insights.append(
            f"🎉 Overall Net Profit increased by ₹{profit_cmp.difference:,.0f} (+{profit_cmp.percent_change}%) in {season_b} compared to {season_a}."
        )
    elif profit_cmp.difference < 0:
        insights.append(
            f"⚠️ Net Profit decreased by ₹{abs(profit_cmp.difference):,.0f} ({profit_cmp.percent_change}%) in {season_b}. Review input expenses and market sale rates."
        )

    if yield_cmp.difference > 0:
        insights.append(
            f"🌾 Total Harvest Yield improved by {yield_cmp.difference:.1f} quintals (+{yield_cmp.percent_change}%), demonstrating better crop health and soil practices."
        )

    if cost_cmp.difference < 0:
        insights.append(
            f"💰 Production costs were successfully lowered by ₹{abs(cost_cmp.difference):,.0f} ({cost_cmp.percent_change}%), indicating improved fertilizer and labor efficiency."
        )
    elif cost_cmp.difference > 0:
        insights.append(
            f"📊 Operational input costs rose by ₹{cost_cmp.difference:,.0f} (+{cost_cmp.percent_change}%). Check if seed or fertilizer prices were elevated."
        )

    if summary_b.profit_per_acre > summary_a.profit_per_acre:
        diff_acre = summary_b.profit_per_acre - summary_a.profit_per_acre
        insights.append(
            f"📈 Land productivity increased: Profit per acre grew from ₹{summary_a.profit_per_acre:,.0f} to ₹{summary_b.profit_per_acre:,.0f} (+₹{diff_acre:,.0f}/acre)."
        )

    if not insights:
        insights.append(
            f"📊 Comparing {season_a} and {season_b}. Log more harvest and sales data to reveal deeper AI productivity trends."
        )

    return SeasonComparisonResponse(
        season_a=summary_a,
        season_b=summary_b,
        profit_comparison=profit_cmp,
        yield_comparison=yield_cmp,
        cost_comparison=cost_cmp,
        revenue_comparison=rev_cmp,
        crop_comparisons=crop_comparisons,
        ai_insights=insights,
    )
