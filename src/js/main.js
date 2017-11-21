/**
 * Created by tanner on 9/25/17.
 */
function initApp() {
    // Knockout App
    function initKOApp() {
        var WEATHER_URL = "http://api.wunderground.com/api/a4e4d43e9da41acf/conditions/q/WA/Seattle.json",
            MARKER_IMG_URL = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png',
            current_selection = {
                location: "",
                marker: null,
                infowindow: null
            };
        var root = this;
            root.locations = ko.observableArray();
            root.weather = ko.observable();
            root.weatherIcon_img= ko.observable({});

        // initialize variables
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
        var markers = DB.map(function(location, i) {
            // create a marker
            var marker =  new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                animation: google.maps.Animation.DROP,
                icon: MARKER_IMG_URL,
                label: location.park_name
            });

            marker.addListener('click', function(){
                marker = _setAnimation(marker, root.locations);
            });
            return marker;
        });
        markers.map(function(marker){
            marker.setMap(map);
        });
        // populate locations observable array
        for(var i in DB) {
            var marker = DB[i];
            var city = ko.observable();
            var obsv_isCrossed = ko.observable(marker.filtered);
            root.locations.push({
                'park_name': marker.park_name,
                'isCrossed': obsv_isCrossed,
                'city': city
            });
        }
        // get area weather information
        $.getJSON(WEATHER_URL, function (response) {
                try {
                    root.weatherIcon_img(response.current_observation.icon_url);
                    root.weather(response.current_observation.feelslike_f);
                    // console.log(response.current_observation);
                    // console.log(root.weatherIcon_img());
                }
                catch(err) {
                    console.log(err);
                }
            });

        // K.O. UI FUNCTIONS
        /*@description animate marker and update corresponding list item style.
         * Finally, update app current_selection states.
         * @param {google maps maker} marker
         * @param {ko.observable list} locations
         * @returns {google maps maker} marker*/
        var _setAnimation = function(marker, locations) {
            var contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h2 id="firstHeading" class="firstHeading">'+ marker.label + ' </h2>'+
                '<div id="bodyContent">'+
                // '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                // 'sandstone rock formation in the southern part of the '+
                // 'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                // 'south west of the nearest large town, Alice Springs; 450&#160;km '+
                // '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                // 'features of the Uluru - Kata Tjuta National Park. Uluru is '+
                // 'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
                // 'Aboriginal people of the area. It has many springs, waterholes, '+
                // 'rock caves and ancient paintings. Uluru is listed as a World '+
                // 'Heritage Site.</p>'+
                // '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                // 'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                // '(last visited June 22, 2009).</p>'+
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
            for (i = 0; i < locations().length; i++) {
                var loc = locations()[i];
                if ( loc && loc.park_name === marker.label) {
                    current_selection.location = loc;
                }
            }

            console.log(marker.position.lat());
            console.log(marker.position.lng());
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
        };
        /*@description function listens to click event from locations list items.
         *@param {location object} location
         *@returns.
         * */
        root.onToggleListItem  = function(location) {
            for (var i = 0; i < markers.length; i++) {
               var m = markers[i];
               if ( m.label=== location.park_name ) {
                   _setAnimation(m, root.locations);
               }
            }
        };
    }
    ko.applyBindings(new initKOApp());
//         root.locations = ko.observableArray();
//         root.weather = ko.observable();
//         root.weatherIcon_img = ko.observable({});
//
//
//         map = new google.maps.Map(document.getElementById('map'), {
//             zoom: 12,
//             center: {lat: 47.6062, lng: -122.3321},
//             styles: [
//                 {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
//                 {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
//                 {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
//                 {
//                     featureType: 'administrative.locality',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#d59563'}]
//                 },
//                 {
//                     featureType: 'poi',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#d59563'}]
//                 },
//                 {
//                     featureType: 'poi.park',
//                     elementType: 'geometry',
//                     stylers: [{color: '#263c3f'}]
//                 },
//                 {
//                     featureType: 'poi.park',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#6b9a76'}]
//                 },
//                 {
//                     featureType: 'road',
//                     elementType: 'geometry',
//                     stylers: [{color: '#38414e'}]
//                 },
//                 {
//                     featureType: 'road',
//                     elementType: 'geometry.stroke',
//                     stylers: [{color: '#212a37'}]
//                 },
//                 {
//                     featureType: 'road',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#9ca5b3'}]
//                 },
//                 {
//                     featureType: 'road.highway',
//                     elementType: 'geometry',
//                     stylers: [{color: '#746855'}]
//                 },
//                 {
//                     featureType: 'road.highway',
//                     elementType: 'geometry.stroke',
//                     stylers: [{color: '#1f2835'}]
//                 },
//                 {
//                     featureType: 'road.highway',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#f3d19c'}]
//                 },
//                 {
//                     featureType: 'transit',
//                     elementType: 'geometry',
//                     stylers: [{color: '#2f3948'}]
//                 },
//                 {
//                     featureType: 'transit.station',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#d59563'}]
//                 },
//                 {
//                     featureType: 'water',
//                     elementType: 'geometry',
//                     stylers: [{color: '#17263c'}]
//                 },
//                 {
//                     featureType: 'water',
//                     elementType: 'labels.text.fill',
//                     stylers: [{color: '#515c6d'}]
//                 },
//                 {
//                     featureType: 'water',
//                     elementType: 'labels.text.stroke',
//                     stylers: [{color: '#17263c'}]
//                 }
//             ]
//         });
//         // Google Maps
//         // Maker image url
//         var image = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';
//         //populate markers based on gobal variable DB
//         var markers = DB.map(function (location, i) {
//             // create a marker
//             var marker = new google.maps.Marker({
//                 position: {lat: location.lat, lng: location.lng},
//                 label: location.park_name,
//                 animation: google.maps.Animation.DROP,
//                 icon: image
//             });
//             // set up animation (BOUNCE)
//             marker.addListener('click', function () {
//                 // if (marker.getAnimation() !== null) {
//                 //     marker.setAnimation(null);
//                 // } else {
//                 //     marker.setAnimation(google.maps.Animation.BOUNCE);
//                 // }
//                 marker = setAnimation(marker);
//             });
//             return marker;
//         });
//         // finally rendering markers on map
//         markers.map(function (marker) {
//             marker.setMap(map);
//         });
//         // Knockout callback function
//         function initApp() {
//             var root = this;
//             root.obsv_list = ko.observableArray();
//
//             // populate locations observable array
//             var GOOGLE_KEY = "AIzaSyAWw0ISthOa75ehEbTDOZgoflWn4KwP65U";
//             for (var i in DB) {
//                 var loc = DB[i];
//                 var strURL = "https://maps.googleapis.com/maps/api/streetview?location=" +
//                     loc.lat + "," + loc.lng + "&size=456x456&key=" + GOOGLE_KEY;
//                 // console.log(strURL)
//                 var city = ko.observable();
//                 var obsv_isCrossed = ko.observable(loc.filtered);
//                 root.locations.push({
//                     'lat': loc.lat,
//                     'lng': loc.lng,
//                     'park_name': loc.park_name,
//                     'isCrossed': obsv_isCrossed,
//                     'city': city,
//                     "strview_url": strURL
//                 });
//             }
//
//             // function removes marker from Google Map
//             root.removePlace = function (place) {
//                 for (i = 0; i < markers.length; i++) {
//                     marker = markers[i];
//                     if (marker.label === place.park_name) {
//                         marker = setAnimation(marker); //need to reference original markers
//                         place.isCrossed(!place.isCrossed());
//                     }
//                 }
//                 return "";
//             };
//         }
//
//         // Bind knockout to page
//         ko.applyBindings(new initApp());
//     }
// >>>>>>>`` Stashed changes
}
