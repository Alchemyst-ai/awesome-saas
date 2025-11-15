# 🔍 Data Analytics Agent

> AI-powered data analytics that turns CSV/JSON files into actionable insights and beautiful visualizations

<div align="center">

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Alchemyst](https://img.shields.io/badge/Powered%20by-Alchemyst%20AI-purple.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

</div>

## ✨ Features

- 📊 **Multi-Format Support** - Load data from CSV, JSON, and Excel files
- 🤖 **AI-Powered Insights** - Generate intelligent summaries and pattern detection using Alchemyst AI
- 📈 **Auto-Visualization** - Automatically create relevant charts and graphs
- 💬 **Natural Language Queries** - Ask questions about your data in plain English
- 📄 **Professional Reports** - Export comprehensive reports in PDF, HTML, or Markdown
- 🔍 **Advanced Analytics** - Correlation analysis, outlier detection, missing value analysis
- ⚡ **CLI Interface** - Easy-to-use command-line tools

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- Alchemyst AI API key ([Get yours here](https://platform.getalchemystai.com))

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Alchemyst-ai/awesome-saas.git
cd awesome-saas/agents/data-analytics-agent
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
# Copy the example env file
cp env.example .env

# Edit .env and add your Alchemyst API key
# ALCHEMYST_API_KEY=your_api_key_here
```

### Configuration

Create a `.env` file in the project root with the following:

```env
# Required
ALCHEMYST_API_KEY=your_api_key_here

# Optional (defaults shown)
ALCHEMYST_BASE_URL=https://platform-backend.getalchemystai.com/api/v1
DEFAULT_MODEL=gpt-4
MAX_TOKENS=2000
OUTPUT_DIR=./output
```

## 📖 Usage

### Basic Analysis

Analyze any data file and get instant insights:

```bash
python app/main.py analyze examples/stock_market_data.csv
```

### Generate Reports

Create comprehensive PDF/HTML reports:

```bash
# PDF Report (default)
python app/main.py report examples/stock_market_data.csv

# HTML Report
python app/main.py report examples/stock_market_data.csv --format html --output report.html

# With custom output location
python app/main.py report data.csv --output ./reports/analysis.pdf
```

### Interactive Q&A

Ask questions about your data in natural language:

```bash
python app/main.py query examples/stock_market_data.csv --interactive
```

Example questions:
- "What are the top 5 products by revenue?"
- "Show me trends in sales over time"
- "Are there any anomalies in the data?"
- "Which region has the highest sales?"

### Pattern Detection

Analyze patterns in specific columns:

```bash
python app/main.py patterns examples/stock_market_data.csv close
```

### Correlation Analysis

Understand relationships between columns:

```bash
python app/main.py correlation examples/stock_market_data.csv volume close
```

### All Available Commands

```bash
# Show all commands
python app/main.py --help

# Command-specific help
python app/main.py analyze --help
python app/main.py report --help
python app/main.py query --help
```

## 📊 Example Output

### Console Output
```
🔍 Starting Data Analysis...

📂 Loading data...
✅ Loaded 50 rows and 9 columns

📊 Calculating statistics...
   - Numeric columns: 4
   - Categorical columns: 4
   - Missing values: 0

🔗 Calculating correlations...
   Strong correlations found:
      quantity ↔ revenue: 0.892
      unit_price ↔ revenue: 0.754

🤖 Generating AI insights...

📋 AI Summary:
The dataset shows strong sales performance with consistent growth trends...
[AI-generated insights]

✅ Analysis complete! Results saved to ./output
```

### Generated Visualizations

- Correlation heatmaps
- Distribution histograms
- Scatter plots for key relationships
- Time series trends
- Category breakdowns

### Report Formats

- **PDF**: Professional printable reports
- **HTML**: Interactive web-based reports
- **Markdown**: Documentation-ready format

## 💡 Why This Helps Builders

Data Analytics Agent eliminates hours of manual data exploration and analysis. Whether you're a:

- **Business Analyst** - Get instant insights from your datasets without coding
- **Data Scientist** - Quickly explore new datasets before diving deep
- **Product Manager** - Generate reports for stakeholders in minutes
- **Developer** - Integrate AI-powered analytics into your applications
- **Researcher** - Analyze experimental data with AI assistance

Simply upload your data, and the agent handles the rest - from statistical analysis to visualizations to AI-powered insights.

## 🛠️ Technical Details

### Architecture

The Data Analytics Agent is built with a modular architecture:

- **Analyzer Module** (`analyzer.py`) - Core data loading and statistical analysis
- **AI Insights Module** (`ai_insights.py`) - Alchemyst AI integration for intelligent insights
- **Visualizer Module** (`visualizer.py`) - Chart and graph generation
- **Report Generator** (`report_generator.py`) - Multi-format report creation
- **CLI Interface** (`main.py`) - User-friendly command-line interface

### Alchemyst AI Integration

The agent leverages Alchemyst AI Platform for:

1. **Data Summarization** - Generate executive summaries of datasets
2. **Pattern Detection** - Identify trends, seasonality, and anomalies
3. **Natural Language Understanding** - Answer questions in plain English
4. **Correlation Explanation** - Provide business context for statistical relationships
5. **Recommendations** - Suggest actionable next steps

### Technology Stack

- **Core**: Python 3.10+
- **AI**: Alchemyst AI SDK
- **Data Processing**: pandas, numpy, scipy
- **Visualization**: matplotlib, seaborn, plotly
- **Reports**: reportlab, jinja2
- **CLI**: click

## 🧪 Running the Demo

Try the full demo to see all features:

```bash
python examples/demo.py
```

This will:
1. Load sample data
2. Perform statistical analysis
3. Calculate correlations
4. Generate visualizations
5. Create AI insights
6. Generate reports in multiple formats

## 📝 API Reference

For detailed API documentation, see [docs/api_usage.md](docs/api_usage.md)

### Python API Usage

You can also use the agent programmatically:

```python
from analyzer import DataAnalyzer
from ai_insights import AlchemystInsights
from visualizer import DataVisualizer

# Load and analyze data
analyzer = DataAnalyzer()
df = analyzer.load_data("data.csv")
stats = analyzer.get_basic_stats()

# Generate AI insights
ai = AlchemystInsights()
summary = ai.generate_summary(df)

# Create visualizations
visualizer = DataVisualizer(df, "./output")
charts = visualizer.auto_visualize()
```

## 🧪 Running Tests

Run the test suite:

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=app --cov-report=html
```

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows PEP 8 style guide
- All tests pass
- Documentation is updated
- Commit messages are clear

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Alchemyst AI Platform](https://platform.getalchemystai.com)
- [API Documentation](https://docs.getalchemystai.com)
- [Alchemyst Community Discord](https://dub.sh/context-community)
- [awesome-saas Repository](https://github.com/Alchemyst-ai/awesome-saas)

## 👥 Contributors

- **[iamtensaiii](https://github.com/iamtensaiii)** - Creator and maintainer of the Data Analytics Agent

## 🙏 Acknowledgments

- Built with [Alchemyst AI Platform](https://platform.getalchemystai.com)
- Part of the [awesome-saas](https://github.com/Alchemyst-ai/awesome-saas) collection
- Created for Hacktoberfest 2025 by [iamtensaiii](https://github.com/iamtensaiii)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Alchemyst-ai/awesome-saas/issues)
- **Discord**: [Join our community](https://dub.sh/context-community)
- **Documentation**: [Alchemyst Docs](https://docs.getalchemystai.com)

---

<div align="center">

**Made with ❤️ using Alchemyst AI Platform**

[⭐ Star on GitHub](https://github.com/Alchemyst-ai/awesome-saas) | [🐛 Report Bug](https://github.com/Alchemyst-ai/awesome-saas/issues) | [💡 Request Feature](https://github.com/Alchemyst-ai/awesome-saas/issues)

</div>

