var express = require('express');
var router = express.Router();
var selections = require("../src/subject_selection")
var subjects = require("../src/subject_selection");
var session = require("../src/session")
var {newUser} = require("../src/userdb");

router.post("/ping", (req, res, next) => {
    res.send("pong");
});

router.get("/selection", session.restrict("user"), async (req, res, next) => {
    try {
    var user = res.locals.user;
    var uid = parseInt(req.query.uid);
    if (!user.isadmin && user.uid != uid) {res.status(504);res.end();return;}
    var qres = (await selections.get_selection(uid));
    if (qres === undefined) {res.send("Not found");return;}
    let ans = {selected: []};
    subjects.subject_ordered.forEach(sub => {
        if (qres[sub.toLowerCase()]) {
            ans.selected.push(sub);
        }
    });
    res.send(ans);
    } catch (error) {next(error)} 
});

router.post("/new_user", async (req, res, next) => {
    try {
    var session_id = session.createSession(req.body.mname, req.body.mpwd)
    if (session_id === undefined) {
        res.send("Error")
        return
    }
    session.deleteSession(session_id);
    var worked = await newUser(req.body.name, req.body.pwd, false, req.body.group)
    res.send(worked)
    } catch (error) {res.send(false)}
})

module.exports = router;
