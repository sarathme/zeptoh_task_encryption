const crypto = require("crypto");

const KEY = crypto.createHash("sha256").update("internsNeverGuess").digest();
const SALT = "SALT1234";

function encryptField(value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const encryptedValue = Buffer.concat([
    cipher.update(SALT + value, "utf-8"),
    cipher.final(),
  ]).toString("base64");

  return {
    data: encryptedValue,
    iv: iv.toString("base64"),
  };
}

module.exports = { encryptField };
