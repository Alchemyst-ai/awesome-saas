"""
Report Generator Module
Purpose: Generate comprehensive PDF and HTML reports with AI insights
Features:
- PDF report generation with embedded visualizations
- HTML report with interactive elements
- Executive summary and key findings
- Automated report structure
@version 1.0
@package data-analytics-agent
@author iamtensaiii
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime
from jinja2 import Template
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io


class ReportGenerator:
    """
    ReportGenerator
    Purpose: Create professional reports from analysis results
    @property dict analysis_data: Analysis results
    @property list chart_paths: Paths to visualization files
    """
    
    def __init__(self, analysis_data: Dict[str, Any], chart_paths: List[str]):
        """
        Initialize Report Generator
        @param dict analysis_data: Analysis results dictionary
        @param list chart_paths: List of paths to chart images
        """
        self.analysis_data = analysis_data
        self.chart_paths = chart_paths
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Heading style
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=12
        ))
        
        # Body style
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            spaceAfter=12,
            alignment=TA_LEFT
        ))
    
    def _create_title_page(self, story: List) -> None:
        """Create title page for PDF report"""
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph(
            "Data Analytics Report",
            self.styles['CustomTitle']
        ))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(
            f"Generated on: {datetime.now().strftime('%B %d, %Y at %H:%M')}",
            self.styles['CustomBody']
        ))
        story.append(PageBreak())
    
    def _add_executive_summary(self, story: List, ai_summary: str) -> None:
        """Add executive summary section to PDF"""
        if ai_summary:
            story.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
            story.append(Spacer(1, 12))
            
            # Split summary into paragraphs
            for para in ai_summary.split('\n\n'):
                if para.strip():
                    story.append(Paragraph(para.strip(), self.styles['CustomBody']))
                    story.append(Spacer(1, 6))
            
            story.append(PageBreak())
    
    def _add_dataset_overview(self, story: List) -> None:
        """Add dataset overview section to PDF"""
        story.append(Paragraph("Dataset Overview", self.styles['CustomHeading']))
        story.append(Spacer(1, 12))
        
        if 'basic_stats' in self.analysis_data:
            stats = self.analysis_data['basic_stats']
            
            overview_data = [
                ['Metric', 'Value'],
                ['Total Rows', str(stats.get('shape', {}).get('rows', 'N/A'))],
                ['Total Columns', str(stats.get('shape', {}).get('columns', 'N/A'))],
                ['Numeric Columns', str(len(stats.get('numeric_columns', [])))],
                ['Categorical Columns', str(len(stats.get('categorical_columns', [])))]
            ]
            
            table = Table(overview_data, colWidths=[3*inch, 3*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
    
    def _add_missing_values_analysis(self, story: List) -> None:
        """Add missing values analysis section to PDF"""
        if 'missing_values' in self.analysis_data:
            story.append(Paragraph("Missing Values Analysis", self.styles['CustomHeading']))
            story.append(Spacer(1, 12))
            
            missing = self.analysis_data['missing_values']
            missing_text = f"Total missing values: {missing.get('total_missing_values', 0)}<br/>"
            missing_text += f"Rows with missing data: {missing.get('rows_with_missing', 0)} "
            missing_text += f"({missing.get('rows_with_missing_percentage', 0)}%)<br/>"
            
            story.append(Paragraph(missing_text, self.styles['CustomBody']))
            story.append(Spacer(1, 20))
    
    def _add_visualizations(self, story: List) -> None:
        """Add visualizations section to PDF"""
        if self.chart_paths:
            story.append(PageBreak())
            story.append(Paragraph("Data Visualizations", self.styles['CustomHeading']))
            story.append(Spacer(1, 12))
            
            for chart_path in self.chart_paths[:6]:  # Limit to 6 charts
                if Path(chart_path).exists() and chart_path.endswith('.png'):
                    try:
                        img = Image(chart_path, width=6*inch, height=3.5*inch)
                        story.append(img)
                        story.append(Spacer(1, 20))
                    except Exception as e:
                        print(f"Warning: Could not add chart {chart_path} to PDF: {e}")

    def generate_pdf_report(self, output_path: str, ai_summary: str = "") -> str:
        """
        Generate PDF report with analysis results
        @param str output_path: Path to save PDF report
        @param str ai_summary: AI-generated summary
        @return str: Path to generated PDF
        @throws Exception: When PDF generation fails
        """
        try:
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            story = []
            
            # Build report sections
            self._create_title_page(story)
            self._add_executive_summary(story, ai_summary)
            self._add_dataset_overview(story)
            self._add_missing_values_analysis(story)
            self._add_visualizations(story)
            
            # Build PDF
            doc.build(story)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Error generating PDF report: {str(e)}")
    
    def _get_html_template(self) -> str:
        """Get HTML template for report generation"""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Analytics Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .timestamp {
            opacity: 0.9;
            font-size: 0.9em;
        }
        
        .section {
            background: white;
            padding: 30px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            white-space: pre-wrap;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #667eea;
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background-color: #f5f5f5;
        }
        
        .chart-container {
            margin: 20px 0;
            text-align: center;
        }
        
        .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        
        .metric-label {
            color: #666;
            margin-top: 8px;
        }
        
        footer {
            text-align: center;
            padding: 20px;
            color: #666;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Data Analytics Report</h1>
            <p class="timestamp">Generated on: {{ timestamp }}</p>
        </header>
        
        {% if ai_summary %}
        <div class="section">
            <h2>🎯 Executive Summary</h2>
            <div class="summary">{{ ai_summary }}</div>
        </div>
        {% endif %}
        
        <div class="section">
            <h2>📋 Dataset Overview</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">{{ rows }}</div>
                    <div class="metric-label">Total Rows</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ columns }}</div>
                    <div class="metric-label">Total Columns</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ numeric_cols }}</div>
                    <div class="metric-label">Numeric Columns</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{{ categorical_cols }}</div>
                    <div class="metric-label">Categorical Columns</div>
                </div>
            </div>
            
            <h3>Column Information</h3>
            <table>
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Missing Values</th>
                    </tr>
                </thead>
                <tbody>
                    {% for col in column_info %}
                    <tr>
                        <td>{{ col.name }}</td>
                        <td>{{ col.dtype }}</td>
                        <td>{{ col.missing }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        
        {% if charts %}
        <div class="section">
            <h2>📈 Visualizations</h2>
            {% for chart in charts %}
            <div class="chart-container">
                <img src="{{ chart }}" alt="Chart">
            </div>
            {% endfor %}
        </div>
        {% endif %}
        
        <footer>
            <p>Generated with ❤️ using Alchemyst AI Platform</p>
        </footer>
    </div>
</body>
</html>
        """
    
    def _prepare_template_data(self, ai_summary: str) -> Dict[str, Any]:
        """Prepare data for HTML template rendering"""
        stats = self.analysis_data.get('basic_stats', {})
        
        column_info = []
        if 'columns' in stats and 'dtypes' in stats:
            for col in stats['columns']:
                column_info.append({
                    'name': col,
                    'dtype': str(stats['dtypes'].get(col, 'unknown')),
                    'missing': stats.get('missing_values', {}).get(col, 0)
                })
        
        return {
            'timestamp': datetime.now().strftime('%B %d, %Y at %H:%M'),
            'ai_summary': ai_summary,
            'rows': stats.get('shape', {}).get('rows', 0),
            'columns': stats.get('shape', {}).get('columns', 0),
            'numeric_cols': len(stats.get('numeric_columns', [])),
            'categorical_cols': len(stats.get('categorical_columns', [])),
            'column_info': column_info,
            'charts': self.chart_paths
        }

    def generate_html_report(self, output_path: str, ai_summary: str = "") -> str:
        """
        Generate HTML report with analysis results
        @param str output_path: Path to save HTML report
        @param str ai_summary: AI-generated summary
        @return str: Path to generated HTML
        @throws Exception: When HTML generation fails
        """
        try:
            html_template = self._get_html_template()
            template_data = self._prepare_template_data(ai_summary)
            
            template = Template(html_template)
            html_content = template.render(**template_data)
            
            # Write HTML file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Error generating HTML report: {str(e)}")
    
    def generate_markdown_report(self, output_path: str, ai_summary: str = "") -> str:
        """
        Generate Markdown report
        @param str output_path: Path to save markdown report
        @param str ai_summary: AI-generated summary
        @return str: Path to generated markdown file
        """
        try:
            md_content = "# Data Analytics Report\n\n"
            md_content += f"*Generated on: {datetime.now().strftime('%B %d, %Y at %H:%M')}*\n\n"
            md_content += "---\n\n"
            
            # Executive Summary
            if ai_summary:
                md_content += "## 🎯 Executive Summary\n\n"
                md_content += ai_summary + "\n\n"
                md_content += "---\n\n"
            
            # Dataset Overview
            md_content += "## 📋 Dataset Overview\n\n"
            
            if 'basic_stats' in self.analysis_data:
                stats = self.analysis_data['basic_stats']
                md_content += f"- **Total Rows:** {stats.get('shape', {}).get('rows', 'N/A')}\n"
                md_content += f"- **Total Columns:** {stats.get('shape', {}).get('columns', 'N/A')}\n"
                md_content += f"- **Numeric Columns:** {len(stats.get('numeric_columns', []))}\n"
                md_content += f"- **Categorical Columns:** {len(stats.get('categorical_columns', []))}\n\n"
            
            # Visualizations
            if self.chart_paths:
                md_content += "## 📈 Visualizations\n\n"
                for i, chart in enumerate(self.chart_paths, 1):
                    md_content += f"### Chart {i}\n"
                    md_content += f"![Chart {i}]({chart})\n\n"
            
            # Write file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Error generating markdown report: {str(e)}")

