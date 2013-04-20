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
  that.createAlert(map, startCoords);

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
      return HOSPITALS[i].hospital_name;
    }
  }
}

VictimDragger.getDistance = function(xa, xb, ya, yb) {
  return Math.sqrt( Math.pow((xa - xb), 2) + Math.pow((ya - yb), 2) );
}

VictimDragger.prototype.createAlert = function(map, pos){
  // var overlay = new google.maps.OverlayView();
  // overlay.draw = function() {};
  // overlay.setMap(map);
  // var point = overlay.getProjection().fromLatLngToDivPixel(pos); 
  var text = "<div class='alert'>" + this.victimName + " is having a heart attack!</div>";
  $('#alert-box').html(text);
  $('#alert-box').fadeIn();
  setTimeout(function(){ 
    $('#alert-box').fadeOut(); 
  },1500);


}

VictimDragger.prototype.dropSuccess = function(name) {
  console.log("dropped on:" + name);
}