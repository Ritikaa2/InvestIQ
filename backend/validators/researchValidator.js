const { body } = require('express-validator');

module.exports = {
  researchValidator: [
    body('ticker')
      .trim()
      .notEmpty().withMessage('Stock ticker symbol is required')
      .isLength({ min: 1, max: 10 }).withMessage('Ticker symbol must be between 1 and 10 characters')
      .toUpperCase()
  ]
};
