const mysql = require('mysql2/promise')

function connect () {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'delve 0.1'
    });
}

async function getPlayerByUsername (username) {
    let connection = await connect()

    const [rows] = await connection.execute('SELECT * FROM delve_users WHERE username = ?', [username]);
    return rows[0];
}

async function failLogin (username) {
    let connection = await connect()

    const player = await getPlayerByUsername(username);
    const failedLogins = player.failed_logins + 1;
    
    const [updatedUser] = await connection.execute('UPDATE delve_users SET failed_logins = ? WHERE username = ?', [failedLogins, username])
    return rows[0];
}

async function unfailLogin (username) {
    let connection = await connect()
    
    const [updatedUser] = await connection.execute('UPDATE delve_users SET failed_logins = 0 WHERE username = ?', [username])
    return rows[0];
}

async function suspendUser (reason, username) {
    let connection = await connect()

    const [updatedUser] = await connection.execute('UPDATE delve_users SET suspension = ? WHERE username = ?', [reason, username])
    return rows[0]
}

module.exports = {
    getPlayerByUsername,
    failLogin,
    unfailLogin,
    suspendUser
}