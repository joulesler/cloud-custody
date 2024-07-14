const CustodyError = require('./custody-error');

class ValidationError extends CustodyError {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

module.exports = ValidationError;
