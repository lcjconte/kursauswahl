var express = require('express');
var router = express.Router();

//Hier API Routen einfügen!
// /user GET, PUT

// /selection GET, POST

//Testing

router.post("/sayhello", (req, res, next) => {
    console.log(req.body);
    res.cookie("Var1", "foo");
    res.send("Hello "+req.body["name"]);
})

router.get("/test_db", (req, res, next) => {
    db.query("SELECT * FROM hello;")
        .then((r) => {
            console.log(r.rows);
            res.send(r.rows[1]);
        })
        .catch((r) => console.log(r))
});

router.post("/test_hash", restrict("admin"), (req, res, next) => {
    res.send("OK");
});

router.get("/test_restricted", restrict("admin"), (req, res, next) => {
    res.send("OK");
});

module.exports = router;
