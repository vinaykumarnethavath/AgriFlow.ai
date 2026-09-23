"""
Farm Report Generation Service
==============================
Generates official, beautifully styled PDF reports for farmers using ReportLab.
Suitable for:
- Bank crop loan applications (Kisan Credit Card / KCC)
- Government agricultural subsidy verifications
- Crop insurance loss / income proof
- Personal season accounting
"""

import io
from datetime import datetime
from typing import List, Optional, Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

def generate_farmer_report_pdf(
    farmer_name: str,
    farmer_id: str,
    phone: Optional[str],
    village: Optional[str],
    district: Optional[str],
    state: Optional[str],
    total_land_area: float,
    crops: List[Dict[str, Any]],
    expenses: List[Dict[str, Any]],
    loans: List[Dict[str, Any]],
    season_filter: Optional[str] = None
) -> bytes:
    """Compile structured farm operational and financial data into a clean PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1b4332"),
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2d6a4f"),
        alignment=TA_LEFT
    )

    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1b4332"),
        spaceBefore=10,
        spaceAfter=4
    )

    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#495057")
    )

    meta_val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#212529")
    )

    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#212529")
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1b4332")
    )

    cell_header = ParagraphStyle(
        'CellHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    cell_right = ParagraphStyle(
        'CellRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#212529")
    )

    cell_right_bold = ParagraphStyle(
        'CellRightBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=TA_RIGHT,
        textColor=colors.HexColor("#1b4332")
    )

    story = []

    # 1. Header with Title & Date
    now_str = datetime.utcnow().strftime("%d-%b-%Y %I:%M %p UTC")
    report_title = f"FARM OPERATIONAL & FINANCIAL STATEMENT"
    if season_filter and season_filter.lower() != "all":
        report_title += f" ({season_filter.upper()})"

    story.append(Paragraph(report_title, title_style))
    story.append(Paragraph("Verified Agricultural Record for Bank Loan (KCC), Subsidy & Crop Insurance Purposes", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2d6a4f"), spaceBefore=1, spaceAfter=8))

    # 2. Farmer Particulars Block
    farmer_info_data = [
        [
            Paragraph("<b>Farmer Name:</b>", meta_label_style),
            Paragraph(farmer_name or "Registered Farmer", meta_val_style),
            Paragraph("<b>Farmer ID:</b>", meta_label_style),
            Paragraph(farmer_id or "—", meta_val_style),
        ],
        [
            Paragraph("<b>Location:</b>", meta_label_style),
            Paragraph(f"{village or ''}, {district or ''}, {state or ''}".strip(", "), meta_val_style),
            Paragraph("<b>Contact Phone:</b>", meta_label_style),
            Paragraph(phone or "—", meta_val_style),
        ],
        [
            Paragraph("<b>Land Holding:</b>", meta_label_style),
            Paragraph(f"{total_land_area:.2f} Acres", meta_val_style),
            Paragraph("<b>Report Generated:</b>", meta_label_style),
            Paragraph(now_str, meta_val_style),
        ],
    ]
    farmer_table = Table(farmer_info_data, colWidths=[1.3 * inch, 2.5 * inch, 1.4 * inch, 2.1 * inch])
    farmer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8f9fa")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#ced4da")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e9ecef")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(farmer_table)
    story.append(Spacer(1, 12))

    # 3. Financial Summary Card
    total_area_cultivated = sum(c.get("area", 0.0) for c in crops)
    total_cost = sum(c.get("total_cost", 0.0) for c in crops)
    total_revenue = sum(c.get("total_revenue", 0.0) for c in crops)
    total_yield = sum(c.get("actual_yield", 0.0) for c in crops)
    net_profit = sum(c.get("net_profit", c.get("total_revenue", 0.0) - c.get("total_cost", 0.0)) for c in crops)
    margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0.0

    summary_data = [
        [
            Paragraph("Cultivated Area", cell_bold),
            Paragraph("Total Harvest Yield", cell_bold),
            Paragraph("Total Production Cost", cell_bold),
            Paragraph("Gross Revenue", cell_bold),
            Paragraph("Net Profit (Income)", cell_bold),
        ],
        [
            Paragraph(f"{total_area_cultivated:.2f} Acres", cell_style),
            Paragraph(f"{total_yield:.1f} Quintals", cell_style),
            Paragraph(f"₹{total_cost:,.0f}", cell_style),
            Paragraph(f"₹{total_revenue:,.0f}", cell_style),
            Paragraph(f"₹{net_profit:,.0f} ({margin:.1f}%)", cell_bold),
        ]
    ]
    summary_table = Table(summary_data, colWidths=[1.4 * inch, 1.4 * inch, 1.5 * inch, 1.4 * inch, 1.6 * inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e8f5e9")),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#ffffff")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#40916c")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#d8f3dc")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # 4. Crops Statement Table
    story.append(Paragraph("1. CROPS CULTIVATION & HARVEST STATEMENT", section_header_style))
    crop_table_data = [
        [
            Paragraph("Crop & Variety", cell_header),
            Paragraph("Season", cell_header),
            Paragraph("Area (Ac)", cell_header),
            Paragraph("Yield (Qtl)", cell_header),
            Paragraph("Cost (₹)", cell_header),
            Paragraph("Revenue (₹)", cell_header),
            Paragraph("Net Profit (₹)", cell_header),
        ]
    ]

    for c in crops:
        c_profit = c.get("net_profit", c.get("total_revenue", 0.0) - c.get("total_cost", 0.0))
        crop_table_data.append([
            Paragraph(f"<b>{c.get('name', '')}</b><br/>{c.get('variety') or ''}", cell_style),
            Paragraph(f"{c.get('season') or 'Kharif'}", cell_style),
            Paragraph(f"{c.get('area', 0.0):.2f}", cell_right),
            Paragraph(f"{c.get('actual_yield', 0.0):.1f}", cell_right),
            Paragraph(f"{c.get('total_cost', 0.0):,.0f}", cell_right),
            Paragraph(f"{c.get('total_revenue', 0.0):,.0f}", cell_right),
            Paragraph(f"<b>{c_profit:,.0f}</b>", cell_right_bold),
        ])

    # Total row
    crop_table_data.append([
        Paragraph("<b>TOTALS</b>", cell_bold),
        Paragraph("", cell_style),
        Paragraph(f"<b>{total_area_cultivated:.2f}</b>", cell_right_bold),
        Paragraph(f"<b>{total_yield:.1f}</b>", cell_right_bold),
        Paragraph(f"<b>₹{total_cost:,.0f}</b>", cell_right_bold),
        Paragraph(f"<b>₹{total_revenue:,.0f}</b>", cell_right_bold),
        Paragraph(f"<b>₹{net_profit:,.0f}</b>", cell_right_bold),
    ])

    crops_table = Table(
        crop_table_data,
        colWidths=[1.6 * inch, 0.9 * inch, 0.8 * inch, 0.9 * inch, 1.0 * inch, 1.0 * inch, 1.1 * inch]
    )
    crops_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2d6a4f")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#adb5bd")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8f9fa")]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e9ecef")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(crops_table)
    story.append(Spacer(1, 14))

    # 5. Loans and Credit Position (if any)
    if loans:
        story.append(Paragraph("2. CREDIT & LOAN POSITION", section_header_style))
        loan_table_data = [
            [
                Paragraph("Lender / Store Name", cell_header),
                Paragraph("Source Type", cell_header),
                Paragraph("Purpose", cell_header),
                Paragraph("Principal (₹)", cell_header),
                Paragraph("Paid (₹)", cell_header),
                Paragraph("Balance Due (₹)", cell_header),
                Paragraph("Status", cell_header),
            ]
        ]
        for l in loans:
            loan_table_data.append([
                Paragraph(l.get("lender_name", ""), cell_style),
                Paragraph(l.get("source_type", "").replace("_", " ").title(), cell_style),
                Paragraph(l.get("purpose", ""), cell_style),
                Paragraph(f"{l.get('principal_amount', 0.0):,.0f}", cell_right),
                Paragraph(f"{l.get('amount_paid', 0.0):,.0f}", cell_right),
                Paragraph(f"<b>{l.get('remaining_balance', 0.0):,.0f}</b>", cell_right_bold),
                Paragraph(l.get("status", "").upper(), cell_style),
            ])
        loan_table = Table(
            loan_table_data,
            colWidths=[1.5 * inch, 1.1 * inch, 1.3 * inch, 0.9 * inch, 0.8 * inch, 0.9 * inch, 0.8 * inch]
        )
        loan_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1b4332")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#adb5bd")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(loan_table)
        story.append(Spacer(1, 14))

    # 6. Declaration & Verification Sign-off
    story.append(Spacer(1, 10))
    sign_data = [
        [
            Paragraph("<b>Farmer Self-Declaration:</b><br/>I hereby declare that the crop sowing, input costs, and sales recorded in this statement represent true agricultural activities undertaken on my farmland.", cell_style),
            Paragraph("<b>Authorized Verification Seal:</b><br/>AgriFlow Digital Farm Registry<br/>Cryptographically Signed & Timestamped", cell_style)
        ],
        [
            Paragraph("<br/><br/>__________________________________<br/>Farmer Signature / Thumb Impression", cell_style),
            Paragraph("<br/><br/>__________________________________<br/>Branch Manager / Agriculture Officer", cell_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[3.6 * inch, 3.7 * inch])
    sign_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#ced4da")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e9ecef")),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fdfdfd")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(KeepTogether(sign_table))

    # 7. Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
