var godaddyPostUrl = "http://www.godaddy.com/domains/actions/dodomainbulksearch.aspx?source=%2fbulk-domain-search.aspx&isc=cjc695tnw";
var allTLDs = new Array('undefined','com','co','info','net','org','me','mobi','us','biz','ca','com.au','net.au','org.au','mx','ws','asia','bz','com.co','net.co','nom.co','eu','in','com.mx','nl','se','xxx','cz','la');
var allGoodTLDs = new Array('com','co','info','net','org','me','mobi','biz','ca','mx','ws','asia','bz','eu','in','nl','se','xxx','cz','la');
var topTLDs = new Array('com','co','info','net','org');
var dotComOnly = new Array('com');
var limit = 50;

// prfane????? titscent.us
var wordFusionQuery =	" SELECT CONCAT(rand1.word, rand2.word) as word" +
						" FROM " +
						"	( " +
						"		SELECT word, @ai1 := @ai1 + 1 as rowNum " +
						"		FROM ( SELECT word FROM monosyllabic ORDER BY RAND() ) r, (SELECT @ai1 := 0) selRow " +
						"		LIMIT " + limit + " " +
						"	) as rand1 " +
						" JOIN " +
						"	( " +
						"		SELECT word, @ai2 := @ai2 + 1 as rowNum " +
						"		FROM ( SELECT word FROM monosyllabic ORDER BY RAND() ) r, (SELECT @ai2 := 0) selRow " +
						"		LIMIT " + limit + " " +
						"	)	as rand2 " +
						" ON rand1.rowNum = rand2.rowNum ";

DomainSearcher = function(){};
require('./mysql_connect');
var cheerio = require('cheerio');
var request = require('request');


dbConn = new DbConn();



function sendGoDaddyRequest(names, tlds, callback){
	var tldString = tlds.join(",");
	var nameString = names.join(",");
	console.log(tldString);
	console.log(nameString);
	//clear cookies
	var j = request.jar();
	request.post(
		godaddyPostUrl,
		{
			form: {
				dotTypes: tldString,
				extrnl: 1,
				bulk: 1,
				domainNames: nameString
			},
			jar: j,
			followAllRedirects: true,
			timeout: 1000 * 360
		},
		function (error, response, body) {
			var domainList = Array();
			if (!error && response.statusCode == 200) {
				$daddy = cheerio.load(body);
				//  $('#dppBulkSearch input:checkbox')
				$daddy('.prevDomain').each(function(i, elem){
					var domain = $daddy(this).val();
					domainList.push(domain);
				});
				console.log("Daddy Came Back!");
				console.log(domainList);
				callback(domainList);
			}else
			{
				console.log("No Daddy Error!");
				console.log(error);
			}
		}
	);
}

function randomWords(callback){
	dbConn.query(wordFusionQuery, function(rows){
		callback(rows);
	} );
}

DomainSearcher.prototype.generateAndTestWords = function(callback){
	randomWords(function(results){
		var queryWords = Array();
		if(results==="undefined")
			callback({});
		for(var i=0; i<results.length;i++)
			queryWords.push(results[i].word);
		sendGoDaddyRequest(queryWords, dotComOnly, callback);
	});
};


DomainSearcher.prototype.testConnection = function(){
	dbConn.query("SELECT NOW()", function(rows){
		console.log(rows);
	} );
};

DomainSearcher.prototype.allWords = function(limit, callback){
	var sql = "SELECT * FROM monosyllabic LIMIT " + dbConn.mysql.escape(limit);
	console.log(sql);
	dbConn.query(sql, function(rows){
		callback(rows);
	} );
};



exports = DomainSearcher;
