const { validateEmail } = require('./email');
const { validatePhone } = require('./phone');
const { validateDate } = require('./date');
const { validateCurrency } = require('./currency');

module.exports = {
  validateEmail,
  validatePhone,
  validateDate,
  validateCurrency
};
