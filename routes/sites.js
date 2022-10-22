var express = require('express');
var router = express.Router();
var {restrict, createSession, sessionUser, endSession} = require("../src/auth");
var db = require("../src/db_manage");
var {newUser} = require("../src/users");
var {flashCookie} = require("../src/helpers");

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

router.get('/make_selection', restrict("user"), (req, res, next) => {
    res.render('selection', { title: 'Kursauswahl: Auswahl'});
});

router.post("/make_selection", restrict("user", true), (req, res, next) => {
    res.send("Unimplemented");
    res.status(501);
});

router.get("/dashboard", restrict("user"), async function(req, res, next) { try {
    let user = sessionUser(req);
    res.render("dashboard", { title: "Dashboard" , show_admin: user.isadmin});
    } catch (error) {next(error)}
})

router.get("/admin", restrict("admin"), async (req, res, next) => {
    try {
    res.render("admin", { title: "Kursauswahl: Admin panel", groups: await db.get_groups(), 
                            csucc: "__regS" in req.cookies, cwrong: "__regF" in req.cookies});
    } catch (error) {next(error)}
});

router.get("/group/:gname", restrict("admin"), async (req, res, next) => {
    try {
    let users = (await db.users_by_group(req.params.gname)).map((val) => val["username"]);
    res.render('group', { title: 'Kursauswahl: User' , users});
    } catch (error) {next(error)}
});

router.post("/register_user", restrict("admin", true), async (req, res, next) => {
    try {
    let uname = req.body.name;
    let upwd = req.body.pwd;
    let isadmin = req.body.isadmin;
    let group = req.body.group;
    let success = await newUser(uname, upwd, isadmin, group);
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
