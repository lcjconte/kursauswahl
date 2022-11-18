//Read rulefiles
var fs = require('fs')
var table_json = JSON.parse(fs.readFileSync("./public/table.json", "utf8"))
var subjects_json = JSON.parse(fs.readFileSync("./public/subjects.json", "utf8"))
var ruleset_json = JSON.parse(fs.readFileSync("./public/ruleset.json", "utf8"))

table_json.forEach(table_group => {
    table_group.rows.forEach(row => {
        if (row["name"] === undefined) {
            row["name"] = subjects_json[row["id"]]
        }
    })
})
//Number rules
let cnt = 0
ruleset_json.forEach(rule => {
    if (rule["subs"] !== undefined) {
        rule._number = cnt
        cnt += 1
    }
})

module.exports = {table: table_json, subject_names: subjects_json, rules: ruleset_json}