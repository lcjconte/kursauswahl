let express = require("express")
let router = express.Router()
let selections = require("../src/subject_selection")
let subjects = require("../src/subject_selection")
let session = require("../src/session")
let { newUser } = require("../src/userdb")

router.post("/ping", (req, res, next) => {
    res.send("pong")
})

router.get("/selection", session.restrict("user"), async (req, res, next) => {
    try {
        let user = res.locals.user
        let uid = parseInt(req.query.uid)
        if (!user.isadmin && user.uid !== uid) { res.status(504); res.end(); return }
        let qres = (await selections.getSelection(uid))
        if (qres === undefined) { res.send("Not found"); return }
        let ans = { selected: [] }
        subjects.subjectsOrdered.forEach(sub => {
            if (qres[sub.toLowerCase()]) {
                ans.selected.push(sub)
            }
        })
        res.send(ans)
    } catch (error) { next(error) }
})

router.post("/new_user", async (req, res, next) => {
    try {
        let sessionId = session.createSession(req.body.mname, req.body.mpwd)
        if (sessionId === undefined) {
            res.send("Error")
            return
        }
        session.deleteSession(sessionId)
        let worked = await newUser(req.body.name, req.body.pwd, false, req.body.group)
        res.send(worked)
    } catch (error) { res.send(false) }
})

module.exports = router
