var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'administrator',
  database : 'choco_duo'
});

module.exports = connection;
