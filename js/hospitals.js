$(document).ready(function(){
	loadMaps();
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
	    zoom: 11,
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

    // initial 'victim'
    var victimMarker = new google.maps.Marker({
    	position : new google.maps.LatLng(40.706777, -74.012854),
    	map : map,
    	icon: 'img/red-dot.png'
    })
}
