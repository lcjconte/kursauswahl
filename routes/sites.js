var express = require('express');
var router = express.Router();
var {restrict} = require("../src/auth")

router.get("/", (req, res, next) => {
    res.redirect("/login");
})

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Kursauswahl' });
});

//POST für /login fehlt

router.get('/make_selection', restrict("user"), function(req, res, next) {
  res.render('selection', { title: 'Kursauswahl' });
});

router.get('/students', restrict("admin"), function(req, res, next) {
    res.render('students', { title: 'Kursauswahl' });
  });

module.exports = router;
