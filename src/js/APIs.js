/**
 * Created by tanner on 9/30/17.
 */

var client_key = "4NKI5G3XVHY5WMGSRZ52IZLVA4M5XNSCUGVXNGFPIECBZS53";
var client_secret = "KFSCERJN5Z1H4K1DCV4XDTXSQ0OAVU0AMGG5QHVYHMT5YVWW";
var ll =  { lat: 47.5190676, lng: -122.28414129999999};

function yelpGetCity(ll, callback){
    console.log("LL " + ll);

    /*Yelp returns a list of 30 venue. Each venue as *name *id (Yeld id)*/

    var yelp_url = "https://api.foursquare.com/v2/venues/"+
        "search?ll=" + ll.lat + "," + ll.lng +"&client_id=" +
        client_key + "&client_secret=" + client_secret + "&v=20170930";

    // console.log(yelp_url);
    $.ajax(yelp_url)
        .done(function(data){
            //TODO: error checking
            callback(data.response.venues[0].location.city);
    });
}

var google_places_key = "AIzaSyDvnhM1-nNTLyps5q9zcJ_6yyfykPvHJaI";

var cities = {};
DB.forEach(function(location){
    // console.log(location);
    yelpGetCity({'lat':location.lat, 'lng':location.lng}, function(data){
        console.log(data);
        cities[data] += 1;
        if( !cities[data] ){ cities[data] = 1; }
    });
    // cities[location] += 1;
});
