// Callback function for Google Maps Ajax request
// And Knockout binding.
/*@description callback function for google maps async call in index.html
 * */
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
                    console.log(response.current_observation);
                    console.log(root.weatherIcon_img());
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
                '<h1 id="firstHeading" class="firstHeading">'+ marker.label + ' </h1>'+
                '<div id="bodyContent">'+
                '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                'sandstone rock formation in the southern part of the '+
                'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                'south west of the nearest large town, Alice Springs; 450&#160;km '+
                '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                'features of the Uluru - Kata Tjuta National Park. Uluru is '+
                'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
                'Aboriginal people of the area. It has many springs, waterholes, '+
                'rock caves and ancient paintings. Uluru is listed as a World '+
                'Heritage Site.</p>'+
                '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                '(last visited June 22, 2009).</p>'+
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

            current_selection.marker = marker;
            current_selection.location.isCrossed(true);
            current_selection.infowindow = infowindow;
            infowindow.open(map,marker);
            current_selection.marker.setAnimation(google.maps.Animation.BOUNCE);
            return current_selection.marker;
        };
        /*@description function listens to click event from locations list items.
         *@param {location object} location
         *@returns.
         * */
        root.toggleListItem  = function(location) {
            for (var i = 0; i < markers.length; i++) {
               var m = markers[i];
               if ( m.label=== location.park_name ) {
                   _setAnimation(m, root.locations);
               }
            }
        };
    }
    ko.applyBindings(new initKOApp());
}
