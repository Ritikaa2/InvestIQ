module.exports = {
  profilePrompt: (company, ticker) => `
You are an expert Equity Research Analyst.
Compile a detailed business profile for ${company} (${ticker}).
Your response must be a JSON object with the following fields:
- overview: A detailed 2-3 paragraph summary of the company's business model, value proposition, and recent developments.
- sector: The sector the company operates in.
- industry: The specific industry.
- coreProducts: An array of their top 3-4 products/services.
- customerBase: A short description of who their main customers are.
- ceo: The current CEO.
- headquarters: City, State/Country.
`,

  financePrompt: (company, financials) => `
You are an institutional financial analyst.
Analyze the following financial metrics for ${company}:
${JSON.stringify(financials, null, 2)}

Provide a structured financial analysis in JSON format:
- overview: Summary of the company's current financial strength, cash position, and debt profile.
- rating: An analysis of their liquidity, leverage, and margins.
- metricEvaluations: {
    revenueGrowth: string (e.g. "strong", "moderate", "declining"),
    profitability: string,
    debtLeverage: string,
    cashFlowStrength: string
  }
- keyTakeaways: An array of 3 bullet points summarising the balance sheet and income statements.
`,

  newsPrompt: (company, newsItems) => `
You are a financial news intelligence analyst.
Analyze the latest news and sentiment for ${company}:
${JSON.stringify(newsItems, null, 2)}

Provide a sentiment assessment in JSON format:
- summary: A summary of what is driving the news (e.g., earnings beats, product launches, lawsuits).
- bullishCatalysts: Array of 2-3 positive events/factors mentioned.
- bearishCatalysts: Array of 2-3 negative events/factors mentioned.
- overallSentiment: "Bullish", "Bearish", or "Neutral".
`,

  competitorPrompt: (company, sector, competitors) => `
You are a competitive intelligence director.
Analyze the competitive landscape for ${company} in the ${sector} sector.
Provide a competitor matrix and market analysis in JSON format:
- marketShareSummary: 2-3 sentences describing the company's market share and standing.
- competitors: An array of objects, each containing:
    name: Competitor name
    marketShareEstimated: Percentage (e.g. "25%")
    keyAdvantage: Competitor's primary advantage
    keyDisadvantage: Competitor's primary weakness
- clientAdvantages: Array of 3 advantages ${company} has over its peers.
- clientDisadvantages: Array of 3 disadvantages ${company} has compared to peers.
`,

  swotPrompt: (company, profile, financials, news) => `
You are a strategic management consultant.
Develop a rigorous SWOT analysis for ${company} based on:
Profile: ${JSON.stringify(profile)}
Financials: ${JSON.stringify(financials)}
News: ${JSON.stringify(news)}

Provide the SWOT analysis in JSON format:
- strengths: Array of 4 key strengths
- weaknesses: Array of 4 key weaknesses
- opportunities: Array of 4 future opportunities
- threats: Array of 4 potential external threats
`,

  riskPrompt: (company, financials, competitors) => `
You are a chief risk officer.
Analyze the business risks for ${company}.
Categorize and detail the risks in JSON format:
- businessRisks: Array of 2 risks (product failure, competition)
- politicalRisks: Array of 2 risks (regulations, tariffs)
- economicRisks: Array of 2 risks (inflation, interest rates)
- technologyRisks: Array of 2 risks (cybersecurity, disruption)
- riskRating: "Low", "Medium", "High"
`,

  decisionPrompt: (company, state) => `
You are the Investment Committee Chair.
Review all compiled research for ${company}:
${JSON.stringify(state, null, 2)}

Determine the final investment rating and score.
Provide your decision in JSON format:
- recommendation: "BUY", "HOLD", or "PASS"
- investmentScore: Integer from 0 to 100 representing the attractiveness of the investment.
- confidenceScore: Integer from 0 to 100 representing the certainty of your rating.
- coreRationale: An array of 4 distinct bullet points justifying the decision.
- aiSummary: A concise 3-4 sentence professional executive summary of the entire research dossier.
`
};
