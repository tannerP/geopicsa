var map = {};=
/*Initialize map with markers and markers' animation.
* Requires global variable DB*/

function initAap() {
    var self = this;
    var IG_token = "e7fc2385c98c4904bf6131ddf7961314";
    ko.applyBindings(new viewModel(), document.getElementById('map'));
    console.log(google);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 47.6062, lng: -122.3321}
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
        console.log(location.lat)
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
    // function toggleBounce(marker) {
    //     if (marker.getAnimation() !== null) {
    //         marker.setAnimation(null);
    //     } else {
    //         marker.setAnimation(google.maps.Animation.BOUNCE);
    //     }
    // }
}
