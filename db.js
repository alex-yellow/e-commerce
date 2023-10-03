const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e-commerce'
});

db.connect(function (error) {
    if (error) {
        console.error('Error connection to database: ' + error.stack);
        return;
    }
    console.log('Connection to database success!');
});

module.exports = db;