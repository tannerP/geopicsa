/*Initialize map with markers and markers' animation.
* Requires global variable DB*/

var map = {};

//callback function for Google Maps Ajax request
function initMap() {
    var self = this;

    var setAnimation = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        return marker;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 47.6062, lng: -122.3321},
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{color: '#263c3f'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6b9a76'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#38414e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{color: '#212a37'}]
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
                stylers: [{color: '#1f2835'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{color: '#f3d19c'}]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{color: '#2f3948'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{color: '#17263c'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#515c6d'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#17263c'}]
            }
        ]
    });
    // Google Maps
    // Maker image url
    var image = 'https://cdn3.iconfinder.com/data/icons/balls-icons/512/basketball-24.png';
    //populate markers based on gobal variable DB
    var markers = DB.map(function(location, i) {
        // create a marker
        var marker =  new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            label: location.park_name,
            animation: google.maps.Animation.DROP,
                icon: image
        });
        // set up animation (BOUNCE)
        marker.addListener('click', function(){
            // if (marker.getAnimation() !== null) {
            //     marker.setAnimation(null);
            // } else {
            //     marker.setAnimation(google.maps.Animation.BOUNCE);
            // }
            marker = setAnimation(marker);
        });
        return marker;
    });
    // finally rendering markers on map
    markers.map(function(marker){
        marker.setMap(map);
    });
    // Knockout callback function
    function initApp() {
        var root = this;
        root.obsv_list = ko.observableArray();

        // initializing obsv array with one obsv variable
        for(var i in DB) {
            var marker = DB[i];
            var obsv_isCrossed = ko.observable(marker.filtered);
            root.obsv_list.push({'park_name': marker.park_name, 'isCrossed': obsv_isCrossed});
        }
        // function removes marker from Google Map
        root.removePlace  = function(place) {
            for (i = 0; i < markers.length; i++ ) {
                marker = markers[i];
                if (marker.label === place.park_name){
                    marker = setAnimation(marker); //need to reference original markers
                    place.isCrossed(!place.isCrossed());
                }
            }
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
    // Bind knockout to page
    ko.applyBindings(new initApp());
}
