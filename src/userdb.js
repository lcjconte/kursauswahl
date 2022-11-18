//User managment related functions
var db = require("./db");
var {pwdhash} = require("./auth");
var crypto = require("crypto");

async function register(username, isadmin, pwdhash, salt, group) {
    const client = await db.connect()
    try {
        await client.query("BEGIN")
        var user_inserted = await client.query("INSERT INTO userdata (username, isadmin, pwdhash, salt, group_tag) VALUES ($1, $2, $3, $4, $5) RETURNING userid", [username, isadmin, pwdhash, salt, group])
        if (user_inserted.rows[0] === undefined) {throw new Error("Failed to insert user")}
        await client.query("INSERT INTO selections (userid) VALUES ($1)", [user_inserted.rows[0]["userid"]])
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
    var salt = crypto.randomBytes(45).toString("base64");
    var pwd_hash = pwdhash(pwd, salt).toString("base64");
    return await register(name, isadmin, pwd_hash, salt, group);
}

async function update_pwd(userid, newpwd, newsalt) {
    var result = await db.query("UPDATE userdata SET pwdhash = $2, salt = $3 WHERE userid = $1", [userid, newpwd, newsalt])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function update_isadmin(userid, isadmin) {
    var result = await db.query("UPDATE userdata SET isadmin = $1 WHERE userid = $2", [isadmin, userid])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function delete_user(userid) {
    var result = await db.query("DELETE FROM userdata WHERE userid = $1", [userid])
    return result.rowCount !== 0

}
async function user_by_name(username) {
    var result = await db.query("SELECT * FROM userdata WHERE username LIKE $1;", [username])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}
async function user_by_userid(userid) {
    var result = await db.query("SELECT * FROM userdata WHERE userid = $1", [userid])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}
async function get_groups() {
    var result = await db.query("SELECT DISTINCT (group_tag) FROM userdata")
    groups = result.rows.map(el => el["group_tag"])
    groups.sort()
    return groups
}
async function users_by_group(group_name) {
    var result = await db.query("SELECT * FROM userdata WHERE group_tag = $1", [group_name])
    return result.rows;
}
async function users_missing_selection(group_name) {
    var result = await db.query(
        "SELECT (userdata.userid) FROM userdata INNER JOIN selections on userdata.userid = selections.userid WHERE selections.submitted=false AND userdata.group_tag=$1"
        , [group_name])
    return result.rows
}

module.exports = { register, newUser, update_pwd, update_isadmin, delete_user, user_by_name, user_by_userid, get_groups, users_by_group, users_missing_selection};