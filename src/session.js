//Session management

var auth = require("./auth")
var userdb = require("./userdb")
var crypto = require("crypto");
var Tokens = require("csrf");
var tokens = new Tokens();

var sessions = {};

/**
 * Returns user data if available. Use locals.user when restrict() has been applied to the request
 * @param {*} req 
 * @returns 
 */
function sessionUser(req) {
    if (!("secret" in req.cookies)) {return undefined;}
    var secret = req.cookies["secret"];
    if (secret.length != 16) {return undefined;}
    return sessions[secret];
}

/**
 * Restricts acces to page to users depending on level
 * @param {String} level Entweder "all", "user" oder "admin"
 */
function restrict(level, with_csrf_token=false) {
    return function(req, res, next) {
        let user = sessionUser(req)
        let valid_user = user !== undefined || level === "all"
        if (!valid_user) {res.redirect("/login");return}
        res.locals.user = user
        let authorized_user = (level !== "admin" || user.isadmin)
        let token_valid = false
        if (user) {
            res.locals.csrf_token = tokens.create(user.csrf_secret);
            token_valid = tokens.verify(user.csrf_secret, req.body._csrf)
        }
        if (!authorized_user) {
            res.redirect("/login")
        }
        else if (with_csrf_token && !token_valid) {
            res.status(401)
            res.send("Failed to validate csrf token");
        }
        else {
            next()
        }
    };
}

/**
 * Validates user credentials and returns a session id if correct
 * @param {String} username 
 * @param {String} pwd 
 * @returns {Promise<String>} Session id
 */
async function createSession(username, pwd) {
    if (username.length > 50) {return undefined;}
    var user = await userdb.user_by_name(username);
    if (user === undefined) {return undefined;}
    if (auth.credentialsValid(pwd, user)) {
        let session_id = crypto.randomBytes(8).toString("hex");
        let csrf_secret = await tokens.secret();
        sessions[session_id] = {uname: username, uid: user.userid, isadmin: user.isadmin, csrf_secret};
        setTimeout(() => {delete sessions[session_id]}, 43200000) //Session deleted after 12 hours
        return session_id;
    }
    return undefined;
}

function deleteSession(session_id) {
    delete sessions[session_id];
}

function endSession(req) {
    var secret = req.cookies["secret"];
    delete sessions[secret];
}

module.exports = {restrict, createSession, sessionUser, endSession, deleteSession};