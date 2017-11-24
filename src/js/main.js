/**
 * Created by tanner on 9/25/17.
 */
var UI = {
    openNav: function () {
        document.getElementById("mySidenav").style.width = "300px";
        document.getElementById("park-list").style.width = "auto";
        document.getElementById("openbtn").style.transform = "translateX(300px)";
    },
    closeNav: function() {
        document.getElementById("park-list").style.width = "0";
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("openbtn").style.transform = "translateX(0px)";
    }
};

function initApp() {
    "use strict";
     var initKOApp = function() {
        var WEATHER_URL = "http://api.wunderground.com/api/a4e4d43e9da41acf/hourly/q/WA/Seattle.json",
            MARKER_IMG_URL = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';

        var root = this; //Knockout
         root.locations = ko.observableArray();
         root.weather_forecast = ko.observableArray();
         root.weatherIcon_img= ko.observable({});
         root.getCurrentTime = ko.computed(function(){});
         root.current_time = ko.observable({
             hr: new Date().getHours(),
             min: new Date().getMinutes()
         });

         // google maps marker, or list item selection
         var current_selection = {
            location: null,
            marker: null,
            infowindow: null
        };

         // app helper functions
         var util = {
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {url} string
              * @param {root} Knockout object
              * @returns {google maps maker} marker*/
             getWeather_from_URL: function(url, root) {
                $.getJSON(url, function (response) {
                    root.weather_forecast(response.hourly_forecast.splice(0,5));
                    // response.hourly_forecast.forEach(function(r){
                    //         try {
                    //             var r = response.hourly_forecast[0];
                    //             root.weather_forecast()
                    //                 .push(r.temp.english);
                    //             root.weatherIcon_img(r.icon_url);
                    //             root.weather(r.temp.english);
                    //             // console.log(response.current_observation);
                    //             // console.log(root.weatherIcon_img());
                    //         }
                    //         catch(err) {
                    //             console.log(err);
                    //         }
                    //     });
                });
            },
             /*@description animate marker and update corresponding list item style.
              * Finally, update app current_selection states.
              * @param {google maps maker} marker
              * @param {ko.observable list} locations
              * @returns {google maps maker} marker*/
             createObvLocations_from_DB: function(DB, root) {
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
             setAnimation: function(marker, locations) {
                var contentString = '<div id="content">'+
                    '<div id="siteNotice">'+
                    '</div>'+
                    '<h2 id="firstHeading" class="firstHeading">'+ marker.title + ' </h2>'+
                    '</div>'+
                    '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                if (current_selection.marker) {
                    if (marker === current_selection.marker) { return; }
                    current_selection.marker.setAnimation(null);
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
                current_selection.marker = marker;
                current_selection.location.isCrossed(true);
                current_selection.infowindow = infowindow;
                current_selection.marker.setAnimation(google.maps.Animation.BOUNCE);
                infowindow.open(map,marker);
                return current_selection.marker;
            }
        };

         // KNOCKOUT
         /*@description function listens to click event from locations list items.
         *@param {location object} location
         *@returns.
         * */
         root.onToggleListItem  = function(location) {
            for (var i = 0; i < markers.length; i++) {
               var m = markers[i];
                console.log(m);

               if ( m.title=== location.park_name ) {
                   console.log("found");
                   util.setAnimation(m, root.locations);
                   break;
               }
            }
        };
         root.formatTime = function(time) {
            return time%12 + (time > 12? " PM":" AM");
         };
         root.getCurrentTime = function() {
             var hour = new Date().getHours()%12;
             var meridiem = hour > 12?  " PM":" AM";
             return hour + ":" + new Date().getMinutes() + meridiem;
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

         /*@description animate marker and update corresponding list item style.
          * Finally, update app current_selection states.
          * @param {google maps maker} marker
          * @param {ko.observable list} locations
          * @returns {google maps maker} marker*/

         // App Main
        util.createObvLocations_from_DB(DB, root);
        util.getWeather_from_URL(WEATHER_URL, root);
    };
    ko.applyBindings(new initKOApp());
}
