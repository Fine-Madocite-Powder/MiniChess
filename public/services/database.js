const mysql = require('mysql2/promise')

function connect () {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'delve 0.1'
    });
}

/// Get user data from DB ///

async function getPlayerByUsername (username) {
    let connection = await connect()
    try {
    const [rows] = await connection.execute('SELECT * FROM delve_users WHERE username = ?', [username]);
    return rows[0];
    } finally {
        await connection.end();
    }
}

/// Alter, create, or delete users ///

async function createUser(username, passwordHash) {
    let connection = await connect();

    try {
    const newUser = await connection.execute('INSERT INTO delve_users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
    return newUser[0];
    } finally {
        await connection.end();
    }
}

async function failLogin (username) {
    let connection = await connect()

    const player = await getPlayerByUsername(username);
    const failedLogins = player.failed_logins + 1;
    try {
    const [updatedUser] = await connection.execute('UPDATE delve_users SET failed_logins = ? WHERE username = ?', [failedLogins, username]);
    return rows[0];
    } finally {
        await connection.end();
    }
}

async function unfailLogin (username) {
    let connection = await connect()
    
    try {
    const [updatedUser] = await connection.execute('UPDATE delve_users SET failed_logins = 0 WHERE username = ?', [username]);
    return rows[0];
        } finally {
        await connection.end();
    }
}

async function suspendUser (reason, username) {
    let connection = await connect()

    try {
    const [updatedUser] = await connection.execute('UPDATE delve_users SET suspension = ? WHERE username = ?', [reason, username]);
    return rows[0];    
    } finally {
        await connection.end();
    }
}


module.exports = {
    getPlayerByUsername,
    failLogin,
    unfailLogin,
    suspendUser,
    createUser
}