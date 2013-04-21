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
  VictimDragger.allMarkers.push(this.marker);
  VictimDragger.createAlert(this.victimName + " is having a heart attack!");
  TOTAL++;

  google.maps.event.addListener(this.marker, 'dragstart', function(){
  });

  google.maps.event.addListener(this.marker, 'dragend', function(){
    that.geocodePosition(that.marker.getPosition(), function(pos) { 
      that.dropSuccess(that.drop(pos)); 
    });
  });
};

VictimDragger.allMarkers = [];

VictimDragger.prototype.geocodePosition = function(pos, cb) {
   geocoder = new google.maps.Geocoder();
   geocoder.geocode({ latLng: pos }, function(results, status) {
     if (status == google.maps.GeocoderStatus.OK) {
        cb(results[0]);
      } else {
        cb(false);
      }
   });
};

VictimDragger.prototype.drop = function(pos) {
  // find out if they're near a hospital
  for (var i = 0; i < HOSPITALS.length; i++) {
    var dist = VictimDragger.getDistance(pos.geometry.location.lat(), HOSPITALS[i].lat, pos.geometry.location.lng(), HOSPITALS[i].lng)
    if (dist < 0.005) {
      return HOSPITALS[i];
    }
  }
};

VictimDragger.getDistance = function(xa, xb, ya, yb) {
  return Math.sqrt( Math.pow((xa - xb), 2) + Math.pow((ya - yb), 2) );
};

VictimDragger.createAlert = function(msg, duration){
  var text = "<div class='alert'>" + msg + "</div>";
  $('#alert-box').html(text);
  $('#alert-box').fadeIn();
  setTimeout(function(){ $('#alert-box').fadeOut(); }, 1500); 
  NEEDSHELP++;
  $('#needs-help').html(generatePeople(NEEDSHELP, "red"));
};

VictimDragger.calculateDeath = function(hospital, totalTravelTime) {
  var NY_AVG = 97.95;
  var survivalChance = 100;
  var fudge = 5;
  survivalChance -= (Math.floor(totalTravelTime) * 10)
  // do something with death rate
  if (hospital.heart_care_rating > (NY_AVG + 0.5)) {
    survivalChance += fudge
  }
  if (hospital.heart_care_rating < (NY_AVG - 0.5)) {
    survivalChance -= fudge
  }
  if (survivalChance <= 0) {
    survivalChance = 5;
  }
  console.log(survivalChance / 100);
  return (Math.random() < survivalChance / 100) ? true : false
};

VictimDragger.prototype.dropSuccess = function(hospital) {
  var that = this;
  this.elapsedTime = ((new Date().getTime() - this.startTime) / 1000)/2;
  this.travelTime(hospital, function(resp) {

    // Calcuate chance of survival. Which needs to move the individual from needshelp.
    var totalTravelTimeMinutes = ((that.elapsedTime + resp.routes[0].legs[0].duration.value) / 60)
    var success = VictimDragger.calculateDeath(hospital, totalTravelTimeMinutes);

    // Displaying the result
    VictimDragger.createResult(that.victimName, success, hospital, totalTravelTimeMinutes, hospital.hospital_rating_str);
    that.marker.setMap(null);
    
  });
};

VictimDragger.createResult = function(name, success, hospital, speedRate, hospitalRate) {
  var that = this;

  function displaySuccess(success){
    return success ? "SURVIVED!" : "didn't make it.";
  }

  var rateLookup = {
    "Below average": "low",
    "About average": "medium",
    "Above average": "high",
    "Slow": "low",
    "Average": "medium",
    "Fast": "high"
  }
  var displayText = {
    "Below average": "BELOW AVG.",
    "About average": "AVERAGE",
    "Above average": "ABOVE AVG."
  }

  function determineSpeedQuality(speedRate){
    if (speedRate < 10){
      return "high"
    } else if (speedRate < 20){
      return "medium"
    } else {
      return "low"
    }
  }

  var html = '<h5>' + name + ' ' + displaySuccess(success) + '</h5> <table> <tr> <td class="nlabel">TRANSPORT SPEED:</td> <td id="speed-score"><span class="' + determineSpeedQuality(speedRate) + '">' + Math.round(speedRate) + ' MINUTES</span></td> </tr> <tr> <td class="nlabel">HOSPITAL QUALITY:</td> <td id="hospital-score"><span class="' + rateLookup[hospitalRate] + '">' + displayText[hospitalRate] +  '</span></td> </tr> </table>';

  executeUpdates(success, html);

  function executeUpdates(success, html){
    if (success){
      SURVIVED++;
      $('.success').html(SURVIVED);
      $('#survived').find('.notif').html(html);
      $('#survived').find('.notif').fadeIn();
      setTimeout(function(){ $('#survived').find('.notif').fadeOut(); }, 2000); 
      lives.play();
    } else {
      DECEASED++;
      $('.deceased').html(DECEASED);
      $('#deceased').find('.notif').html(html);
      $('#deceased').find('.notif').fadeIn();
      setTimeout(function(){ $('#deceased').find('.notif').fadeOut(); }, 2000); 
      dies.play();
    }

    NEEDSHELP--;
    $('#needs-help').html(generatePeople(NEEDSHELP, "red"));
  }
};

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
    }
  });
};
