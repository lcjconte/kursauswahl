// Authentification functions

let crypto = require("crypto")

/**
 * Compute a 60 char hash from a password and a salt
 * @param {String} pwd
 * @param {String} salt
 * @returns 60 char hash buffer
 */
function pwdhash(pwd, salt) {
    return crypto.pbkdf2Sync(pwd, salt, 100000, 45, "sha512")
}

function credentialsValid(pwd, user) {
    return crypto.timingSafeEqual(Buffer.from(user.pwdhash, "base64"), pwdhash(pwd, user.salt))
}

module.exports = { pwdhash, credentialsValid }
