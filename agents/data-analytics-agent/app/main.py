#!/usr/bin/env python3
"""
Main CLI Module
Purpose: Command-line interface for Data Analytics Agent
Features:
- Analyze command for data analysis
- Report command for generating reports
- Query command for natural language Q&A
@version 1.0
@package data-analytics-agent
@author iamtensaiii
"""

import click
import sys
from pathlib import Path
from typing import Optional, Dict, Any, List
import json

from analyzer import DataAnalyzer
from visualizer import DataVisualizer
from ai_insights import AlchemystInsights
from report_generator import ReportGenerator


@click.group()
@click.version_option(version='1.0.0')
def cli():
    """
    🔍 Data Analytics Agent
    
    AI-powered data analytics that turns CSV/JSON files into actionable insights.
    Powered by Alchemyst AI Platform.
    """
    pass


def _analyze_specific_columns(analyzer: DataAnalyzer, df: pd.DataFrame, columns: str) -> None:
    """Analyze specific columns if provided"""
    col_list = [c.strip() for c in columns.split(',')]
    click.echo(f"🔎 Analyzing specified columns: {', '.join(col_list)}\n")
    
    for col in col_list:
        if col in df.columns:
            summary = analyzer.get_column_summary(col)
            click.echo(f"   {col}:")
            click.echo(f"      Type: {summary['dtype']}")
            click.echo(f"      Unique: {summary['unique_values']}")
            click.echo(f"      Missing: {summary['missing_percentage']}%")

def _calculate_correlations(analyzer: DataAnalyzer, stats: Dict[str, Any]) -> None:
    """Calculate and display correlations"""
    if len(stats['numeric_columns']) > 1:
        click.echo("\n🔗 Calculating correlations...")
        corr_results = analyzer.calculate_correlation_matrix()
        
        if corr_results['strong_correlations']:
            click.echo("   Strong correlations found:")
            for corr in corr_results['strong_correlations'][:5]:
                click.echo(f"      {corr['column1']} ↔ {corr['column2']}: {corr['correlation']:.3f}")

def _analyze_missing_values(analyzer: DataAnalyzer) -> None:
    """Analyze and display missing values"""
    click.echo("\n🔍 Analyzing missing values...")
    missing_analysis = analyzer.analyze_missing_values()
    click.echo(f"   Total missing: {missing_analysis['total_missing_values']}")
    click.echo(f"   Rows affected: {missing_analysis['rows_with_missing']} ({missing_analysis['rows_with_missing_percentage']}%)")

def _generate_ai_insights(df: pd.DataFrame) -> str:
    """Generate AI insights and return summary"""
    click.echo("\n🤖 Generating AI insights (this may take a moment)...")
    try:
        ai_insights = AlchemystInsights()
        summary = ai_insights.generate_summary(df)
        
        click.echo(click.style("\n📋 AI Summary:", fg='green', bold=True))
        click.echo(summary)
        return summary
    except Exception as e:
        click.echo(click.style(f"\n⚠️  AI insights unavailable: {str(e)}", fg='yellow'))
        return ""

def _generate_visualizations(df: pd.DataFrame, output_dir: Path, visualize: bool) -> List[str]:
    """Generate visualizations if requested"""
    chart_paths = []
    if visualize:
        click.echo("\n📈 Generating visualizations...")
        visualizer = DataVisualizer(df, str(output_dir))
        chart_paths = visualizer.auto_visualize(max_charts=6)
        click.echo(f"   Created {len(chart_paths)} charts in {output_dir}")
    return chart_paths

@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.option('--columns', '-c', help='Comma-separated column names to analyze')
@click.option('--output', '-o', default='./output', help='Output directory for results')
@click.option('--correlations/--no-correlations', default=True, help='Calculate correlations')
@click.option('--visualize/--no-visualize', default=True, help='Generate visualizations')
def analyze(file_path: str, columns: Optional[str], output: str, correlations: bool, visualize: bool):
    """
    Analyze data file and generate insights.
    
    Example:
        python main.py analyze data.csv
        python main.py analyze data.csv --columns sales,revenue,profit
    """
    try:
        click.echo(click.style("\n🔍 Starting Data Analysis...\n", fg='blue', bold=True))
        
        # Create output directory
        output_dir = Path(output)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load and analyze data
        click.echo("📂 Loading data...")
        analyzer = DataAnalyzer()
        df = analyzer.load_data(file_path)
        
        click.echo(f"✅ Loaded {len(df)} rows and {len(df.columns)} columns\n")
        
        # Get basic statistics
        click.echo("📊 Calculating statistics...")
        stats = analyzer.get_basic_stats()
        
        click.echo(f"   - Numeric columns: {len(stats['numeric_columns'])}")
        click.echo(f"   - Categorical columns: {len(stats['categorical_columns'])}")
        click.echo(f"   - Missing values: {sum(stats['missing_values'].values())}\n")
        
        # Analyze specific columns if provided
        if columns:
            _analyze_specific_columns(analyzer, df, columns)
        
        # Calculate correlations
        if correlations:
            _calculate_correlations(analyzer, stats)
        
        # Missing value analysis
        _analyze_missing_values(analyzer)
        
        # Generate AI insights
        summary = _generate_ai_insights(df)
        
        # Generate visualizations
        chart_paths = _generate_visualizations(df, output_dir, visualize)
        
        # Export analysis results
        analysis_file = output_dir / "analysis_results.json"
        analyzer.analysis_results['ai_summary'] = summary if summary else "Not available"
        analyzer.export_analysis(str(analysis_file))
        
        click.echo(click.style(f"\n✅ Analysis complete! Results saved to {output_dir}", fg='green', bold=True))
        
    except Exception as e:
        click.echo(click.style(f"\n❌ Error: {str(e)}", fg='red'), err=True)
        sys.exit(1)


@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.option('--output', '-o', default='./output/report.pdf', help='Output path for report')
@click.option('--format', '-f', type=click.Choice(['pdf', 'html', 'markdown']), default='pdf', help='Report format')
@click.option('--charts/--no-charts', default=True, help='Include visualizations')
def report(file_path: str, output: str, format: str, charts: bool):
    """
    Generate comprehensive analysis report.
    
    Example:
        python main.py report data.csv
        python main.py report data.csv --format html --output report.html
    """
    try:
        click.echo(click.style("\n📄 Generating Report...\n", fg='blue', bold=True))
        
        # Load and analyze data
        click.echo("📂 Loading and analyzing data...")
        analyzer = DataAnalyzer()
        df = analyzer.load_data(file_path)
        stats = analyzer.get_basic_stats()
        
        # Generate AI summary
        click.echo("🤖 Generating AI insights...")
        try:
            ai_insights = AlchemystInsights()
            summary = ai_insights.generate_summary(df)
        except Exception as e:
            click.echo(click.style(f"⚠️  AI insights unavailable: {str(e)}", fg='yellow'))
            summary = "AI insights not available."
        
        # Generate visualizations
        chart_paths = []
        if charts:
            click.echo("📈 Creating visualizations...")
            output_dir = Path(output).parent
            output_dir.mkdir(parents=True, exist_ok=True)
            visualizer = DataVisualizer(df, str(output_dir))
            chart_paths = visualizer.auto_visualize(max_charts=8)
        
        # Generate report
        click.echo(f"📝 Generating {format.upper()} report...")
        
        # Calculate correlations and missing values
        try:
            analyzer.calculate_correlation_matrix()
        except Exception as e:
            print(f"Warning: Could not calculate correlation matrix: {e}")
        
        analyzer.analysis_results['missing_values'] = analyzer.analyze_missing_values()
        
        # Create report
        report_gen = ReportGenerator(analyzer.analysis_results, chart_paths)
        
        if format == 'pdf':
            report_path = report_gen.generate_pdf_report(output, summary)
        elif format == 'html':
            output = output.replace('.pdf', '.html')
            report_path = report_gen.generate_html_report(output, summary)
        else:  # markdown
            output = output.replace('.pdf', '.md')
            report_path = report_gen.generate_markdown_report(output, summary)
        
        click.echo(click.style(f"\n✅ Report generated successfully: {report_path}", fg='green', bold=True))
        
    except Exception as e:
        click.echo(click.style(f"\n❌ Error: {str(e)}", fg='red'), err=True)
        sys.exit(1)


@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.option('--question', '-q', help='Question to ask about the data')
@click.option('--interactive/--no-interactive', default=True, help='Interactive Q&A mode')
def query(file_path: str, question: Optional[str], interactive: bool):
    """
    Ask questions about your data in natural language.
    
    Example:
        python main.py query data.csv -q "What are the top 5 products by revenue?"
        python main.py query data.csv --interactive
    """
    try:
        click.echo(click.style("\n💬 Data Query Interface\n", fg='blue', bold=True))
        
        # Load data
        click.echo("📂 Loading data...")
        analyzer = DataAnalyzer()
        df = analyzer.load_data(file_path)
        click.echo(f"✅ Loaded {len(df)} rows and {len(df.columns)} columns\n")
        
        # Initialize AI
        try:
            ai_insights = AlchemystInsights()
        except Exception as e:
            click.echo(click.style(f"❌ Could not initialize AI: {str(e)}", fg='red'))
            sys.exit(1)
        
        # Handle single question
        if question and not interactive:
            click.echo(click.style(f"Q: {question}\n", fg='cyan'))
            answer = ai_insights.answer_query(df, question)
            click.echo(click.style(f"A: {answer}\n", fg='green'))
            return
        
        # Interactive mode
        click.echo("💡 Ask questions about your data. Type 'exit' or 'quit' to stop.\n")
        click.echo("Examples:")
        click.echo("  - What are the top 5 values in column X?")
        click.echo("  - Show me trends in the data")
        click.echo("  - Are there any anomalies?\n")
        
        while True:
            user_question = click.prompt(click.style("Your question", fg='cyan'), type=str)
            
            if user_question.lower() in ['exit', 'quit', 'q']:
                click.echo(click.style("\n👋 Goodbye!", fg='blue'))
                break
            
            click.echo()
            with click.progressbar(length=1, label='Analyzing') as bar:
                answer = ai_insights.answer_query(df, user_question)
                bar.update(1)
            
            click.echo(click.style(f"\nAnswer: {answer}\n", fg='green'))
        
    except Exception as e:
        click.echo(click.style(f"\n❌ Error: {str(e)}", fg='red'), err=True)
        sys.exit(1)


@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.argument('column', type=str)
def patterns(file_path: str, column: str):
    """
    Detect patterns in a specific column.
    
    Example:
        python main.py patterns data.csv sales
    """
    try:
        click.echo(click.style(f"\n🔍 Analyzing patterns in '{column}'\n", fg='blue', bold=True))
        
        # Load data
        analyzer = DataAnalyzer()
        df = analyzer.load_data(file_path)
        
        if column not in df.columns:
            click.echo(click.style(f"❌ Column '{column}' not found", fg='red'))
            click.echo(f"\nAvailable columns: {', '.join(df.columns.tolist())}")
            sys.exit(1)
        
        # Get AI insights
        try:
            ai_insights = AlchemystInsights()
            pattern_analysis = ai_insights.detect_patterns(df, column)
            
            click.echo(click.style("Pattern Analysis:", fg='green', bold=True))
            click.echo(pattern_analysis)
        except Exception as e:
            click.echo(click.style(f"❌ Error: {str(e)}", fg='red'))
            sys.exit(1)
        
    except Exception as e:
        click.echo(click.style(f"\n❌ Error: {str(e)}", fg='red'), err=True)
        sys.exit(1)


@cli.command()
@click.argument('file_path', type=click.Path(exists=True))
@click.argument('column1', type=str)
@click.argument('column2', type=str)
def correlation(file_path: str, column1: str, column2: str):
    """
    Explain correlation between two columns.
    
    Example:
        python main.py correlation data.csv sales revenue
    """
    try:
        click.echo(click.style(f"\n🔗 Analyzing correlation: {column1} ↔ {column2}\n", fg='blue', bold=True))
        
        # Load data
        analyzer = DataAnalyzer()
        df = analyzer.load_data(file_path)
        
        if column1 not in df.columns or column2 not in df.columns:
            click.echo(click.style("❌ One or both columns not found", fg='red'))
            sys.exit(1)
        
        # Get AI explanation
        try:
            ai_insights = AlchemystInsights()
            explanation = ai_insights.explain_correlation(df, column1, column2)
            
            click.echo(click.style("Correlation Analysis:", fg='green', bold=True))
            click.echo(explanation)
        except Exception as e:
            click.echo(click.style(f"❌ Error: {str(e)}", fg='red'))
            sys.exit(1)
        
    except Exception as e:
        click.echo(click.style(f"\n❌ Error: {str(e)}", fg='red'), err=True)
        sys.exit(1)


if __name__ == '__main__':
    cli()

