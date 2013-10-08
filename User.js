User = function(){};
require('./mysql_connect');
dbConn = new DbConn();


User.prototype.findOrCreate = function(data, done){
	if(data.openId){
		var openId = dbConn.mysql.escape(data.openId);
		var findUserQuery = "SELECT * FROM  user WHERE openId = " + openId;
		dbConn.query(findUserQuery, function(rows){
			authOrCreate(rows, data.provider, openId, data.userInfo, done);
		} );
	}

};

User.prototype.findById = function(id, done){
	var userId = dbConn.mysql.escape(id);
	var findUserQuery = "SELECT * FROM  user WHERE id = " + userId;
	console.log(findUserQuery);
	dbConn.query(findUserQuery, function(rows){
		if(rows.length>0)
			done(null, rows[0]);
		else
			done("Couldn't find user", null);
	} );
};


function authOrCreate(rows, provider, openId, userInfo, done){
	if(rows.length < 1)
	{
		var user = new Object;
		user.providerName = dbConn.mysql.escape(provider);
		user.displayName = dbConn.mysql.escape(userInfo.displayName);
		user.familyName = dbConn.mysql.escape(userInfo.name.familyName);
		user.givenName = dbConn.mysql.escape(userInfo.name.givenName);
		user.middleName = dbConn.mysql.escape(userInfo.name.middleName);
		user.email = userInfo.emails.length < 1 ? dbConn.mysql.escape(emails[0].value) : "NULL";

		var insertUserQuery = "INSERT INTO user "+
		"VALUES(NULL, "+user.providerName+", "+openId+", NULL, NULL, NULL, "+user.displayName+","+user.familyName+", "+user.givenName+","+user.middleName+","+user.email+" )";
		console.log(insertUserQuery);
		dbConn.query(insertUserQuery, function(result){
			console.log("inserted...");
			var id = result.insertId;
			var error = null;
			done(error, userInfo);
		} );
	}else
	{
		console.log("the user is back...!");
		done(null, rows[0]);
	}
}



exports = User;
