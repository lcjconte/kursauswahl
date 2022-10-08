var express = require('express');
var router = express.Router();
var {restrict} = require("../src/auth");

//Hier API Routen einfügen!
// /user GET, PUT

// /selection GET, POST

//Testing

router.post("/ping", (req, res, next) => {
    res.send("pong");
});

router.get("/test_restricted", restrict("admin"), (req, res, next) => {
    res.send("OK");
});

module.exports = router;
