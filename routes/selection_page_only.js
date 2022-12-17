let express = require("express")
let router = express.Router()
let { table, rules } = require("../src/load_config")

router.get("/ruleset", (req, res, next) => {
    res.send(rules)
})

router.get("/", (req, res, next) => {
    res.render("selection", {
        title: "Kursauswahl: Auswahl",
        failure: false,
        success: false,
        table,
        rules,
        buttons_disabled: true
    })
})

module.exports = router
