const { Router } = require("express");
var db = require("../src/db");


async function register(rgsusername, rgsisadmin, rgspwd, rgssalt) {
    var result = await db.query(`INSERT INTO userdata (username, isadmin, pwd, salt) VALUES ($1, $2, $3, $4);`, [rgsusername, rgsisadmin, rgspwd, rgssalt])
    if (result.rowCount === 0) {
        return false;
    }
    else return true;
}
async function update_pwd(userid, newpwd, newsalt) {
    var result = await db.query(`UPDATE userdata SET pwd = $2, salt =$3 WHERE userid = $1`, [userid, newpwd, newsalt])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}

async function update_isadmin(userid, isadmin) {
    var result = await db.query(`UPDATE userdata SET isadmin = $1 WHERE userid = $2`, [isadmin, userid])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function delete_user(userid) {
    var result = await db.query(`DELETE FROM userdata WHERE userid = $1`, [userid])
    if (result.rowCount === 0) {
        return false;
    }
}
async function get_selection(userid) {
    var result = await db.query(`SELECT * FROM selections WHERE userid = $1`, [userid])
    return result;
}
async function set_selection(userid, de, ita, en, fr, lat, mu, ku, ges, eco, git, biphi, etk, rel, geo, bio, phy, ma, ch, inf, sport, soz) {
    var result = await db.query(`insert into selections values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`, [userid, de, ita, en, fr, lat, mu, ku, ges, eco, git, biphi, etk, rel, geo, bio, phy, ma, ch, inf, sport, soz])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
}
async function user_by_name(username) {
    var result = await db.query(`SELECT * FROM userdata WHERE username LIKE $1;`, [username])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}
async function user_by_userid(userid) {
    var result = await db.query(`SELECT * FROM userdata WHERE userid = $1`, [userid])
    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}
module.exports = { register, update_pwd, update_isadmin, delete_user, get_selection, set_selection, register, user_by_name, user_by_userid };