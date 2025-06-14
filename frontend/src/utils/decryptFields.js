import CryptoJS from "crypto-js";

const SALT = "SALT1234";
const KEY = CryptoJS.SHA256("internsNeverGuess");

export function decryptField({ data, iv }) {
  try {
    const decrypted = CryptoJS.AES.decrypt(data, KEY, {
      iv: CryptoJS.enc.Base64.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);

    if (!decrypted.startsWith(SALT)) return null;

    const fieldDef = decrypted.slice(SALT.length);
    if (!/^.+:.+$/.test(fieldDef)) return null;

    const [label, type] = fieldDef.split(":");
    return { label, type };
  } catch {
    return null;
  }
}
