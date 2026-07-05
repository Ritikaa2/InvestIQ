const axios = require('axios');

function getDeterministicNews(ticker, companyName) {
  const t = ticker.toUpperCase().trim();
  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = t.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const topics = [
    {
      title: `${companyName} Unveils Next-Gen AI Integration Plans`,
      summary: `${companyName} announced major updates to its product line, detailing deep integrations with generative AI. Analysts reacted positively, calling it a major catalyst for growth.`,
      sentiment: 'positive',
      score: 0.85,
      source: 'Bloomberg Technology'
    },
    {
      title: `${companyName} Q2 Earnings Beat Estimates, Revenue Rises ${((hash % 10) + 4)}%`,
      summary: `${companyName} reported stronger-than-expected financial performance for the second quarter, outperforming expectations on both top and bottom lines. Enterprise demand remains robust.`,
      sentiment: 'positive',
      score: 0.90,
      source: 'Wall Street Journal'
    },
    {
      title: `Antitrust Regulators Launch Formal Inquiry Into ${companyName}`,
      summary: `The Federal Trade Commission and EU authorities have launched a joint inquiry into ${companyName}'s market practices. The investigation focuses on potential anti-competitive behavior.`,
      sentiment: 'negative',
      score: -0.75,
      source: 'Financial Times'
    },
    {
      title: `${companyName} Facing Supply Chain Bottlenecks in Asian Markets`,
      summary: `Insiders report that manufacturing slowdowns and logistics constraints in key parts supplier hubs could lead to product shipment delays in the upcoming holiday quarter.`,
      sentiment: 'negative',
      score: -0.60,
      source: 'Reuters Business'
    },
    {
      title: `Institutional Investors Increase Holdings in ${companyName}`,
      summary: `Recent 13F filings reveal a significant increase in shares owned by major mutual funds and pensions, reflecting long-term confidence in ${companyName}'s capital allocation.`,
      sentiment: 'positive',
      score: 0.65,
      source: 'CNBC'
    },
    {
      title: `${companyName} Appoints New Chief Technology Officer`,
      summary: `${companyName} announced today that their current VP of Engineering will step up as the new CTO. The transition is expected to take place smoothly over the next month.`,
      sentiment: 'neutral',
      score: 0.05,
      source: 'TechCrunch'
    }
  ];

  // Calculate overall sentiment score
  const totalScore = topics.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalScore / topics.length;

  const articles = topics.map((topic, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index * 2);
    return {
      id: `${t}-news-${index}`,
      title: topic.title,
      summary: topic.summary,
      sentiment: topic.sentiment,
      sentimentScore: topic.score,
      source: topic.source,
      url: `https://finance.yahoo.com/quote/${t}`,
      publishedAt: date.toISOString().split('T')[0]
    };
  });

  return {
    articles,
    sentimentScore: Math.round(((avgScore + 1) / 2) * 100), // convert -1..1 to 0..100
    sentimentCategory: avgScore > 0.15 ? 'Bullish' : (avgScore < -0.15 ? 'Bearish' : 'Neutral')
  };
}

module.exports = {
  getCompanyNews: async (ticker, companyName) => {
    const t = ticker.toUpperCase().trim();
    const newsApiKey = process.env.NEWS_API_KEY;
    const tavilyApiKey = process.env.TAVILY_API_KEY;

    // Try News API
    if (newsApiKey && newsApiKey !== 'your_news_api_key') {
      try {
        console.log(`[NewsService] Fetching from NewsAPI for ${t}...`);
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName || t)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`;
        const response = await axios.get(url);
        if (response.data && response.data.articles) {
          const articles = response.data.articles.map((art, idx) => {
            // Basic sentiment analysis mock for real news based on keyword checks
            const text = (art.title + ' ' + art.description).toLowerCase();
            let score = 0;
            if (text.includes('beat') || text.includes('surge') || text.includes('growth') || text.includes('innovate') || text.includes('buy')) {
              score = 0.6;
            } else if (text.includes('fall') || text.includes('decline') || text.includes('sue') || text.includes('investigate') || text.includes('antitrust')) {
              score = -0.6;
            }
            
            return {
              id: `${t}-real-news-${idx}`,
              title: art.title,
              summary: art.description || art.content || 'No summary available.',
              sentiment: score > 0.1 ? 'positive' : (score < -0.1 ? 'negative' : 'neutral'),
              sentimentScore: score,
              source: art.source.name || 'News Source',
              url: art.url,
              publishedAt: art.publishedAt.split('T')[0]
            };
          });

          const totalScore = articles.reduce((acc, curr) => acc + curr.sentimentScore, 0);
          const avgScore = articles.length > 0 ? totalScore / articles.length : 0;
          return {
            articles,
            sentimentScore: Math.round(((avgScore + 1) / 2) * 100),
            sentimentCategory: avgScore > 0.1 ? 'Bullish' : (avgScore < -0.1 ? 'Bearish' : 'Neutral')
          };
        }
      } catch (err) {
        console.error(`[NewsService] NewsAPI failed for ${t}, trying Tavily or falling back:`, err.message);
      }
    }

    // Try Tavily if NewsAPI failed or wasn't set
    if (tavilyApiKey && tavilyApiKey !== 'your_tavily_api_key') {
      try {
        console.log(`[NewsService] Fetching from Tavily Search for ${t} latest news...`);
        const url = 'https://api.tavily.com/search';
        const response = await axios.post(url, {
          api_key: tavilyApiKey,
          query: `${companyName || t} stock latest news sentiment earnings`,
          search_depth: 'advanced',
          include_answer: false,
          max_results: 5
        });

        if (response.data && response.data.results) {
          const articles = response.data.results.map((res, idx) => {
            const text = (res.title + ' ' + res.content).toLowerCase();
            let score = 0;
            if (text.includes('beat') || text.includes('surge') || text.includes('growth') || text.includes('gain')) {
              score = 0.5;
            } else if (text.includes('drop') || text.includes('fail') || text.includes('investigation') || text.includes('suit')) {
              score = -0.5;
            }
            return {
              id: `${t}-tavily-news-${idx}`,
              title: res.title,
              summary: res.content,
              sentiment: score > 0.1 ? 'positive' : (score < -0.1 ? 'negative' : 'neutral'),
              sentimentScore: score,
              source: new URL(res.url).hostname.replace('www.', ''),
              url: res.url,
              publishedAt: new Date().toISOString().split('T')[0]
            };
          });

          const totalScore = articles.reduce((acc, curr) => acc + curr.sentimentScore, 0);
          const avgScore = articles.length > 0 ? totalScore / articles.length : 0;
          return {
            articles,
            sentimentScore: Math.round(((avgScore + 1) / 2) * 100),
            sentimentCategory: avgScore > 0.1 ? 'Bullish' : (avgScore < -0.1 ? 'Bearish' : 'Neutral')
          };
        }
      } catch (err) {
        console.error(`[NewsService] Tavily news fetch failed for ${t}, falling back to mock:`, err.message);
      }
    }

    // Default to deterministic mocks
    return getDeterministicNews(t, companyName || `${t} Corp`);
  }
};
