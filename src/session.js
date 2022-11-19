// Session management

let auth = require("./auth")
let userdb = require("./userdb")
let crypto = require("crypto")
let Tokens = require("csrf")
let tokens = new Tokens()

let sessions = {}

/**
 * Returns user data if available. Use locals.user when restrict() has been applied to the request
 * @param {*} req
 * @returns
 */
function sessionUser(req) {
    if (!("secret" in req.cookies)) { return undefined }
    let secret = req.cookies.secret
    if (secret.length !== 16) { return undefined }
    return sessions[secret]
}

/**
 * Restricts acces to page to users depending on level
 * @param {String} level Entweder "all", "user" oder "admin"
 */
function restrict(level, withCSRFToken = false) {
    return function(req, res, next) {
        let user = sessionUser(req)
        let validUser = user !== undefined || level === "all"
        if (!validUser) { res.redirect("/login"); return }
        res.locals.user = user
        let authorizedUser = (level !== "admin" || user.isadmin)
        let tokenValid = false
        if (user) {
            res.locals.csrf_token = tokens.create(user.csrfSecret)
            tokenValid = tokens.verify(user.csrfSecret, req.body._csrf)
        }
        if (!authorizedUser) {
            res.redirect("/login")
        } else if (withCSRFToken && !tokenValid) {
            res.status(401)
            res.send("Failed to validate csrf token")
        } else {
            next()
        }
    }
}

/**
 * Validates user credentials and returns a session id if correct
 * @param {String} username
 * @param {String} pwd
 * @returns {Promise<String>} Session id
 */
async function createSession(username, pwd) {
    if (username.length > 50) { return undefined }
    let user = await userdb.userByName(username)
    if (user === undefined) { return undefined }
    if (auth.credentialsValid(pwd, user)) {
        let sessionId = crypto.randomBytes(8).toString("hex")
        let csrfSecret = await tokens.secret()
        sessions[sessionId] = { uname: username, uid: user.userid, isadmin: user.isadmin, csrfSecret }
        setTimeout(() => { delete sessions[sessionId] }, 43200000) // Session deleted after 12 hours
        return sessionId
    }
    return undefined
}

function deleteSession(sessionId) {
    delete sessions[sessionId]
}

function endSession(req) {
    let secret = req.cookies.secret
    delete sessions[secret]
}

module.exports = { restrict, createSession, sessionUser, endSession, deleteSession }
