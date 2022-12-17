require("dotenv").config()
let createError = require("http-errors")
let express = require("express")
let path = require("path")
let cookieParser = require("cookie-parser")
let logger = require("morgan")
let RateLimit = require("express-rate-limit")

let siteRouter = require("./routes/sites")
let apiRouter = require("./routes/api")
let altSiteRouter = require("./routes/selection_page_only")

let app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "hbs")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

let limiter = RateLimit({
    windowMs: 4 * 1000, // 4 seconds
    max: 8
})
app.use(limiter)
// Flash middleware
app.use((req, res, next) => {
    for (const cookie in req.cookies) {
        if (cookie.startsWith("__")) {
            res.clearCookie(cookie, { sameSite: "strict" })
        }
    }
    next()
})
console.log(process.env.SELECTION_PAGE_ONLY)
if (process.env.SELECTION_PAGE_ONLY === "") {
    app.use("/", siteRouter)
    app.use("/api", apiRouter)
} else {
    app.use("/", altSiteRouter)
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = req.app.get("env") === "development" ? err.message : "An internal error occured 😕"
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render("error")
})

module.exports = app
