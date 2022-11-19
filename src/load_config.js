// Read rulefiles
let fs = require("fs")
let tableJson = JSON.parse(fs.readFileSync("./public/table.json", "utf8"))
let subjectsJson = JSON.parse(fs.readFileSync("./public/subjects.json", "utf8"))
let rulesetJson = JSON.parse(fs.readFileSync("./public/ruleset.json", "utf8"))

tableJson.forEach(tableGroup => {
    tableGroup.rows.forEach(row => {
        if (row.name === undefined) {
            row.name = subjectsJson[row.id]
        }
    })
})
// Number rules
let cnt = 0
rulesetJson.forEach(rule => {
    if (rule.subs !== undefined) {
        rule._number = cnt
        cnt += 1
    }
})

module.exports = { table: tableJson, subject_names: subjectsJson, rules: rulesetJson }
