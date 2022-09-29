var db = require("../src/db");

router.get("/register", (req, res, next) => { 
    
    async function register (rgsusername, rgsisadmin, rgspwd, rgssalt){

        db.query(`INSERT INTO userdata (username, isadmin, pwd, salt) VALUES ($1, $2, $3, $4);`, [rgsusername, rgsisadmin, rgspwd, rgssalt])
        
        .then((r) => {
        console.log(r.rows);
        })
    }
    register('lcj', 'true','idk stuff i guess','if you are reading this, register works');
 }); 

async function update_pwd(userid, newpwd, newsalt){
    var pwdcheck = db.query()
    db.query(`UPDATE userdaten SET pwd = $2, salt =$3 WHERE userid = $1`, [userid, newpwd, newsalt])
 };
async function update_isadmin(userid, isadmin){

};
async function delete_user(userid){

};
async function get_selection(userid){

};
async function set_selection(userid, /*Faecher*/ ){

};