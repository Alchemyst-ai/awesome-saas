#!/usr/bin/env python3
"""
Demo Script for Data Analytics Agent
Purpose: Demonstrate all features of the agent
@version 1.0
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'app'))

from analyzer import DataAnalyzer
from visualizer import DataVisualizer
from ai_insights import AlchemystInsights
from report_generator import ReportGenerator


def demo_basic_analysis():
    """Demonstrate basic data analysis"""
    print("\n" + "="*60)
    print("🔍 DEMO 1: Basic Data Analysis")
    print("="*60 + "\n")
    
    # Load data
    print("📂 Loading stock market data...")
    analyzer = DataAnalyzer()
    df = analyzer.load_data("examples/stock_market_data.csv")
    
    print(f"✅ Loaded {len(df)} rows and {len(df.columns)} columns\n")
    
    # Get basic stats
    print("📊 Calculating statistics...")
    stats = analyzer.get_basic_stats()
    
    print(f"\nDataset Overview:")
    print(f"  - Rows: {stats['shape']['rows']}")
    print(f"  - Columns: {stats['shape']['columns']}")
    print(f"  - Numeric columns: {len(stats['numeric_columns'])}")
    print(f"  - Categorical columns: {len(stats['categorical_columns'])}")
    print(f"\nNumeric Columns: {', '.join(stats['numeric_columns'])}")
    print(f"Categorical Columns: {', '.join(stats['categorical_columns'])}")
    
    # Column summary
    print("\n📋 Analyzing 'close' column (closing price)...")
    col_summary = analyzer.get_column_summary('close')
    print(f"  - Mean: ${col_summary['mean']:,.2f}")
    print(f"  - Median: ${col_summary['median']:,.2f}")
    print(f"  - Min: ${col_summary['min']:,.2f}")
    print(f"  - Max: ${col_summary['max']:,.2f}")


def demo_correlations():
    """Demonstrate correlation analysis"""
    print("\n" + "="*60)
    print("🔗 DEMO 2: Correlation Analysis")
    print("="*60 + "\n")
    
    analyzer = DataAnalyzer()
    df = analyzer.load_data("examples/stock_market_data.csv")
    
    print("📊 Calculating correlation matrix...")
    corr_results = analyzer.calculate_correlation_matrix()
    
    print("\n🔝 Top Positive Correlations:")
    for i, corr in enumerate(corr_results['top_positive_correlations'][:5], 1):
        print(f"  {i}. {corr['column1']} ↔ {corr['column2']}: {corr['correlation']:.3f}")
    
    if corr_results['strong_correlations']:
        print("\n💪 Strong Correlations (|r| > 0.7):")
        for corr in corr_results['strong_correlations']:
            print(f"  - {corr['column1']} ↔ {corr['column2']}: {corr['correlation']:.3f}")


def demo_visualizations():
    """Demonstrate visualization generation"""
    print("\n" + "="*60)
    print("📈 DEMO 3: Data Visualizations")
    print("="*60 + "\n")
    
    analyzer = DataAnalyzer()
    df = analyzer.load_data("examples/stock_market_data.csv")
    
    print("🎨 Generating visualizations...")
    visualizer = DataVisualizer(df, "./output/demo")
    
    # Auto-generate charts
    chart_paths = visualizer.auto_visualize(max_charts=5)
    
    print(f"\n✅ Created {len(chart_paths)} visualizations:")
    for i, path in enumerate(chart_paths, 1):
        print(f"  {i}. {Path(path).name}")
    
    print(f"\n📁 All charts saved to: ./output/demo/")


def demo_ai_insights():
    """Demonstrate AI-powered insights"""
    print("\n" + "="*60)
    print("🤖 DEMO 4: AI-Powered Insights")
    print("="*60 + "\n")
    
    analyzer = DataAnalyzer()
    df = analyzer.load_data("examples/stock_market_data.csv")
    
    try:
        print("🧠 Generating AI insights (requires Alchemyst API key)...\n")
        ai = AlchemystInsights()
        
        # Generate summary
        print("📋 Overall Summary:")
        print("-" * 60)
        summary = ai.generate_summary(df)
        print(summary)
        
        # Pattern detection
        print("\n\n🔍 Pattern Analysis for 'symbol' (stock symbols):")
        print("-" * 60)
        patterns = ai.detect_patterns(df, 'symbol')
        print(patterns)
        
    except Exception as e:
        print(f"⚠️  AI features require ALCHEMYST_API_KEY in .env file")
        print(f"   Error: {str(e)}")


def demo_report_generation():
    """Demonstrate report generation"""
    print("\n" + "="*60)
    print("📄 DEMO 5: Report Generation")
    print("="*60 + "\n")
    
    analyzer = DataAnalyzer()
    df = analyzer.load_data("examples/stock_market_data.csv")
    
    # Get analysis
    print("📊 Analyzing data...")
    stats = analyzer.get_basic_stats()
    analyzer.calculate_correlation_matrix()
    analyzer.analysis_results['missing_values'] = analyzer.analyze_missing_values()
    
    # Generate visualizations
    print("📈 Creating visualizations...")
    visualizer = DataVisualizer(df, "./output/demo")
    chart_paths = visualizer.auto_visualize(max_charts=4)
    
    # Generate reports
    print("📝 Generating reports...\n")
    report_gen = ReportGenerator(analyzer.analysis_results, chart_paths)
    
    # HTML Report
    html_path = "./output/demo/report.html"
    report_gen.generate_html_report(html_path, "Sample AI-generated summary")
    print(f"✅ HTML Report: {html_path}")
    
    # PDF Report
    pdf_path = "./output/demo/report.pdf"
    try:
        report_gen.generate_pdf_report(pdf_path, "Sample AI-generated summary")
        print(f"✅ PDF Report: {pdf_path}")
    except Exception as e:
        print(f"⚠️  PDF generation failed: {str(e)}")
    
    # Markdown Report
    md_path = "./output/demo/report.md"
    report_gen.generate_markdown_report(md_path, "Sample AI-generated summary")
    print(f"✅ Markdown Report: {md_path}")


def main():
    """Run all demos"""
    print("\n" + "🎯"*30)
    print("   DATA ANALYTICS AGENT - FULL DEMO")
    print("🎯"*30)
    
    try:
        # Run demos
        demo_basic_analysis()
        demo_correlations()
        demo_visualizations()
        demo_ai_insights()
        demo_report_generation()
        
        print("\n" + "="*60)
        print("✅ DEMO COMPLETE!")
        print("="*60)
        print("\n📁 Check ./output/demo/ for generated files")
        print("\n💡 Next steps:")
        print("  1. Set ALCHEMYST_API_KEY in .env file for AI features")
        print("  2. Try: python app/main.py analyze examples/stock_market_data.csv")
        print("  3. Try: python app/main.py report examples/stock_market_data.csv")
        print("  4. Try: python app/main.py query examples/stock_market_data.csv --interactive")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Demo error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

