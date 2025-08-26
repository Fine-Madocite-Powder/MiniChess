const http = require('http');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = "Voluminous8008A5";

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const publicPath = path.join(__dirname, '/public')
const db = require(path.join(publicPath, '/services/database.js'));
const port = 3000;
const protectedRoutes = ["/game", "/moderator", "/lobby"]

// Basic requirements and vars

// Setting up the server and express settings
let app = express();
let server = http.createServer(app);
app.use(express.static(publicPath)); // Serves static files from ./public. These are files like CSS styles.
app.use(cookieParser());
app.use(bodyParser.urlencoded()); // Allows use of req.body
app.use(bodyParser.json());

// Using Express Handlebars to serve files
const {engine} = require('express-handlebars'); // Get handlebars
app.engine("handlebars", engine()); // Make express use handlebars
app.set("view engine", "handlebars"); 
app.set("views", "./views"); // Use the "public/views" folder to find layouts etc.


/// RESOURCES ^ ///

/// BROAD FUNCTIONS ///

function verifyJWT (token) {
    let response;

    jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
            response = [false, err]
        } else {
            response = [true, decoded]
        }
    })
    return response;
}

/// Redirect user to /game if they are logged in and have an unfinished game ///
app.use(async function verifyUser (req, res, next) {
    const cookie = req.cookies.jwtSession;

    const targetProtection = protectedRoutes.includes(req.url);
    console.log("");
    console.log("Used Server.");

    if (cookie) {
        const verification = verifyJWT(cookie);
        console.log("User has cookie.")

        if (verification[0]) {
            let token = verification[1];
            const user = await db.getPlayerByUsername(token.username);
            console.log("Verification confirmed.")

            if (user.openGame) {
                console.log("Verified user has unfinished game.")

                if (req.url !== "/game") {
                    res.redirect("../game");
                    console.log("Redirected user to game.")
                } else {
                    console.log("User reentered game.")
                    next();
                }
            } else {
                next();
                console.log("Verified user accessed route:", req.url)
            }

        }

    } else if (targetProtection) {
        res.redirect("/")
        console.log("User without login attempted at protected route.")
    } else {
        console.log("User had no login, but route is not protected.")
        next();
    }
})

app.get('/', (req, res) => {
    res.render("loginPage");
})

/// Login from index page ///
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const playerWithUsername = await db.getPlayerByUsername(username);

    if (playerWithUsername === undefined) { // Non-existent user
        res.render("loginPage", {loginerror: "There is no user with that username."});

    } else if (playerWithUsername.suspension !== null) { // Handles suspended users
        res.render("loginPage", {loginerror: "That account has been suspended: " + playerWithUsername.suspension});


    } else if (await bcrypt.compare(password, playerWithUsername.password_hash)) { // Successful login
        db.unfailLogin(username);

        const token = jwt.sign({
            username: username
        }, jwtKey, {})

        res.cookie("jwtSession", token, {httpOnly:true});

        res.redirect("/lobby");

    } else { // Handles users inputing the wrong password. 5 incorrect logins suspends the account.
        db.failLogin(username);

        if (playerWithUsername.failed_logins > 3) {
            db.suspendUser("Failed to enter password 5 times.", username)
        }
        res.render("loginPage", {loginerror: "The password you used is incorrect."})
    }
})

/// Create an account for user ///
app.post('/createAccount', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;



    if(await db.getPlayerByUsername(username) === undefined) {

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await db.createUser(username, hash)

        console.log("Created user:");
        console.log(username, password);

        res.redirect("/lobby");
    } else {
        res.render("loginPage", {signupError: "There's already a user with that username."});
    }
})

app.get("/lobby", (req, res) => {
    res.render("lobby");
})

app.get("/game", async (req, res) => {
    res.send("jdjdjdjdjd")
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})