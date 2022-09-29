var db = require("../src/db");


    
async function register (rgsusername, rgsisadmin, rgspwd, rgssalt){

    db.query(`INSERT INTO userdata (username, isadmin, pwd, salt) VALUES ($1, $2, $3, $4);`, [rgsusername, rgsisadmin, rgspwd, rgssalt])
    
    .then((r) => {
    console.log(r.rows);
    })
}

async function update_pwd(userid, newpwd, newsalt){
    var result = await db.query(`UPDATE userdata SET pwd = $2, salt =$3 WHERE userid = $1`, [userid, newpwd, newsalt])
    if (result.rowCount === 0) {
        return false;
    }
    return true;
 };
async function update_isadmin(userid, isadmin){

};
async function delete_user(userid){

};
async function get_selection(userid){

};
async function set_selection(userid, /*Faecher*/ ){

};

module.exports = {update_pwd, update_isadmin, delete_user, get_selection, set_selection, register};