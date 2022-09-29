//Authentification module

var db = require("../src/db");
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
        if (secret.length != 8) {res.redirect("/login");return;}
        let authentified = true;
        if (authentified) {
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
 * @returns {boolean} Are credentials valid?
 */
function validate(username, pwd) {
    //Check if user exists
    db.query("SELECT")
    var hash = pwdhash(pwd, "abc");
    console.log(hash);
    return true;
    db.query("SELECT * FROM users WHERE username == ")
}

function pwdhash(pwd, salt) {
    var hash = crypto.createHash("sha512")
        .update(pwd)
        .update(salt)
        .digest().toString("hex");
    return hash;
}

module.exports = {restrict: restrict}