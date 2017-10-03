/*Initialize map with markers and markers' animation.
* Requires global variable DB*/

var map = {};

// Callback function for Google Maps Ajax request
// And Knockout binding.
function initMap() {
    var self = this;
    var weather;
    var current_park;
    var current_marker;

    //Google Maps animation
    var setAnimation = function(marker) {
        if ( current_marker === marker) {
            return marker;
        }
        else if (!marker) {
            return marker;
        }
        else if (!current_marker) {
            current_marker = marker;
        }
        else{
            current_marker.setAnimation(null);
            current_marker = marker;
        }
        /*  var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
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
        });*/
        // current_marker = marker;
        return current_marker.setAnimation(google.maps.Animation.BOUNCE);
   };

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

    // Google Maps
    // Maker image url
    //populate markers based on gobal variable DB
    var marker_img_url = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';
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
        // marker.addListener('click', function(){
        //     marker = setAnimation(marker);
        // });
        return marker;
    });
    //rendering markers on map
    markers.map(function(marker){
        marker.setMap(map);
    });
    // Knockout
    function initApp() {
        buildFilterList(DB);
        var root = this;
        root.obsv_list = ko.observableArray();
        root.weather = ko.observable();
        root.weatherIcon_url = ko.observable({});
        root.pointofInterest = ko.observable({});

        //get Seattle weather conditons
        var weather_url = "http://api.wunderground.com/api/a4e4d43e9da41acf/conditions/q/WA/Seattle.json";
        $.getJSON(weather_url, function (response) {
                try {
                    console.log(response.current_observation)
                    root.weatherIcon_url(response.current_observation.icon_url);
                    root.weather(response.current_observation.feelslike_f);
                    console.log(root.weatherIcon_url());
                }
                catch(err) {
                    console.log(err);
                }
            });

        // initializing obsv array with one obsv variable
        for (var i in DB) {
            var marker = DB[i];
            var city = ko.observable();
            var obsv_isCrossed = ko.observable(marker.filtered);
            root.obsv_list.push({'park_name': marker.park_name, 'isCrossed': obsv_isCrossed, 'city':city});
        }
        // function removes marker from Google Map
        root.toggleListItem  = function(location) {
            if(current_park){
                current_park.isCrossed(!current_park.isCrossed());
            }
            current_park = location;
            //stop point of interest animation
            for (i = 0; i < markers.length; i++ ) {
                marker = markers[i];
                // find marker, then change list style and animate.
                // console.log("label" +  location.park_name);
                // console.log(marker.label);
                if (marker.label === location.park_name){
                    marker = setAnimation(marker); //need to reference original markers
                    location.isCrossed(!location.isCrossed()); break;
                }
                else{
                      location.isCrossed(false);
                }
                // stop last marker's animation, and style.
            }
            // console.log(  location.isCrossed());
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
    ko.applyBindings(new initApp());
}
