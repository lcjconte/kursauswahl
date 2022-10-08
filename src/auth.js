//Authentification module

var db = require("../src/db_manage");
var crypto = require("crypto");

var sessions = {};


function sessionUser(req) {
    if (!("secret" in req.cookies)) {return undefined;}
    var secret = req.cookies["secret"];
    if (secret.length != 16) {return undefined;}
    return sessions[secret];
}

/**
 * Restricts acces to page to users depending on level
 * @param {String} level Entweder "user" oder "admin"
 */
function restrict(level) {
    return function(req, res, next) {
        let user = sessionUser(req);
        if (user !== undefined && (level !== "admin" || user[2])) {
            next(); //Zugriff auf die Seite falls gueltige session
        }
        else {
            res.redirect("/login"); //Ansonsten zurueck zur Startseite
        }
    };
}

/**
 * 
 * @param {String} username 
 * @param {String} pwd 
 * @returns {String} Session id
 */
async function validate(username, pwd) {
    //Check if user exists
    if (username.length > 50) {return undefined;}
    var user = await db.user_by_name(username);
    if (user === undefined) {return undefined;}
    var hash = pwdhash(pwd, username);
    if (hash == user.pwd) {
        //Assume correct
        let session_id = crypto.randomBytes(8).toString("hex");
        sessions[session_id] = [username, user.userid, user.isadmin];
        return session_id;
    }
    return undefined;
}

function endSession(req) {
    var secret = req.cookies["secret"];
    if (secret in sessions) {
        delete sessions[secret];
    }
}

function pwdhash(pwd, salt) {
    var hash = crypto.createHash("sha512")
        .update(pwd)
        .update(salt)
        .digest().toString("hex");
    return hash.slice(0, 60);
}

module.exports = {restrict, validate, pwdhash, sessionUser, endSession}