$(document).ready(function(){
	loadMaps();
	travelTime("Brooklyn", "Sunnyside, Queens");
	$('#survived').html(generatePeople(2));
	$('#deceased').html(generatePeople(10));
})

function loadMaps(){
	// var mapInit = new google.maps.LatLngBounds();

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
	    center: new google.maps.LatLng(40.7363, -73.9271)
	};

    var mapType = new google.maps.StyledMapType(PPstyles, PPopts);

    var map = new google.maps.Map( document.getElementById('map-container'), PPopts );
    map.mapTypes.set('propublica', mapType);

    _(HOSPITALS).each(function(hospital) {
			 var marker = new google.maps.Marker({
			  position: new google.maps.LatLng(hospital.lat, hospital.lng),
			  map: map,
			  icon: 'img/blue-dot.png'
			});   	
    });

	var currentVictim = new VictimDragger([40.706777, -74.012854], map)
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

function generatePeople(number){
	var temp = [];
	$.each(_.range(number), function(k,v){
		temp.push('<img class="person" src="img/person.png" />');
	})
	return temp.join('');
}
