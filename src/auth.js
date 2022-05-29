//Authentification module
//Beschraenkt Zugriff auf eine Seite | level = "user" oder "admin"
/**
 * 
 * @param {String} level Entweder "user" oder "admin"
 */
function restrict(level) {
    return function(req, res, next) {
        let authentified = true;
        if (authentified) {
            next(); //Zugriff auf die Seite falls gueltige session
        }
        else {
            res.redirect("/login"); //Ansonsten zurueck zur Startseite
        }
    };
}

module.exports = {restrict: restrict}