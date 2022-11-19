/**
 * Add one time cookie
 */
module.exports.flashCookie = function clearFlash(res, name, val) {
    res.cookie("__" + name, val, { sameSite: "strict" })
}
