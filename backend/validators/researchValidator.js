const { body } = require('express-validator');

module.exports = {
  researchValidator: [
    body()
      .custom((value) => {
        const input = value?.ticker || value?.companyName || value?.company_name || value?.query;
        return typeof input === 'string' && input.trim().length > 0;
      })
      .withMessage('Company name or ticker symbol is required'),
    body('ticker')
      .optional({ checkFalsy: true })
      .isString().withMessage('Ticker must be text')
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Ticker or company search must be between 1 and 100 characters'),
    body('companyName')
      .optional({ checkFalsy: true })
      .isString().withMessage('Company name must be text')
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Company name must be between 1 and 100 characters'),
    body('query')
      .optional({ checkFalsy: true })
      .isString().withMessage('Search query must be text')
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
  ]
};