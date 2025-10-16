# 📊 Stock Market Data Analytics - Test Commands

## ✅ Dataset Changed to Stock Market Data

The agent now uses **stock market data** with:
- 50 rows of real stock data
- 5 major stocks: AAPL, GOOGL, MSFT, TSLA, AMZN
- Metrics: open, high, low, close, volume, market cap, sector, % change

---

## 🚀 Quick Test Commands

### 1. Basic Analysis
```bash
cd /home/tensai/projects/awesome-saas/agents/data-analytics-agent
python3 app/main.py analyze examples/stock_market_data.csv
```

### 2. Generate HTML Report
```bash
cd /home/tensai/projects/awesome-saas/agents/data-analytics-agent
python3 app/main.py report examples/stock_market_data.csv --format html -o stock_report.html
explorer.exe stock_report.html
```

### 3. Interactive Q&A
```bash
cd /home/tensai/projects/awesome-saas/agents/data-analytics-agent
python3 app/main.py query examples/stock_market_data.csv --interactive
```

**Ask:**
- "Which stock has the highest average closing price?"
- "Show me trends for AAPL"  
- "What's the correlation between volume and change_pct?"

### 4. Full Demo
```bash
cd /home/tensai/projects/awesome-saas/agents/data-analytics-agent
python3 examples/demo.py
```

---

## 📁 Files Structure (Cleaned)

```
data-analytics-agent/
├── app/                  # Core code
├── examples/
│   ├── stock_market_data.csv  ← NEW!
│   └── demo.py
├── tests/               # Unit tests
├── docs/                # Documentation
├── README.md
└── HOW_IT_WORKS.md
```

---

## 🎯 What Was Done

✅ **Removed:** Old sales data (sample_sales.csv, sample_customers.json)  
✅ **Added:** Stock market dataset with 50 rows  
✅ **Updated:** All demo scripts to use stock data  
✅ **Updated:** HOW_IT_WORKS.md with stock examples  
✅ **Cleaned:** Removed unnecessary test files  

---

## 💡 Test It Now!

**Copy-paste this command:**
```bash
cd /home/tensai/projects/awesome-saas/agents/data-analytics-agent && python3 app/main.py analyze examples/stock_market_data.csv
```

You'll see:
- ✅ 50 rows, 10 columns loaded
- ✅ Stock price analysis (AAPL, GOOGL, MSFT, TSLA, AMZN)
- ✅ Correlation analysis (open ↔ close, volume trends)
- ✅ AI insights about stock market patterns
- ✅ Sector analysis (Technology, Automotive, E-commerce)

