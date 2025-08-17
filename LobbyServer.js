const http = require('http');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const publicPath = path.join(__dirname, './public')
const db = require(path.join(publicPath, '/services/database.js'));
const port = 3000;

// Basic requirements and vars

// Setting up the server and essential settings
let app = express();
let server = http.createServer(app);
app.use(express.static(publicPath)); // Serves static files from ./public. These are files like CSS styles.
app.use(express.urlencoded({extended: true})); // Allows use of req.body

// Using Express Handlebars to serve files
const {engine} = require('express-handlebars'); // Get handlebars
app.engine("handlebars", engine()); // Make express use handlebars
app.set("view engine", "handlebars"); 
app.set("views", "./views"); // Use the "views" folder to find layouts etc.


/// RESOURCES ^ ///

app.get('/', (req, res) => {
    res.render("loginPage");
})

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const playerWithUsername = await db.getPlayerByUsername(username);
    console.log(playerWithUsername.password_hash);

    if (playerWithUsername === undefined) { // Non-existent user
        res.render("loginPage", {loginerror: "There is no user with that username."});

    } else if (playerWithUsername.suspension !== null) { // Handles suspended users
        res.render("loginPage", {loginerror: "That account has been suspended: " + playerWithUsername.suspension});


    } else if (await bcrypt.compare(password, playerWithUsername.password_hash)) { // Successful login
        db.unfailLogin(username);
        res.render("lobby");


    } else { // Handles users inputing the wrong password. 5 incorrect logins suspends the account.
        db.failLogin(username);

        if (playerWithUsername.failed_logins > 3) {
            db.suspendUser("Failed to enter password 5 times.", username)
        }
        res.render("loginPage", {loginError: "That account has been suspended to protect it from malicious actors."})
    }
})


/// Create an account for user ///
app.post('/createAccount', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    console.log("Created user:");
    console.log(username, password);

    if(await db.getPlayerByUsername(username) === undefined) {

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await db.createUser(username, hash)

        res.render("lobby");
    } else {
        res.render("loginPage", {signupError: "There's already a user with that username."})
    }
})



server.listen(port, () => {
    console.log(`Server running on port ${port}`)
});