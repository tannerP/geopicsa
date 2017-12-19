/**
 * Created by tanner on 9/25/17.
 */
function GooleMapsCBFnc() {
    "use strict";
     var initKOApp = function() {
         var client_key = "4NKI5G3XVHY5WMGSRZ52IZLVA4M5XNSCUGVXNGFPIECBZS53";
         var client_secret = "KFSCERJN5Z1H4K1DCV4XDTXSQ0OAVU0AMGG5QHVYHMT5YVWW";
         var WEATHER_URL = "https://api.wunderground.com/api/a4e4d43e9da41acf/hourly/q/WA/Seattle.json",
             MARKER_IMG_URL = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';


         // Knockout app
         var root = this;
         // Selected Data
         var current_selection = {
             selection: {
                 location: null,
                 marker: null,
                 infowindow: null
             },
             city: ko.observable(),
             reset: function(item) {
                 if (this.selection.marker) {
                     if (item) {
                         // unique case, exit if marker already selected
                         if (item === current_selection.selection.marker) {
                             this.selection.infowindow.close(); return;
                         }
                     }
                     this.selection.marker.setAnimation(null);
                 }
                 if (this.selection.location) {
                     this.selection.location.isCrossed(false);
                 }
                 if (this.selection.infowindow) {
                     this.selection.infowindow.close();
                 }
                 if (!this.selection.location == null){
                     util.createObvLocations_from_DB(DB, root);
                 }
                 markers.forEach(function(m) {
                     m.setVisible(true);
                 });
             }
         };
         // helper functions
         var util = {
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {url} string
              * @param {root} Knockout object
              * @returns {google maps maker} marker*/
             getWeather_from_URL: function getWeather_from_URL(url, root) {
                 $.getJSON(url, function (response) {
                     root.weather_message("Seattle Weather Forecast");
                     root.weather_forecast(response.hourly_forecast.splice(0,5));
                 }).fail(function(error){
                     root.weather_error_message("Status: No weather data.");
                 });
             },
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {google maps maker} marker
              * @param {ko.observable list} locations
              * @returns {google maps maker} marker*/
             createObvLocations_from_DB: function createObvLocations_from_DB(DB, root) {
                 root.locations.removeAll();
                 DB.forEach(function(marker){
                     var obsv_city = ko.observable();
                     var obsv_isCrossed = ko.observable(marker.filtered);
                     root.locations.push({
                         park_name: marker.park_name,
                         isCrossed: obsv_isCrossed,
                         city: obsv_city
                     });
                 });
             },
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {DB} object
              * @param {root} Knockout object
              * @returns {}, modified root  */
             setAnimation: function setAnimation(marker, locations) {
                 current_selection.reset(marker);
                 // find marker from locations list.
                 for (var i = 0; i < locations().length; i++) {
                     var loc = locations()[i];
                     if ( loc && loc.park_name === marker.title) {
                         current_selection.selection.location = loc;
                     }
                 }

                 // street view
                 var fenway = {lat: marker.position.lat(), lng: marker.position.lng()};
                 var panorama = new google.maps.StreetViewPanorama(
                     document.getElementById('street_view'), {
                         position: fenway
                     });
                 map.setStreetView(panorama);


                var url = "https://api.foursquare.com/v2/venues/"+
                    "search?ll=" +  marker.position.lat() + "," +  marker.position.lng() +"&client_id=" +
                    client_key + "&client_secret=" + client_secret + "&v=20170930";

                $.ajax(url).done(function(data){
                        // TODO check it first venue is the best one
                        var summary = data.response.venues[0].hereNow.summary,
                           nCheckedin= data.response.venues[0].stats.checkinsCount;

                        var contentString = '<div id="content">'+ '<div id="siteNotice">'+
                        '<h2 id="firstHeading" class="firstHeading">'+ marker.title + ' </h2>'+
                            '<hr>'+
                             '<p>' + "Current: "+  summary + ' </p>'+
                             '<p>' + "Checkedin: "+  nCheckedin + ' </p>'+
                            "<p id='infoWindowLogo'> by Foursquare </p>"+
                            '</div>' + '</div>';

                        var infowindow = new google.maps.InfoWindow({content: contentString});
                        current_selection.selection.infowindow = infowindow;
                        current_selection.selection.infowindow.open(map,marker);
                        })
                        .fail(function(error){
                            var contentString = '<div id="content">'+ '<div id="siteNotice">'+
                            '<h2 id="firstHeading" class="firstHeading">'+ marker.title + ' </h2>'+
                            '</div>' + '</div>';

                            var infowindow = new google.maps.InfoWindow({content: contentString});
                            current_selection.selection.infowindow = infowindow;
                            current_selection.selection.infowindow.open(map,marker);
                        });

                // marker
                 current_selection.selection.marker = marker;
                 current_selection.selection.marker.setAnimation(google.maps.Animation.BOUNCE);
                 // update style
                 current_selection.selection.location.isCrossed(true);
                 return current_selection.selection.marker;
             },
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {DB} object
              * @param {root} Knockout object
              * @returns {}, modified root  */
             makers_filterByCity: function filterByCity_from_DB(city, markers) {
                 for (var i = 0; i < markers.length; i++) {
                     var m = markers[i];
                     if ( m.title === location.park_name ) {
                         util.setAnimation(m, root.locations);
                         // this.processing = false;
                         break;
                     }
                 }
             },

             // TODO *bottle neck
             /*@description rebuild root.locations.
              * @param {db} database.
              * @param {root} Knockout object.
              * @param {city} city of interest.
              * @returns {}, modified root  */
             filterByCity_from_DB: function filterByCity_from_DB(db, city, root, markers) {
                 root.locations.removeAll();
                 var parks = [];
                 db.forEach(function (location) {
                     if (location.city !== city) {
                         return;
                     }
                     var obsv_city = ko.observable();
                     var obsv_isCrossed = ko.observable(location.filtered);
                     parks.push(location.park_name); //populate parks
                     root.locations.push({
                         park_name: location.park_name,
                         isCrossed: obsv_isCrossed,
                         city: obsv_city
                     });
                 });


                 for (var j = 0; j < markers.length; j++) {
                     var m = markers[j];
                     m.setVisible(true);
                     if ( parks.indexOf(m.title) === -1) {
                         m.setVisible(false);
                     }
                 }
             }
         };
         // GOOGLE MAPS
         var map = new google.maps.Map(document.getElementById('map'), {
             zoom: 11,
             center: {lat: 47.6062, lng: -122.3321},
             styles: [
                 {elementType: 'geometry', stylers: [{color: '#6c736f'}]},
                 {elementType: 'labels.text.stroke', stylers: [{color: '#6c736f'}]},
                 {elementType: 'labels.text.fill', stylers: [{color: '#6c736f'}]},
                 {
                     featureType: 'administrative.locality',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#123f09'}]
                 },
                 {
                     featureType: 'poi',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#d59563'}]
                 },
                 {
                     featureType: 'poi.park',
                     elementType: 'geometry',
                     stylers: [{color: '#6c736f'}]
                 },
                 {
                     featureType: 'poi.park',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#6b9a76'}]
                 },
                 {
                     featureType: 'road',
                     elementType: 'geometry',
                     stylers: [{color: '#6c736f'}]
                 },
                 {
                     featureType: 'road',
                     elementType: 'geometry.stroke',
                     stylers: [{color: '#6c736f'}]
                 },
                 {
                     featureType: 'road',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#9ca5b3'}]
                 },
                 {
                     featureType: 'road.highway',
                     elementType: 'geometry',
                     stylers: [{color: '#746855'}]
                 },
                 {
                     featureType: 'road.highway',
                     elementType: 'geometry.stroke',
                     stylers: [{color: '#6c736f'}]
                 },
                 {
                     featureType: 'road.highway',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#f3d19c'}]
                 },
                 {
                     featureType: 'transit',
                     elementType: 'geometry',
                     stylers: [{color: '#6c736f'}]
                 },
                 {
                     featureType: 'transit.station',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#d59563'}]
                 },
                 {
                     featureType: 'water',
                     elementType: 'geometry',
                     stylers: [{color: '#a1a1a1'}]
                 },
                 {
                     featureType: 'water',
                     elementType: 'labels.text.fill',
                     stylers: [{color: '#a1a1a1'}]
                 },
                 {
                     featureType: 'water',
                     elementType: 'labels.text.stroke',
                     stylers: [{color: '#a1a1a1'}]
                 }
             ]
         });


         // UI DATA MODEL
         root.locations = ko.observableArray();
         root.cities = ko.observableArray(['Seattle', 'Renton', 'Bellevue']);
         root.weather_forecast = ko.observableArray();
         root.weather_message = ko.observable();
         root.weather_error_message = ko.observable();
         // UI FUNCTION
         root.clickToggleListItem  = function(location) {
             for (var i = 0; i < markers.length; i++) {
                 var m = markers[i];
                 if ( m.title === location.park_name ) {
                     util.setAnimation(m, root.locations);
                     // this.processing = false;
                     break;
                 }
             }
         };
         root.clickToggleNav = function(state) {
             var slider_width= 320 + 'px';
             if (state === 'open') {
                 document.getElementById("mySidenav").style.width = slider_width;
                 document.getElementById("park_list").style.width = "98%";
                 document.getElementById("openbtn").style.transform = "translateX(280px)";
             }
             else {
                 current_selection.reset();
                 document.getElementById("park_list").style.width = "0";
                 document.getElementById("mySidenav").style.width = "0";
                 document.getElementById("openbtn").style.transform = "translateX(0px)";
             }
         };
         root.select_city = function(city) {
             //reset
             if(!city){
                 current_selection.reset();
                 util.createObvLocations_from_DB(DB, root);
             }
             //filtering
             else {
                 util.filterByCity_from_DB(DB, city, root, markers);
             }
             current_selection.city(city);
         };
         root.formatTime = function(time) {
             var hour = time%12 === 0? 12: time%12;
             var meridiem = time > 12? " PM":" AM";
             return hour + meridiem;
         };
         // UI STATES
         root.currentCity = function() {
             return current_selection.city();
         };
         root.currentTime = function () {
             var hour = new Date().getHours() % 12;
             var min = new Date().getMinutes();
             var meridiem = hour > 12 ? " PM" : " AM";
             // format ex: 12:00 AM
             if (hour == 0) {
                 hour = 12;
             }
             if (min < 10) {
                 min = "0" + min;
             }

             return hour + ":" + min + meridiem;
         };


         // MAIN
         var markers = DB.map(function(location) {
             var marker =  new google.maps.Marker({
                 title: location.park_name,
                 position: { lat: location.lat, lng: location.lng },
                 animation: google.maps.Animation.DROP,
                 icon: MARKER_IMG_URL,
                 map: map
             });
             marker.addListener('click', function(){
                 marker = util.setAnimation(marker, root.locations);
             });
             return marker;
         });
         util.createObvLocations_from_DB(DB, root);
         util.getWeather_from_URL(WEATHER_URL, root);
    };
     ko.applyBindings(new initKOApp());
}

function mapsAsyncError() {
    $("#openbtn").css({'display': 'none'});
    $('#map').append("<h1 style='text-align: center; color: orange'>  Error Loading Google Maps</h1>");
}
