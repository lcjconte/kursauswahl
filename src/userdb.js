// User managment related functions
let db = require("./db")
let { pwdhash } = require("./auth")
let crypto = require("crypto")

async function register(username, isadmin, pwdhash, salt, group) {
    const client = await db.connect()
    try {
        await client.query("BEGIN")
        let userInserted = await client.query(
            "INSERT INTO userdata (username, isadmin, pwdhash, salt, group_tag) VALUES ($1, $2, $3, $4, $5) RETURNING userid",
            [username, isadmin, pwdhash, salt, group]
        )
        if (userInserted.rows[0] === undefined) { throw new Error("Failed to insert user") }
        await client.query("INSERT INTO selections (userid) VALUES ($1)", [userInserted.rows[0].userid])
        await client.query("COMMIT")
    } catch (e) {
        await client.query("ROLLBACK")
        throw e
    } finally {
        client.release()
    }
    return true
}
async function newUser(name, pwd, isadmin, group) {
    let salt = crypto.randomBytes(45).toString("base64")
    let pwdHash = pwdhash(pwd, salt).toString("base64")
    return await register(name, isadmin, pwdHash, salt, group)
}

async function updatePwd(userid, newpwd, newsalt) {
    let result = await db.query("UPDATE userdata SET pwdhash = $2, salt = $3 WHERE userid = $1", [userid, newpwd, newsalt])
    if (result.rowCount === 0) {
        return false
    }
    return true
}
async function updateIsadmin(userid, isadmin) {
    let result = await db.query("UPDATE userdata SET isadmin = $1 WHERE userid = $2", [isadmin, userid])
    if (result.rowCount === 0) {
        return false
    }
    return true
}
async function deleteUser(userid) {
    let result = await db.query("DELETE FROM userdata WHERE userid = $1", [userid])
    return result.rowCount !== 0
}
async function userByName(username) {
    let result = await db.query("SELECT * FROM userdata WHERE username LIKE $1;", [username])
    if (result.rowCount === 0) {
        return undefined
    }
    return result.rows[0]
}
async function userByUserid(userid) {
    let result = await db.query("SELECT * FROM userdata WHERE userid = $1", [userid])
    if (result.rowCount === 0) {
        return undefined
    }
    return result.rows[0]
}
async function getGroups() {
    let result = await db.query("SELECT DISTINCT (group_tag) FROM userdata")
    let groups = result.rows.map(el => el.group_tag)
    groups.sort()
    return groups
}
async function usersByGroup(groupName) {
    let result = await db.query("SELECT * FROM userdata WHERE group_tag = $1", [groupName])
    return result.rows
}
async function usersMissingSelection(groupName) {
    let result = await db.query(
        "SELECT (userdata.userid) FROM userdata INNER JOIN selections on userdata.userid = selections.userid WHERE selections.submitted=false AND userdata.group_tag=$1"
        , [groupName])
    return result.rows
}

module.exports = { register, newUser, updatePwd, updateIsadmin, deleteUser, userByName, userByUserid, getGroups, usersByGroup, usersMissingSelection }
