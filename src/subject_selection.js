/* eslint-disable comma-spacing */
/* eslint-disable no-multi-str */
let db = require("./db")
let subjectsOrdered = ["de","it","en","fr","la","mu","ku","ge","ek","so","ec","re","et","fi","st","ma","ph","bi","ch","cs","sp"]

async function getSelection(userid) {
    let result = (await db.query("SELECT * FROM selections WHERE userid = $1", [userid])).rows[0]
    return result
}
async function setSelectionAlt(userid, sel) {
    let f = s => sel[s] !== undefined
    return setSelection(userid,
        f("de"),f("it"),f("en"),f("fr"),f("la"),f("mu"),f("ku"),f("ge"),
        f("ek"),f("so"),f("ec"),f("re"),f("et"),f("fi"),f("st"),f("ma"),
        f("ph"),f("bi"),f("ch"),f("cs"),f("sp"))
}
async function setSelection(userid, de,it,en,fr,la,mu,ku,ge,ek,so,ec,re,et,fi,st,ma,ph,bi,ch,cs,sp) {
    let result = await db.query(
        "UPDATE selections SET de=$1, it=$2, en=$3, fr=$4, la=$5, mu=$6, ku=$7, ge=$8, \
        ek=$9, so=$10, ec=$11, re=$12, et=$13, fi=$14, st=$15, ma=$16, ph=$17, bi=$18, \
        ch=$19, cs=$20, sp=$21, submitted=true \
        WHERE userid=$22",
        [de,it,en,fr,la,mu,ku,ge,ek,so,ec,re,et,fi,st,ma,ph,bi,ch,cs,sp, userid])
    if (result.rowCount === 0) {
        return false
    }
    return true
}
async function selectionsAsCSV(groupName) {
    let a = await db.query("\
        SELECT (username, submitted, de, it, en, fr, la, mu, ku, ge, ek, so, ec, re, et, fi, st, ma, ph, bi, ch, cs, sp) FROM selections \
        INNER JOIN userdata on userdata.userid = selections.userid \
        WHERE userdata.group_tag = $1 \
        ", [groupName])
    let csvString = "Name,"
    subjectsOrdered.forEach(val => {
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
            csvString += val + ","
            if (submitted === 3) {
                submitted = 2
            }
        })
        csvString += "\n"
    })
    return csvString
}
module.exports = { subjectsOrdered, getSelection, setSelection, setSelectionAlt, selectionsAsCSV }
