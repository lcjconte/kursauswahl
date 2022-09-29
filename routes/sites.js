var express = require('express');
var router = express.Router();
var {restrict} = require("../src/auth")

router.get("/", (req, res, next) => {
    res.redirect("/login");
})

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Kursauswahl' });
});

router.post("/login", (req, res, next) => {
    var username = req.body.uname;
    var pwd = req.body.pwd;
    console.log(username, " logging in with ", pwd);
    res.redirect("/make_selection");
    //res.cookie
});

router.get('/make_selection', restrict("user"), function(req, res, next) {
    res.render('selection', { title: 'Kursauswahl' });
});

router.get('/students', restrict("admin"), function(req, res, next) {
    res.render('students', { title: 'Kursauswahl' });
});

module.exports = router;
