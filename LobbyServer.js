const http = require('http');
const path = require('path');
const express = require('express');
const port = 3000;

let app = express();
let server = http.createServer(app);



app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/home.html'));

    console.log('A new visitor :D');
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
});