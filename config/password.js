const crypto = require("crypto");

function generateSixDigitPassword() {
  return crypto.randomInt(100000, 999999).toString();
}

module.exports = { generateSixDigitPassword };
