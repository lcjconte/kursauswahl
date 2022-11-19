let express = require("express")
let router = express.Router()
let { restrict, createSession, sessionUser, endSession } = require("../src/session")
let userdb = require("../src/userdb")
let selections = require("../src/subject_selection")
const { subjectsOrdered } = require("../src/subject_selection")
let { flashCookie } = require("../src/helpers")
let { table, rules } = require("../src/load_config")

router.get("/", (req, res, next) => {
    res.redirect("/login")
})

router.get("/login", (req, res, next) => {
    let user = sessionUser(req)
    if (user !== undefined) {
        res.redirect("/dashboard")
    } else {
        res.render("login", { title: "Kursauswahl: Login", cwrong: ("__lwrong" in req.cookies) })
    }
})

router.post("/login", async (req, res, next) => {
    try {
        let username = req.body.uname
        let pwd = req.body.pwd
        let sid = await createSession(username, pwd)
        if (sid === undefined) {
            // Return error page
            flashCookie(res, "lwrong", "")
            res.redirect("/login")
        } else {
            console.log("User %s logged in", username)
            res.cookie("secret", sid, { maxAge: 43200000, sameSite: "strict", httpOnly: "true", secure: true })
            res.redirect("/dashboard")
        }
    } catch (error) { next(error) }
})

router.get("/logout", restrict("user"), (req, res, next) => {
    endSession(req)
    res.clearCookie("secret")
    res.redirect("/login")
})

router.get("/ruleset", (req, res, next) => {
    res.send(rules)
})

router.get("/make_selection", restrict("user"), (req, res, next) => {
    res.render("selection", {
        title: "Kursauswahl: Auswahl",
        failure: "__selF" in req.cookies,
        success: "__selS" in req.cookies,
        table,
        rules
    })
})

router.post("/make_selection", restrict("user", true), async (req, res, next) => {
    try {
        let selObject = {}
        subjectsOrdered.forEach(el => {
            if (el in req.body && req.body[el] === "on") {
                selObject[el] = true
            }
        })
        let ans = await selections.setSelectionAlt(res.locals.user.uid, selObject)
        if (ans) {
            flashCookie(res, "selS", "")
        } else {
            flashCookie(res, "selF", "")
        }
        res.redirect("/make_selection")
    } catch (error) { next(error) }
})

router.get("/dashboard", restrict("user"), async function(req, res, next) {
    try {
        let user = sessionUser(req)
        res.render("dashboard", { title: "Dashboard", show_admin: user.isadmin })
    } catch (error) { next(error) }
})

router.get("/admin", restrict("admin"), async (req, res, next) => {
    try {
        res.render("admin", {
            title: "Kursauswahl: Admin panel",
            groups: await userdb.getGroups(),
            csucc: "__regS" in req.cookies,
            cwrong: "__regF" in req.cookies
        })
    } catch (error) { next(error) }
})

router.get("/group/:gname", restrict("admin"), async (req, res, next) => {
    try {
        let selectionMissing = (await userdb.usersMissingSelection(req.params.gname)).map(val => val.userid)
        let users = (await userdb.usersByGroup(req.params.gname)).map((val) => ({ name: val.username, submitted: !(selectionMissing.includes(val.userid)) }))
        res.render("group", { title: "Kursauswahl: User", users })
    } catch (error) { next(error) }
})

router.get("/group/:gname/download", restrict("admin"), async (req, res, next) => {
    try {
        let csv = await selections.selectionsAsCSV(req.params.gname)
        res.attachment("selections" + req.params.gname + ".csv")
        res.type("txt")
        res.send(csv)
    } catch (error) { next(error) }
})

router.post("/register_user", restrict("admin", true), async (req, res, next) => {
    try {
        let uname = req.body.name
        let upwd = req.body.pwd
        let isadmin = req.body.isadmin === "on"
        let group = req.body.group || "na"
        let success = await userdb.newUser(uname, upwd, isadmin, group)
        if (success) {
            flashCookie(res, "regS", "")
        } else {
            flashCookie(res, "regF", "")
        }
        res.redirect("/admin")
    } catch (error) { next(error) }
})

module.exports = router
