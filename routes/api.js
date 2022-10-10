var express = require('express');
var router = express.Router();
var {restrict} = require("../src/auth");
var crypto = require("crypto");
var {newUser} = require("../src/users");

router.post("/ping", (req, res, next) => {
    res.send("pong");
});

module.exports = router;
