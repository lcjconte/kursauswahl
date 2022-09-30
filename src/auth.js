//Authentification module

var db = require("../src/db_manage");
var crypto = require("crypto");

var sessions = {};

//Beschraenkt Zugriff auf eine Seite | level = "user" oder "admin"
/**
 * 
 * @param {String} level Entweder "user" oder "admin"
 */
function restrict(level) {
    return function(req, res, next) {
        if (!("secret" in req.cookies)) {res.redirect("/login");return;}
        var secret = req.cookies["secret"];
        if (secret.length != 16) {res.redirect("/login");return;}
        if (secret in sessions && (level !== "admin" || sessions[secret][2])) {
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
    sessions[session_id] = [username, 9, false]
    return session_id;
}

function pwdhash(pwd, salt) {
    var hash = crypto.createHash("sha512")
        .update(pwd)
        .update(salt)
        .digest().toString("hex");
    return hash;
}

module.exports = {restrict, validate, pwdhash}