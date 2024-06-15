var mysql = require('mysql2');

var conn = {};

conn = {
    host : process.env.DATABASE_HOST,
    port : process.env.DATABASE_PORT,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASS,
    database : process.env.DATABASE_NAME,
    multipleStatements : true,
    dateStrings : 'date'
}

var database = mysql.createPool(conn);

module.exports = database;