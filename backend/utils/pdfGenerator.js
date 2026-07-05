const PDFDocument = require('pdfkit');

module.exports = {
  generateReportPDF: (res, report) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="InvestIQ_Report_${report.profile.ticker}.pdf"`);
    
    // Pipe PDF directly to response
    doc.pipe(res);

    // Color Palette
    const primaryColor = '#0F172A'; // Slate 900
    const secondaryColor = '#3B82F6'; // Blue 500
    const textColor = '#334155'; // Slate 700
    const lightBg = '#F8FAFC'; // Slate 50
    const borderColor = '#E2E8F0'; // Slate 200

    // Header Branding
    doc.fillColor(secondaryColor).fontSize(20).font('Helvetica-Bold').text('InvestIQ', 50, 50);
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text('AI Equity Research System', 140, 58);
    doc.moveTo(50, 80).lineTo(545, 80).strokeColor(borderColor).stroke();

    // Document Title
    doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('EQUITY RESEARCH REPORT', 50, 110);
    doc.fillColor(secondaryColor).fontSize(16).text(`${report.profile.companyName} (${report.profile.ticker})`, 50, 140);
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(`Generated Date: ${new Date().toLocaleDateString()}`, 50, 165);

    // Summary Card Box
    doc.rect(50, 190, 495, 100).fill(lightBg);
    doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('EXECUTIVE RECOMMENDATION', 65, 205);
    
    // Recommendation text color
    let recColor = '#10B981'; // Green
    if (report.decision.recommendation === 'HOLD') recColor = '#F59E0B'; // Orange
    if (report.decision.recommendation === 'PASS') recColor = '#EF4444'; // Red

    doc.fillColor(recColor).fontSize(24).font('Helvetica-Bold').text(report.decision.recommendation, 65, 230);
    
    // Score Indicators
    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('INVESTMENT SCORE', 250, 215);
    doc.fontSize(18).text(`${report.decision.investmentScore} / 100`, 250, 230);

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('CONFIDENCE LEVEL', 400, 215);
    doc.fontSize(18).text(`${report.decision.confidenceScore}%`, 400, 230);

    // Section 1: Business Profile
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('1. Company Profile', 50, 310);
    doc.moveTo(50, 328).lineTo(545, 328).strokeColor(borderColor).stroke();
    
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(report.profile.overview || '', 50, 340, { width: 495, align: 'justify', lineGap: 4 });

    // Details grid
    let y = 430;
    doc.fillColor(primaryColor).font('Helvetica-Bold').text('CEO:', 50, y);
    doc.fillColor(textColor).font('Helvetica').text(report.profile.ceo || 'N/A', 140, y);
    doc.fillColor(primaryColor).font('Helvetica-Bold').text('Sector:', 300, y);
    doc.fillColor(textColor).font('Helvetica').text(report.profile.sector || 'N/A', 380, y);

    y += 20;
    doc.fillColor(primaryColor).font('Helvetica-Bold').text('Headquarters:', 50, y);
    doc.fillColor(textColor).font('Helvetica').text(report.profile.headquarters || 'N/A', 140, y);
    doc.fillColor(primaryColor).font('Helvetica-Bold').text('Industry:', 300, y);
    doc.fillColor(textColor).font('Helvetica').text(report.profile.industry || 'N/A', 380, y);

    // Page Break
    doc.addPage();

    // Section 2: Financials
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('2. Financial Statement Analysis', 50, 50);
    doc.moveTo(50, 68).lineTo(545, 68).strokeColor(borderColor).stroke();

    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(report.financials.overview || '', 50, 80, { width: 495, lineGap: 3 });

    // Table Header
    y = 150;
    doc.rect(50, y, 495, 20).fill(primaryColor);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
    doc.text('Year', 65, y + 6);
    doc.text('Revenue (USD)', 150, y + 6);
    doc.text('Net Income (USD)', 260, y + 6);
    doc.text('Free Cash Flow (USD)', 380, y + 6);

    // Table Rows
    y += 20;
    doc.fillColor(textColor).font('Helvetica').fontSize(9);
    report.financials.financialHistory.forEach((row, index) => {
      if (index % 2 === 0) {
        doc.rect(50, y, 495, 20).fill(lightBg);
      }
      doc.fillColor(textColor);
      doc.text(row.year, 65, y + 6);
      doc.text(`$${(row.revenue / 1e9).toFixed(2)}B`, 150, y + 6);
      doc.text(`$${(row.profit / 1e9).toFixed(2)}B`, 260, y + 6);
      doc.text(`$${(row.freeCashFlow / 1e9).toFixed(2)}B`, 380, y + 6);
      y += 20;
    });

    // Key financial metrics
    y += 20;
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('Key Multipliers & Margins', 50, y);
    y += 15;
    doc.fillColor(textColor).font('Helvetica').fontSize(9);
    doc.text(`P/E Ratio: ${report.financials.peRatio.toFixed(2)}x`, 55, y);
    doc.text(`Earnings Per Share (EPS): $${report.financials.eps.toFixed(2)}`, 200, y);
    doc.text(`Profit Margin: ${report.financials.profitMargin.toFixed(1)}%`, 380, y);

    // Section 3: Competitor Analysis
    y += 40;
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('3. Competitor Landscape', 50, y);
    doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor(borderColor).stroke();
    
    y += 30;
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(report.competitors.marketShareSummary || '', 50, y, { width: 495 });

    // Competitors Table
    y += 35;
    doc.rect(50, y, 495, 20).fill(secondaryColor);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
    doc.text('Competitor', 65, y + 6);
    doc.text('Est. Market Share', 180, y + 6);
    doc.text('Competitive Moat / Disadvantage', 300, y + 6);

    y += 20;
    doc.fillColor(textColor).font('Helvetica').fontSize(9);
    report.competitors.competitors.forEach((c, idx) => {
      if (idx % 2 === 0) {
        doc.rect(50, y, 495, 20).fill(lightBg);
      }
      doc.fillColor(textColor);
      doc.text(c.name, 65, y + 6);
      doc.text(c.marketShareEstimated, 180, y + 6);
      doc.text(`${c.keyAdvantage} / ${c.keyDisadvantage}`, 300, y + 6, { width: 235 });
      y += 20;
    });

    // Page Break
    doc.addPage();

    // Section 4: SWOT & Risks
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('4. Strategic SWOT & Risks', 50, 50);
    doc.moveTo(50, 68).lineTo(545, 68).strokeColor(borderColor).stroke();

    // SWOT Box
    y = 80;
    doc.rect(50, y, 240, 100).fill(lightBg);
    doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(11).text('STRENGTHS', 60, y + 10);
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5);
    report.swot.strengths.slice(0, 3).forEach((s, idx) => {
      doc.text(`• ${s}`, 60, y + 28 + (idx * 22), { width: 220 });
    });

    doc.rect(305, y, 240, 100).fill(lightBg);
    doc.fillColor('#B91C1C').font('Helvetica-Bold').fontSize(11).text('WEAKNESSES', 315, y + 10);
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5);
    report.swot.weaknesses.slice(0, 3).forEach((w, idx) => {
      doc.text(`• ${w}`, 315, y + 28 + (idx * 22), { width: 220 });
    });

    y += 115;
    doc.rect(50, y, 240, 100).fill(lightBg);
    doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(11).text('OPPORTUNITIES', 60, y + 10);
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5);
    report.swot.opportunities.slice(0, 3).forEach((o, idx) => {
      doc.text(`• ${o}`, 60, y + 28 + (idx * 22), { width: 220 });
    });

    doc.rect(305, y, 240, 100).fill(lightBg);
    doc.fillColor('#92400E').font('Helvetica-Bold').fontSize(11).text('THREATS', 315, y + 10);
    doc.fillColor(textColor).font('Helvetica').fontSize(8.5);
    report.swot.threats.slice(0, 3).forEach((t, idx) => {
      doc.text(`• ${t}`, 315, y + 28 + (idx * 22), { width: 220 });
    });

    // Risks Summary
    y += 130;
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Risk Matrix Ratings', 50, y);
    doc.moveTo(50, y + 15).lineTo(545, y + 15).strokeColor(borderColor).stroke();

    y += 25;
    doc.fillColor(textColor).font('Helvetica').fontSize(9.5);
    doc.text(`Business Risks: ${report.risks.businessRisks.join(', ')}`, 55, y, { width: 480 });
    y += 25;
    doc.text(`Political Risks: ${report.risks.politicalRisks.join(', ')}`, 55, y, { width: 480 });
    y += 25;
    doc.text(`Economic Risks: ${report.risks.economicRisks.join(', ')}`, 55, y, { width: 480 });
    y += 25;
    doc.text(`Technology Risks: ${report.risks.technologyRisks.join(', ')}`, 55, y, { width: 480 });

    // Section 5: Decision Committee summary
    y += 45;
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('5. Final Committee Decision Summary', 50, y);
    doc.moveTo(50, y + 18).lineTo(545, y + 18).strokeColor(borderColor).stroke();

    y += 30;
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(report.decision.aiSummary || '', 50, y, { width: 495, lineGap: 3 });

    y += 60;
    doc.fillColor(textColor).fontSize(8).text('Disclaimer: InvestIQ is an automated generative AI assistant. All opinions are synthetic summaries and do not constitute professional financial advice. Invest at your own discretion.', 50, y, { align: 'center' });

    // Finalize PDF
    doc.end();
  }
};
