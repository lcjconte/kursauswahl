var express = require('express');
var router = express.Router();
var {restrict, createSession, sessionUser, endSession} = require("../src/session");
var userdb = require("../src/userdb")
var selections = require("../src/subject_selection")
const { subject_ordered } = require('../src/subject_selection');
var {flashCookie} = require("../src/helpers");
var {table, rules} = require("../src/load_config");

router.get("/", (req, res, next) => {
    res.redirect("/login");
})

router.get('/login', (req, res, next) => {
    let user = sessionUser(req);
    if (user !== undefined) {
        res.redirect("/dashboard");
    }
    else {
        res.render('login', { title: 'Kursauswahl: Login', cwrong: ("__lwrong" in req.cookies)});
    }
});

router.post("/login", async (req, res, next) => { try {
    var username = req.body.uname;
    var pwd = req.body.pwd;
    var sid = await createSession(username, pwd);
    if (sid == undefined) {
        // Return error page
        flashCookie(res, "lwrong", "");
        res.redirect("/login");
    }
    else {
        console.log("User %s logged in", username);
        res.cookie("secret", sid, {maxAge: 43200000, sameSite: "strict", httpOnly: "true", secure: true});
        res.redirect("/dashboard");
    }
    } catch (error) {next(error)}
});

router.get("/logout", restrict("user"), (req, res, next) => {
    endSession(req);
    res.clearCookie("secret");
    res.redirect("/login");
});

router.get("/ruleset", (req, res, next) => {
    res.send(rules)
})

router.get('/make_selection', restrict("user"), (req, res, next) => {
    res.render('selection', { 
        title: 'Kursauswahl: Auswahl', failure: "__selF" in req.cookies, success: "__selS" in req.cookies,
        table: table, rules: rules
    })
});

router.post("/make_selection", restrict("user", true), async (req, res, next) => {
    try {
    var sel_object = {};
    subject_ordered.forEach(el => {
        if (el in req.body && req.body[el] == "on") {
            sel_object[el] = true;
        }
    })
    var ans = await selections.set_selection_alt(res.locals.user.uid, sel_object)
    if (ans) {
        flashCookie(res, "selS", "")
    }
    else {
        flashCookie(res, "selF", "")
    }
    res.redirect("/make_selection")
    } catch (error) {next(error)}
});

router.get("/dashboard", restrict("user"), async function(req, res, next) { try {
    let user = sessionUser(req);
    res.render("dashboard", { title: "Dashboard" , show_admin: user.isadmin});
    } catch (error) {next(error)}
})

router.get("/admin", restrict("admin"), async (req, res, next) => {
    try {
    res.render("admin", { title: "Kursauswahl: Admin panel", groups: await userdb.get_groups(), 
                            csucc: "__regS" in req.cookies, cwrong: "__regF" in req.cookies});
    } catch (error) {next(error)}
});

router.get("/group/:gname", restrict("admin"), async (req, res, next) => {
    try {
    let selection_missing = (await userdb.users_missing_selection(req.params.gname)).map(val => val["userid"]);
    let users = (await userdb.users_by_group(req.params.gname)).map((val) => ({name: val["username"], submitted: !(selection_missing.includes(val["userid"]))}));
    res.render('group', { title: 'Kursauswahl: User' , users});
    } catch (error) {next(error)}
});

router.get("/group/:gname/download", restrict("admin"), async (req, res, next) => {
    try {
        var csv = await selections.selections_as_csv(req.params.gname)
        res.attachment("selections"+req.params.gname+".csv")
        res.type("txt")
        res.send(csv)
    } catch (error) {next(error)}
})

router.post("/register_user", restrict("admin", true), async (req, res, next) => {
    try {
    let uname = req.body.name;
    let upwd = req.body.pwd;
    let isadmin = req.body.isadmin === "on";
    let group = req.body.group || "na";
    let success = await userdb.newUser(uname, upwd, isadmin, group);
    if (success) {
        flashCookie(res, "regS", "")
    }
    else {
        flashCookie(res, "regF", "")
        
    }
    res.redirect("/admin")
    } catch (error) {next(error)}
});

module.exports = router;
