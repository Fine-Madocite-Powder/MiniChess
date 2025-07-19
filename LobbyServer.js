const http = require('http');
const path = require('path');
const express = require('express');
const port = 3000;

let app = express();
let server = http.createServer(app);

const {engine} = require('express-handlebars');
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use('/', (req, res) => {
    res.render("home");
    console.log('A new visitor :D');
})

app.post('/login', async (req, res) => {


})



server.listen(port, () => {
    console.log(`Server running on port ${port}`)
});