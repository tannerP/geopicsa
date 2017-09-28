var map = {};
/*Initialize map with markers and markers' animation.
* Requires global variable DB*/

function initMap() {
    var self = this;
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
    /*
        var jefferson = {lat:47.5671477, lng:-122.30768710000001};
        var benefits = {lat: DB[1].lat, lng: DB[1].lng};
        var marker = new google.maps.Marker({
            position: jefferson,
            map: map,
            title: "Jefferson Commmunity Center"
        });

        var marker = new google.maps.Marker({
            position: benefits,
            map: map,
            title: DB[0].park_name
        });*/
    var image = 'http://icons.iconarchive.com/icons/capital18/capital-suite/48/Misc-Basketball-icon.png';

    var markers = DB.map(function(location, i) {
        // console.log(location.lat)
        var marker =  new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            label: location.park_name,
            animation: google.maps.Animation.DROP,
                icon: image
        });

        marker.addListener('click', function(){
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        });
        return marker;
    });
    markers.map(function(marker){
        marker.setMap(map);
    });
}

function initApp() {
    console.log("Initiating App")
    console.log(DB)

    this.parks = ko.observable(DB);
}

ko.applyBindings(new initApp());
