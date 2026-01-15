const validators = require('./validators');
const transformers = require('./transformers');
const processors = require('./processors');

module.exports = {
  // Validators
  validateEmail: validators.validateEmail,
  validatePhone: validators.validatePhone,
  validateDate: validators.validateDate,
  validateCurrency: validators.validateCurrency,

  // Transformers
  csvToJson: transformers.csvToJson,
  normalizeData: transformers.normalizeData,

  // Processors
  processBatch: processors.processBatch,
  createPipeline: processors.createPipeline
};
