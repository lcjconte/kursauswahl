var db = require("./db");
var {subject_ordered} = require("./subject_selection");

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
async function get_selection(userid) {
    var result = (await db.query("SELECT * FROM selections WHERE userid = $1", [userid])).rows[0];
    return result;
}
async function set_selection_alt(userid, sel) {
    let f = s => sel[s]!==undefined;
    return set_selection(userid, 
        f("de"),f("it"),f("en"),f("fr"),f("la"),f("mu"),f("ku"),f("ge"),
        f("ek"),f("so"),f("ec"),f("re"),f("et"),f("fi"),f("st"),f("ma"),
        f("ph"),f("bi"),f("ch"),f("cs"),f("sp"));
}
async function set_selection(userid, de,it,en,fr,la,mu,ku,ge,ek,so,ec,re,et,fi,st,ma,ph,bi,ch,cs,sp) {
    var result = await db.query(
        "UPDATE selections SET de=$1, it=$2, en=$3, fr=$4, la=$5, mu=$6, ku=$7, ge=$8, \
        ek=$9, so=$10, ec=$11, re=$12, et=$13, fi=$14, st=$15, ma=$16, ph=$17, bi=$18, \
        ch=$19, cs=$20, sp=$21, submitted=true \
        WHERE userid=$22", 
        [de,it,en,fr,la,mu,ku,ge,ek,so,ec,re,et,fi,st,ma,ph,bi,ch,cs,sp, userid])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
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
async function selections_as_csv(group_name) {
    var a = await db.query("\
        SELECT (username, de, it, en, fr, la, mu, ku, ge, ek, so, ec, re, et, fi, st, ma, ph, bi, ch, in, sp) FROM selections \
        INNER JOIN userdata on userdata.userid = selections.userid \
        WHERE userdata.gruppe = $1 \
        ", [group_name])
    var csv_string = "Name,"
    subject_ordered.forEach(val => {
        csv_string += val+","
    })
    csv_string += "\n"
    a.rows.forEach(row => {
        var s = row.row;
        s.substring(1, s.length-1).split(",").forEach(val => {
            csv_string += val+","
        })
        csv_string += "\n"
    })
    return csv_string
}

module.exports = { register, update_pwd, update_isadmin, delete_user, get_selection, set_selection, set_selection_alt, user_by_name, user_by_userid, get_groups, users_by_group, selections_as_csv};