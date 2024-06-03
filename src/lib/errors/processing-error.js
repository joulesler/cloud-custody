const CustodyError = require("./custody-error");

class ProcessingError extends CustodyError {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = ProcessingError;
