var NEEDSHELP = 0;

$(document).ready(function(){
	loadMaps();
	travelTime("Brooklyn", "Sunnyside, Queens");
	$('#hospitalized').html(generatePeople(40, "red"));
	$('#survived').html(generatePeople(2, "green"));
	$('#deceased').html(generatePeople(10, "red"));

	// Handling the opening screen
	$('.start').click(function(){
		$('.instructions-background').add('.instructions').fadeOut();
		// Start adding victims.
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

    var map = new google.maps.Map( document.getElementById('map-container'), PPopts );
    map.mapTypes.set('propublica', mapType);
    var mapBounds;
		google.maps.event.addListenerOnce(map, 'bounds_changed', function(){
		    mapBounds = this.getBounds();
		});

    var overlay = new google.maps.OverlayView();

    _(HOSPITALS).each(function(hospital) {
			 var marker = new google.maps.Marker({
			  position: new google.maps.LatLng(hospital.lat, hospital.lng),
			  map: map,
			  icon: 'img/hospital.png'
			});   	
    });

    var boroughPolygons = []
    var nyBoroughs = new GeoJSON(NY_BOROUGHS, {fillColor : "#000000", fillOpacity: 0, strokeWeight: 1, map : map, strokeColor : "#999999" });
    for (var i = 0; i < nyBoroughs.length; i++) {
    	//console.log(nyBoroughs[i]);
    	for (var j = 0; j < nyBoroughs[i].length; j++) {
    		console.log(nyBoroughs[i][j].error)
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
  		//console.log(point);
  		for (i = 0; i < boroughPolygons.length; i++) {
  			if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(point[0], point[1]), boroughPolygons[i])) {
  				//console.log("HERE")
  				return new VictimDragger(point, map)
  			}
  		}
  		// if our point falls outside the boroughs, call again
  		return generateVictim();
    }

	//var currentVictim = new VictimDragger([40.706777, -74.012854], map)
	//generateVictim();

	// For testing only:
	// setInterval(function(){ new VictimDragger([40.706777, -74.012854], map); }, 2000);
}
 

// Calculate travel times from any origin to destination
function travelTime(origin, destination){
	var url = "http://maps.googleapis.com/maps/api/directions/json?origin=" + origin + "&destination=" + destination + "&sensor=false";

	$.ajax({
	  url: url
	}).done(function ( data ) {
	  seconds = data.routes[0].legs[0].duration.value;
	  return seconds;
	});
}

function generatePeople(number, color){
	var temp = [];
	$.each(_.range(number), function(k,v){
		temp.push('<img class="person" src="img/person-' + color + '.png" />');
	})
	return temp.join('');
}
