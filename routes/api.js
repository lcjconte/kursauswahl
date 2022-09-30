var express = require('express');
var router = express.Router();
var {restrict} = require("../src/auth");

//Hier API Routen einfügen!
// /user GET, PUT

// /selection GET, POST

//Testing

router.post("/sayhello", (req, res, next) => {
    console.log(req.body);
    res.cookie("Var1", "foo");
    res.send("Hello "+req.body["name"]);
});

router.get("/test_restricted", restrict("admin"), (req, res, next) => {
    res.send("OK");
});

module.exports = router;
