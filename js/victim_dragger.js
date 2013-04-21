var VictimDragger = function(startCoords, map) {
  var that = this;
  this.map = map;
  this.startCoords = startCoords;
  this.startTime = new Date().getTime();
  this.victimName = RANDOM_NAMES[Math.floor(Math.random()*RANDOM_NAMES.length)];
  this.marker = new google.maps.Marker({
    position : new google.maps.LatLng(this.startCoords[0], this.startCoords[1]),
    map : map,
    draggable : true,
    animation: google.maps.Animation.DROP,
    icon: 'img/person-red.png'
  });
  VictimDragger.createAlert(this.victimName + " is having a heart attack!", 1500, "alert");

  google.maps.event.addListener(this.marker, 'dragstart', function(){
  });

  google.maps.event.addListener(this.marker, 'dragend', function(){
    that.geocodePosition(that.marker.getPosition(), function(pos) { 
      that.dropSuccess(that.drop(pos)); 
    });
  });
};

VictimDragger.prototype.geocodePosition = function(pos, cb) {
   geocoder = new google.maps.Geocoder();
   geocoder.geocode({ latLng: pos }, function(results, status) {
     if (status == google.maps.GeocoderStatus.OK) {
        cb(results[0]);
      } else {
        cb(false);
      }
   });
}

VictimDragger.prototype.drop = function(pos) {
  // find out if they're near a hospital
  for (var i = 0; i < HOSPITALS.length; i++) {
    var dist = VictimDragger.getDistance(pos.geometry.location.lat(), HOSPITALS[i].lat, pos.geometry.location.lng(), HOSPITALS[i].lng)
    if (dist < 0.005) {
      return HOSPITALS[i];
    }
  }
}

VictimDragger.getDistance = function(xa, xb, ya, yb) {
  return Math.sqrt( Math.pow((xa - xb), 2) + Math.pow((ya - yb), 2) );
}

VictimDragger.createAlert = function(msg, duration, target){
  if (target == "alert"){
    var text = "<div class='alert'>" + msg + "</div>";
    $('#alert-box').html(text);
    $('#alert-box').fadeIn();
    setTimeout(function(){ $('#alert-box').fadeOut(); }, duration || 1500); 
    NEEDSHELP++;
    $('#needs-help').html(generatePeople(NEEDSHELP, "red"));
  } else if (target == "message"){
    var text = "<div class='alert'>" + msg + "</div>";
    $('#hospital-box').prepend(text);
  }

}

VictimDragger.prototype.dropSuccess = function(hospital) {
  var that = this;
  this.travelTime(hospital, function(resp) { 
    VictimDragger.createAlert("You took " + that.victimName + " to " + hospital.hospital_name +
      " <br\/>where the heart attack mortality rate is " + hospital.heart_attack_mortality_rate + "%." +
      " It took " +  resp.routes[0].legs[0].duration.text + " to travel the " + resp.routes[0].legs[0].distance.text + "."
    , 3000, "message")
    that.marker.setMap(null);
    window.setTimeout(window.generateVictim, 3100);
  });
}

// Calculate travel times from any origin to destination
VictimDragger.prototype.travelTime = function(hospital, cb){
  directionsService = new google.maps.DirectionsService();
  var origin = new google.maps.LatLng(this.startCoords[0], this.startCoords[1]);
  var destination = new google.maps.LatLng(hospital.lat, hospital.lng);
  var request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      cb(result);
      //console.log(result);
      //directionsDisplay.setDirections(result);
    }
  });
}
