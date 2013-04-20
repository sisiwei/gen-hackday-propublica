var VictimDragger = function(startCoords, map) {
  var that = this;

  this.startCoords = startCoords;
  this.startTime = new Date().getTime();
  this.victimName = RANDOM_NAMES[Math.floor(Math.random()*RANDOM_NAMES.length)];
  this.marker = new google.maps.Marker({
    position : new google.maps.LatLng(this.startCoords[0], this.startCoords[1]),
    map : map,
    draggable : true,
    animation: google.maps.Animation.DROP,
    icon: 'img/red-dot.png'
  });
  that.createAlert();

  google.maps.event.addListener(this.marker, 'dragstart', function(){
   console.log("starting to drag");
  });

  google.maps.event.addListener(this.marker, 'dragend', function(){
    that.geocodePosition(that.marker.getPosition(), function(pos) { new that.drop(pos); });
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
  console.log(pos);
  // find out if they're near a hospital
  for (var i = 0; i < HOSPITALS.length; i++) {
    var dist = VictimDragger.getDistance(pos.geometry.latitude, HOSPITALS[i].lat, pos.geometry.longitude, HOSPITALS[i].lng)
    console.log(dist);
  }
}

VictimDragger.getDistance = function(xa, xb, ya, yb) {
  return Math.sqrt( Math.pow((xa - xb), 2) + Math.pow((ya - yb), 2) );
}

VictimDragger.prototype.createAlert = function(pos){
  overlay = new google.maps.OverlayView();
  overlay.draw = function() {};
  overlay.setMap(map);
  var point = overlay.getProjection().fromLatLngToDivPixel(pos); 
  console.log(this.victimName + " is having a heart attack!");
}