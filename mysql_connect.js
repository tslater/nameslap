var mysql = require('mysql');


var connectionPool  = mysql.createPool({
  host     : 'localhost',
  socketPath   : '/Applications/MAMP/tmp/mysql/mysql.sock',
  user     : 'root',
  password : 'root',
  database : 'personal',
  // debug	   :  true
});

var connectionPool  = mysql.createPool({
  host     : 'nameslap-live.cb16rnvxpnve.us-west-2.rds.amazonaws.com',
  user     : 'nameslap',
  password : 'notinstagram1',
  database : 'nameslap',
  // debug	   :  true
});



DbConn = function(){};

DbConn.prototype.mysql = mysql;

DbConn.prototype.query = function(query, callback){
	connectionPool.getConnection(function(err, connection) {
		connection.query( query, function(err, rows) {
			callback(rows);
			connection.end();
		});
	});
};

exports = DbConn;
