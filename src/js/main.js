/**
 * Created by tanner on 9/25/17.
 */
function GooleMapsCBFnc() {
    "use strict";
     var initKOApp = function() {
         var WEATHER_URL = "http://api.wunderground.com/api/a4e4d43e9da41acf/hourly/q/WA/Seattle.json",
             MARKER_IMG_URL = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';
         var current_selection = {
             marker: {
                 location: null,
                 marker: null,
                 infowindow: null
             },
             city: ko.observable()
         };
         //KNOCKOUT DATA
         var root = this; // declaration is part of k.o. style. Use 'root' avoids latency.
         // observables
         root.locations = ko.observableArray();
         root.cities = ko.observableArray(['Seattle', 'Renton', 'Bellevue']);
         root.weather_forecast = ko.observableArray();
         // computed observables
         // root.cityFilter = {
         //     selected_city: ko.observable(),
         //     li_StyleCompute: ko.computed(function(){}),
         //
         // };
         // DATA FUNCTIONS
         // utility functions
         var util = {
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {url} string
              * @param {root} Knockout object
              * @returns {google maps maker} marker*/
             getWeather_from_URL: function getWeather_from_URL(url, root) {
                 $.getJSON(url, function (response) {
                     root.weather_forecast(response.hourly_forecast.splice(0,5));
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
                 var contentString = '<div id="content">'+
                     '<div id="siteNotice">'+
                     '</div>'+
                     '<h2 id="firstHeading" class="firstHeading">'+ marker.title + ' </h2>'+
                     '</div>'+
                     '</div>';
                 var infowindow = new google.maps.InfoWindow({
                     content: contentString
                 });
                 if (current_selection.marker.marker) {
                     if (marker === current_selection.marker.marker) { return; }
                     current_selection.marker.marker.setAnimation(null);
                 }
                 if (current_selection.location) {
                     current_selection.location.isCrossed(false);
                 }
                 if (current_selection.infowindow) {
                     current_selection.infowindow.close();
                 }

                 // find corresponding marker on
                 for (var i = 0; i < locations().length; i++) {
                     var loc = locations()[i];
                     if ( loc && loc.park_name === marker.title) {
                         current_selection.location = loc;
                     }
                 }
                 // console.log(current_selection);
                 // console.log(marker.position.lat());
                 // console.log(marker.position.lng());
                 var fenway = {lat: marker.position.lat(), lng: marker.position.lng()};
                 var panorama = new google.maps.StreetViewPanorama(
                     document.getElementById('street_view'), {
                         position: fenway
                         // pov: {
                         //     heading: 34,
                         //     pitch: 10
                         // }
                     });

                 map.setStreetView(panorama);
                 current_selection.marker.marker = marker;
                 current_selection.location.isCrossed(true);
                 current_selection.infowindow = infowindow;
                 current_selection.marker.marker.setAnimation(google.maps.Animation.BOUNCE);
                 infowindow.open(map,marker);
                 return current_selection.marker.marker;
             },
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {DB} object
              * @param {root} Knockout object
              * @returns {}, modified root  */
             filterByCity_from_DB: function filterByCity_from_DB(db, city, root) {
                 root.locations.removeAll();
                 db.forEach(function(location){
                     if (location.city !== city) {return;}
                     var obsv_city = ko.observable();
                     var obsv_isCrossed = ko.observable(location.filtered);
                     root.locations.push({
                         park_name: location.park_name,
                         isCrossed: obsv_isCrossed,
                         city: obsv_city
                     });
                 });
             }
         };

         // EVENT FUNCTIONS

         /*@description function listens to click event from locations list items.
          *@param {location object} location
          *@returns.
          * */
         root.formatTime = function(time) {
             var hour = time%12 === 0? 12: time%12;
             var meridiem = time > 12? " PM":" AM";
             return hour + meridiem;
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
         root.toggleListItem  = function(location) {
             for (var i = 0; i < markers.length; i++) {
                 var m = markers[i];
                 if ( m.title === location.park_name ) {
                     util.setAnimation(m, root.locations);
                     break;
                 }
             }
         };
         root.toggleNav = function(state) {
             if (state === 'open') {
                 document.getElementById("mySidenav").style.width = "300px";
                 document.getElementById("park_list").style.width = "auto";
                 document.getElementById("openbtn").style.transform = "translateX(300px)";
             }
             else {
                 document.getElementById("park_list").style.width = "0";
                 document.getElementById("mySidenav").style.width = "0";
                 document.getElementById("openbtn").style.transform = "translateX(0px)";
             }
         };
         root.select_city = function(city) {
             current_selection.city(city);
             // console.log("running");
             // console.log(current_selection.city());
             if(!current_selection.city()){
                 util.createObvLocations_from_DB(DB, root);
             }
             else {
                 util.filterByCity_from_DB(DB, city, root);
             }
         };
         root.currentCity = function(){
             return current_selection.city();
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

         // START/MAIN
         util.createObvLocations_from_DB(DB, root);
         util.getWeather_from_URL(WEATHER_URL, root);
    };

     ko.applyBindings(new initKOApp());
}
