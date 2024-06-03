const CustodyError = require("./custody-error");

class ApiError extends CustodyError {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

module.exports = ApiError;
