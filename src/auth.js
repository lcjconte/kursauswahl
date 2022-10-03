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
function validate(username, pwd) {
    //Check if user exists

    //TODO: 
    var hash = pwdhash(pwd, "abc");
    console.log(hash);

    //Assume correct
    let session_id = crypto.randomBytes(8).toString("hex");
    sessions[session_id] = [username, 9, true]
    return session_id;
}

function pwdhash(pwd, salt) {
    var hash = crypto.createHash("sha512")
        .update(pwd)
        .update(salt)
        .digest().toString("hex");
    return hash;
}

module.exports = {restrict, validate, pwdhash, sessionUser}