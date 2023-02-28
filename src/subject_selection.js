/* eslint-disable comma-spacing */
/* eslint-disable no-multi-str */
let db = require("./db")
let { subjectNames } = require("./load_config")
let dbCols = []
let usedSubjects = []
let updateString = "UPDATE selections SET "
let queryString = ""

// Check db compatibility
console.log("Checking db compatibility")
let setupCompleted = db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='selections'")
    .then(r => r.rows)
    .then(selectionCols => {
        let unusedCols = []
        selectionCols.forEach(v => {
            let name = v.column_name
            dbCols.push(name)
            if (name === "userid" || name === "submitted" || v.data_type !== "boolean") { return }
            if (subjectNames[name] === undefined) {
                unusedCols.push(name)
            }
        })
        if (unusedCols.length > 0) {
            console.log("These %sdb rows were not found in config files%s:", "\x1b[31m", "\x1b[0m", unusedCols)
        }
        let missingCols = []
        Object.keys(subjectNames).forEach(v => {
            if (dbCols.includes(v)) {
                usedSubjects.push(v)
            } else {
                missingCols.push(v)
            }
        })
        if (missingCols.length > 0) {
            console.log("These %sconfigued subjects were not found in db%s:", "\x1b[31m", "\x1b[0m", missingCols)
        }
        console.log("Finished checking db")
        usedSubjects.forEach((v, i) => {
            updateString += v + "=$" + (i + 1).toString() + ", "
            queryString += ", " + v
        })
        queryString += ")"
        updateString += "submitted=true WHERE userid=$" + (usedSubjects.length + 1).toString()
    })

async function getSelection(userid) {
    await setupCompleted
    let result = (await db.query("SELECT * FROM selections WHERE userid = $1", [userid])).rows[0]
    return result
}

async function setSelection(userid, sel) {
    await setupCompleted
    let params = []
    usedSubjects.forEach(v => {
        params.push(sel[v] !== undefined)
    })
    params.push(userid)
    let result = await db.query(updateString, params)
    if (result.rowCount === 0) {
        return false
    }
    return true
}
async function selectionsAsCSV(groupName) {
    await setupCompleted
    let a = await db.query("\
        SELECT (username, submitted" + queryString + " FROM selections \
        INNER JOIN userdata on userdata.userid = selections.userid \
        WHERE userdata.group_tag = $1 \
        ", [groupName])
    let csvString = "Name,"
    usedSubjects.forEach(val => {
        csvString += val + ","
    })
    csvString += "\n"
    a.rows.forEach(row => {
        let s = row.row
        let submitted = 3
        s.substring(1, s.length - 1).split(",").forEach(val => {
            if (submitted === 2) {
                submitted = val === "t"
                return
            }
            if (submitted === false) {
                val = "N/A"
            }
            if (val === "f") {
                val = 0
            } else if (val === "t") {
                val = 1
            }
            csvString += val + ","
            if (submitted === 3) {
                submitted = 2
            }
        })
        csvString += "\n"
    })
    return csvString
}
module.exports = { subjectsOrdered: usedSubjects, getSelection, setSelection, selectionsAsCSV }
