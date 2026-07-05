const axios = require('axios');

// Deterministic mock generator based on ticker hash to ensure consistent results per stock
function getDeterministicStockData(ticker) {
  const t = ticker.toUpperCase().trim();
  
  // Calculate a hash from the ticker characters
  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = t.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // Popular stock specific definitions
  const profiles = {
    AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', cap: 3200000000000, price: 185.50, pe: 28.5, eps: 6.45, gr: 0.08, margin: 0.25 },
    MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software - Infrastructure', cap: 3100000000000, price: 420.20, pe: 35.8, eps: 11.60, gr: 0.12, margin: 0.34 },
    TSLA: { name: 'Tesla, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', cap: 550000000000, price: 175.40, pe: 42.1, eps: 4.10, gr: 0.18, margin: 0.10 },
    AMZN: { name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', cap: 1900000000000, price: 180.10, pe: 39.4, eps: 4.55, gr: 0.14, margin: 0.06 },
    GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', cap: 2100000000000, price: 170.30, pe: 25.2, eps: 6.80, gr: 0.11, margin: 0.24 },
    GOOG: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', cap: 2100000000000, price: 170.30, pe: 25.2, eps: 6.80, gr: 0.11, margin: 0.24 },
    GOOGLE: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', cap: 2100000000000, price: 170.30, pe: 25.2, eps: 6.80, gr: 0.11, margin: 0.24 },
    NVDA: { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', cap: 2800000000000, price: 120.40, pe: 65.2, eps: 1.85, gr: 0.85, margin: 0.48 }
  };

  const p = profiles[t] || {
    name: `${t} Corporation`,
    sector: ['Technology', 'Financial Services', 'Healthcare', 'Industrials', 'Consumer Defensive'][hash % 5],
    industry: ['Software', 'Biotechnology', 'Asset Management', 'Banks', 'Retail', 'Semiconductors'][hash % 6],
    cap: (hash % 1000 + 50) * 1000000000, // 50B to 1.05T
    price: (hash % 450 + 10) + 0.50, // 10 to 460
    pe: (hash % 30 + 12) + 0.3, // 12 to 42
    eps: (hash % 12 + 1) + 0.15, // 1 to 13
    gr: (hash % 20 + 2) / 100, // 2% to 22%
    margin: (hash % 25 + 5) / 100 // 5% to 30%
  };

  // Generate 5 years of historical financial data
  const baseRevenue = p.cap / p.pe * 2.5; // Estimated revenue based on market cap
  const years = [2022, 2023, 2024, 2025, 2026];
  const financials = years.map((year, idx) => {
    const growthFactor = Math.pow(1 + p.gr, idx - 2); // growth around center year
    const rev = baseRevenue * growthFactor * (1 + (hash % 5 - 2) * 0.02);
    const netMargin = p.margin * (1 + (hash % 3 - 1) * 0.01 * idx);
    const profit = rev * netMargin;
    const fcf = profit * 0.95; // FCF is 95% of Net Income
    const debt = p.cap * 0.15 * (1 - idx * 0.01); // decreasing debt ratio
    
    return {
      year,
      revenue: Math.round(rev),
      profit: Math.round(profit),
      freeCashFlow: Math.round(fcf),
      totalDebt: Math.round(debt)
    };
  });

  return {
    ticker: t,
    companyName: p.name,
    sector: p.sector,
    industry: p.industry,
    marketCap: p.cap,
    currentPrice: p.price,
    peRatio: p.pe,
    eps: p.eps,
    revenueGrowthRate: p.gr * 100,
    profitMargin: p.margin * 100,
    financialHistory: financials,
    balanceSheet: {
      totalCash: Math.round(p.cap * 0.05),
      totalDebt: Math.round(p.cap * 0.12),
      currentRatio: 1.8 + (hash % 10) / 10
    }
  };
}

module.exports = {
  getCompanyProfile: async (ticker) => {
    const t = ticker.toUpperCase().trim();
    
    // Call AlphaVantage or Yahoo Finance if keys are present
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (apiKey && apiKey !== 'your_alpha_vantage_api_key') {
      try {
        console.log(`[FinanceService] Fetching profile from AlphaVantage for ${t}...`);
        const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${t}&apikey=${apiKey}`;
        const response = await axios.get(url);
        if (response.data && response.data.Symbol) {
          const d = response.data;
          return {
            ticker: d.Symbol,
            companyName: d.Name,
            description: d.Description,
            sector: d.Sector,
            industry: d.Industry,
            marketCap: parseInt(d.MarketCapitalization) || 0,
            peRatio: parseFloat(d.PERatio) || 0,
            eps: parseFloat(d.EPS) || 0,
            currentPrice: 0 // Fetch separately
          };
        }
      } catch (err) {
        console.error(`[FinanceService] AlphaVantage fetch failed for ${t}, falling back to mock:`, err.message);
      }
    }

    // Return deterministic mock if api key fails or isn't set
    const mock = getDeterministicStockData(t);
    return {
      ticker: mock.ticker,
      companyName: mock.companyName,
      description: `${mock.companyName} is a leading global enterprise operating within the ${mock.sector} sector, specifically in the ${mock.industry} industry. It is highly recognized for its technological innovations, market position, and robust capital structures, which have allowed it to sustain a market capitalisation of $${(mock.marketCap / 1e9).toFixed(2)} billion.`,
      sector: mock.sector,
      industry: mock.industry,
      marketCap: mock.marketCap,
      peRatio: mock.peRatio,
      eps: mock.eps
    };
  },

  getCompanyFinancials: async (ticker) => {
    const t = ticker.toUpperCase().trim();
    
    // Check if we have AlphaVantage credentials
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (apiKey && apiKey !== 'your_alpha_vantage_api_key') {
      try {
        console.log(`[FinanceService] Fetching financials from AlphaVantage for ${t}...`);
        const incomeUrl = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${t}&apikey=${apiKey}`;
        const cashUrl = `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${t}&apikey=${apiKey}`;
        
        const [incomeRes, cashRes] = await Promise.all([
          axios.get(incomeUrl),
          axios.get(cashUrl)
        ]);

        if (incomeRes.data && incomeRes.data.annualReports) {
          const reports = incomeRes.data.annualReports.slice(0, 5).reverse();
          const cashReports = cashRes.data.annualReports ? cashRes.data.annualReports.slice(0, 5).reverse() : [];
          
          const history = reports.map((r, i) => {
            const fcfReport = cashReports[i] || {};
            return {
              year: new Date(r.fiscalDateEnding).getFullYear(),
              revenue: parseInt(r.totalRevenue) || 0,
              profit: parseInt(r.netIncome) || 0,
              freeCashFlow: parseInt(fcfReport.operatingCashflow) - parseInt(fcfReport.capitalExpenditures) || 0,
              totalDebt: 0 // Fetch from balance sheet
            };
          });

          const mock = getDeterministicStockData(t);
          return {
            marketCap: mock.marketCap,
            currentPrice: mock.currentPrice,
            peRatio: mock.peRatio,
            eps: mock.eps,
            revenueGrowthRate: mock.revenueGrowthRate,
            profitMargin: mock.profitMargin,
            financialHistory: history,
            balanceSheet: mock.balanceSheet
          };
        }
      } catch (err) {
        console.error(`[FinanceService] AlphaVantage financials failed for ${t}, falling back to mock:`, err.message);
      }
    }

    // Default to deterministic mocks
    return getDeterministicStockData(t);
  }
};
