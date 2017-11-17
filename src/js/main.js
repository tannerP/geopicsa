/*Initialize map with markers and markers' animation.
* Requires global variable DB*/
var map = {};
// Callback function for Google Maps Ajax request
// And Knockout binding.
function initApp() {
    // Knockout
    function initKOApp() {
        var self = this;
        var weather;
        // Knockout observables
        var root = this;
        root.locations = ko.observableArray();
        root.weather = ko.observable();
        root.weatherIcon_url = ko.observable({});
        root.pointofInterest = ko.observable({});

        var current_location;
        var current_marker;
        var setAnimation = function(marker, locations) {
            if (current_marker) {
                if (marker === current_marker) { return; }
                current_marker.setAnimation(null);
            }
            
            if (current_location) {
                current_location.isCrossed(false);
            }


            // find corresponding marker on
            for (i = 0; i < locations().length; i++) {
                var loc = locations()[i];
                if ( loc.park_name === marker.label) {
                    // loc.isCrossed(!loc.isCrossed());
                    current_location = loc;
                }
            }

            current_marker = marker;
            current_location.isCrossed(true);
            current_marker .setAnimation(google.maps.Animation.BOUNCE);
            return marker;
        };
        // google maps animation
        map = new google.maps.Map(document.getElementById('map'), {
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
        // google maps marker icon url
        var marker_img_url = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';
        // initialize markers array
        var markers = DB.map(function(location, i) {
            // create a marker
            var marker =  new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                animation: google.maps.Animation.DROP,
                icon: marker_img_url,
                label: location.park_name
            });
            // set up animation (BOUNCE)
            // var marker = new google.maps.Marker({
            //     position: uluru,
            //     map: map,
            //     title: 'Uluru (Ayers Rock)'
            // });
            marker.addListener('click', function(){
                marker = setAnimation(marker, root.locations);
                // var event = document.createEvent("Event");
                // event.initEvent("clicker", true, true);
                // console.log(event);
            });
            return marker;
        });
        markers.map(function(marker){
            marker.setMap(map);
        });

        // weather api call
        var weather_url = "http://api.wunderground.com/api/a4e4d43e9da41acf/conditions/q/WA/Seattle.json";
        $.getJSON(weather_url, function (response) {
                try {
                    root.weatherIcon_url(response.current_observation.icon_url);
                    root.weather(response.current_observation.feelslike_f);
                    console.log(response.current_observation)
                    console.log(root.weatherIcon_url());
                }
                catch(err) {
                    console.log(err);
                }
            });

        // create locations array from api.DB
        try {
            for (var i in DB) {
                var marker = DB[i];
                var city = ko.observable();
                var obsv_isCrossed = ko.observable(marker.filtered);
                root.locations.push({'park_name': marker.park_name, 'isCrossed': obsv_isCrossed, 'city':city});
            }
        }catch(err) {
            console.log("Error main.js line 200:");
            console.log(err);
        }
        // function removes marker from Google Map
        root.toggleListItem  = function(location) {
            // if (current_location) {
            //     current_location.isCrossed(!current_location.isCrossed());
            // }
            // else {
            //     location.isCrossed(!location.isCrossed());
            // }
            // current_location = location;
            for (var i = 0; i < markers.length; i++) {
               var m = markers[i];
               if ( m.label=== location.park_name ) {
                   setAnimation(m, root.locations);
               }
            }
            // find marker in markers observable array
            // updateUI()
            // console.log(location.isCrossed());
        };
        /*root.lineThrough = ko.pureComputed(function() {
            var filter;
            console.log("is filtered: "+ filtered);
            var result;
            if (filtered =='true')   {
                return 'lineThrough';
            }
            return "";
        });*/
    }
    ko.applyBindings(new initKOApp());
}
