
$(document).ready(function(){
	loadingDiv = $("#loading");
  $( ".draggable" ).draggable(dragOpts);
  $("#favDrop").droppable(
  {
    drop:  function(event, ui) {
           $(this).append($(ui.draggable));
           return true;
      }
  });
  $( "#favDrop" ).sortable({
      revert: true
    });
    $( ".draggable" ).draggable(dragOpts);

});

var dragOpts = {
    connectToSortable: "#favDrop",
    cursorAt: {top:0, left:0},
	start: function(){
		$("#favs").addClass('slideFromLeft');
	},
  drag: function(){
    $(this).css('position','relative');
  },
	stop : function(){
		$("#favs").removeClass('slideFromLeft');
	},
	revert: function(event, ui) {
            // on older version of jQuery use "draggable"
            // $(this).data("draggable")
            $(this).data("uiDraggable").originalPosition = {
                top : 0,
                left : 0
            };
            // return boolean
            return !event;
            // that evaluate like this:
            // return event !== false ? false : true;
   }
};

function random(){
	_gaq.push(['_trackEvent', 'search', "wordFusion"]);

	$("#resultsSummary").hide();
	loadingDiv.fadeIn('fast');

	$.post("/randomGen", { suggestion: $('#suggestion').val() }, function(data){

		loadingDiv.hide();
		$("#resultsSummary").fadeIn();

		var words = $.parseJSON(data);
		$("#resultNum").html(words.length);
		$('#results').html('');
		for(var i = 0; i < words.length; i++)
			$('<li></li>')
				.addClass('draggable')
				.append(generateLink(words[i]))
				.appendTo($("#results"))
				.on('click','a',
					function(){
						_gaq.push(['_trackEvent', 'referralClick', "goDaddy", $(this).html() ]);
					}
				);
		$( ".draggable" ).draggable(dragOpts);


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


function handleDrop(event,ui) {

  var targetDIV = document.getElementById('targetDIV');
  var dropTarget = $(this);

  //making sure the draggable div doesn't move on its own until we're finished moving it
  ui.draggable.draggable( "option", "revert", false );

  //getting current div old absolute position
  var oldPosition = ui.draggable.offset();

  //assigning div to new parent
  ui.draggable.insertBefore(dropTarget);

  //getting current div new absolute position
  var newPosition = ui.draggable.offset();

  //calculate correct position offset
  var leftOffset = null;
  var topOffset = null;

  if(oldPosition.left > newPosition.left) {
    leftOffset = (oldPosition.left - newPosition.left);
  } else {
    leftOffset = -(newPosition.left - oldPosition.left);
  }

  if(oldPosition.top > newPosition.top) {
    topOffset = (oldPosition.top - newPosition.top);
  } else {
    topOffset = -(newPosition.top - oldPosition.top);
  }

  //instantly offsetting the div to it current position
  ui.draggable.animate( {

    left: '+=' + leftOffset,
    top: '+=' + topOffset,

  }, 0 )

  //allowing the draggable to revert to it's proper position in the new column
  ui.draggable.draggable( "option", "revert", true );

  };

// function pastelColors(){
//     var r = (Math.round(Math.random()* 127) + 127).toString(16);
//     var g = (Math.round(Math.random()* 127) + 127).toString(16);
//     var b = (Math.round(Math.random()* 127) + 127).toString(16);
//     return '#' + r + g + b;
// }
