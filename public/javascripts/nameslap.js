
function random(){
	ga(['_trackEvent', 'search', "wordFusion"]);

	$.post("/randomGen", function(data){
		var words = $.parseJSON(data);
		$("#resultNum").html(words.length);
		$('#results').html('');
		for(var i = 0; i < words.length; i++)
			$('<li></li>')
				.append(generateLink(words[i]))
				.hide()
				.appendTo($("#results"))
				.on('click',
					'a',
					function(){
						ga(['_trackEvent', 'referralClick', "goDaddy", "link", $(this).html() ]);
					}
				)
				.fadeIn();
	});
}

function generateLink(domainName){
	var q = "0380D5BAE9E8EB4D7FFA7CC15AD68F348CC398769D3C652BD68CD68878225BAB3FC3CA0154FE5407249EDBC853809098";
	var domainParts = domainName.split(".");
	var plainName = domainParts[0];
	var tld = domainParts[1];
	var url = "http://affiliate.godaddy.com/redirect/domainsearch?"+
				"DomainToCheck="+plainName +
				'&Tld=' + tld + "& Submit&q=" + q;
	return  $('<a></a>')
				.addClass('referralLink')
				.attr('href', url)
				.html(domainName.toLowerCase());
}
