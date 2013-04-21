var TOTAL = 0,
	NEEDSHELP = 0,
	SURVIVED = 0,
	DECEASED = 0;
var map;

$(document).ready(function(){
	loadMaps();

	// Handling the opening screen
	$('.start').click(function(){
		$('.instructions-background').add('.instructions').fadeOut();
		// Start adding victims.
		var levels   = [3000, 2000, 1000];
		var curLevel = 0;
		var levelLength = 5000;

		window.setGame = function(level) {
			return window.game = setInterval(function(){
				console.log("on level " + level)
				generateVictim();
			}, levels[level]);
		}

		window.setClear = function() {
			window.clearInterval(window.game, levelLength)
		}

		var fullGame = window.setInterval(function() {
			if (curLevel < levels.length - 1) {
				curLevel++
				window.setClear();
				window.setGame(curLevel)
				console.log("levelup" + curLevel)
			} else {
				window.setClear();
				endGame();
			}
		}, 10000)

		window.setGame(0)
	})

})

function loadMaps(){
	var PPstyles = [
	  {
	      featureType: "road",
	      elementType: "geometry",
	      stylers: [
	          { lightness: 75 }
	      ]
	  },{
	      featureType: "all",
	      elementType: "all",
	      stylers: [
	          { saturation: -80 }
	      ]
	  },{
	      featureType: "poi",
	      elementType: "labels",
	      stylers: [
	          { visibility: "off" }
	      ]
	  },{
	      featureType: "landscape",
	      elementType: "labels",
	      stylers: [
	          { visibility: "off" }
	      ]
	  },{
	      featureType: "administrative.locality",
	      elementType: "labels",
	      stylers: [
	          { visibility: "off" }
	      ]
	  },{
	      featureType: "administrative.land_parcel",
	      elementType: "labels",
	      stylers: [
	          { visibility: "off" }
	      ]
	}];

	var PPopts = {
	    name: "propublica-map",
	    zoom: 12,
	    mapTypeId: "propublica",
	    mapTypeControl: false,
	    streetViewControl: false,
	    scrollwheel:false,
	    disableDefaultUI: true,
	    disableDoubleClickZoom: true,
	    panControl: false,
	    draggable: false,
	    center: new google.maps.LatLng(40.7350, -73.9571)
	};

    var mapType = new google.maps.StyledMapType(PPstyles, PPopts);

    map = new google.maps.Map( document.getElementById('map-container'), PPopts );
    map.mapTypes.set('propublica', mapType);
    var mapBounds;

    var overlay = new google.maps.OverlayView();

    _(HOSPITALS).each(function(hospital) {
    	if (hospital.hospital_rating_str && hospital.hospital_rating_str !== "Unknown") {
    		var displayText = {
					"Below average": "red",
					"About average": "yellow",
					"Above average": "green"
				};
			 	var marker = new google.maps.Marker({
			  	position: new google.maps.LatLng(hospital.lat, hospital.lng),
			  	map: map,
			  	icon: 'img/hospital-' + displayText[hospital.hospital_rating_str] + '.png'
				});
		 	}
    });

    var boroughPolygons = []
    var nyBoroughs = new GeoJSON(NY_BOROUGHS, {fillColor : "#999999", fillOpacity: 0.25, strokeWeight: 1, map : map, strokeColor : "#999999" });
    for (var i = 0; i < nyBoroughs.length; i++) {
    	for (var j = 0; j < nyBoroughs[i].length; j++) {
    		var feature = nyBoroughs[i][j];
    		boroughPolygons.push(feature);
    		feature.setMap(map);
    	}
    }

    var generateVictim = window.generateVictim = function() {
	    var nyEnvelope = [mapBounds.getSouthWest().lat(), 
							mapBounds.getSouthWest().lng(), 
							mapBounds.getNorthEast().lat(), 
							mapBounds.getNorthEast().lng()]

    	// get a random point inside the nyEnvelope, then check if it's within the nyBoroughs bounds
  		var point = [nyEnvelope[0] + (Math.random() * (nyEnvelope[2] - nyEnvelope[0])), 
  							 	nyEnvelope[1] + (Math.random() * (nyEnvelope[3] - nyEnvelope[1]))]
  		for (i = 0; i < boroughPolygons.length; i++) {
  			if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(point[0], point[1]), boroughPolygons[i])) {
  				return new VictimDragger(point, map)
  			}
  		}
  		// if our point falls outside the boroughs, call again
  		return generateVictim();
    }

	google.maps.event.addListenerOnce(map, 'bounds_changed', function(){
	    mapBounds = this.getBounds();
	    $('#start-button').html("I'm ready. Start the game.");
	});

}
 

function generatePeople(number, color){
	var temp = [];
	$.each(_.range(number), function(k,v){
		temp.push('<img class="person" src="img/person-' + color + '.png" />');
	})
	return temp.join('');
}

function endGame(){
	$('.instructions-background').fadeIn();
	$('#final-saved').html(SURVIVED);
	$('#final-total').html(TOTAL);

	if (SURVIVED >= DECEASED){
		$('.resolution-congrats').fadeIn();
	} else {
		$('.resolution-sad').fadeIn();
	}

}
