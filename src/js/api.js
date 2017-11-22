99/**
 * Created by tanner on 9/30/17.
 */

var client_key = "4NKI5G3XVHY5WMGSRZ52IZLVA4M5XNSCUGVXNGFPIECBZS53";
var client_secret = "KFSCERJN5Z1H4K1DCV4XDTXSQ0OAVU0AMGG5QHVYHMT5YVWW";
var ll =  { lat: 47.5190676, lng: -122.28414129999999};

function getFourSquareCityData(ll, callback){
    console.log("LL " + ll);

    /*Yelp returns a list of 30 venue. Each venue as a *name *id (Yeld id)*/
    var yelp_url = "https://api.foursquare.com/v2/venues/"+
        "search?ll=" + ll.lat + "," + ll.lng +"&client_id=" +
        client_key + "&client_secret=" + client_secret + "&v=20170930";

    $.ajax(yelp_url)
        .done(function(data){
            //TODO: error checking
            callback(data.response.venues[0]);
    });
}

var google_places_key = "AIzaSyDvnhM1-nNTLyps5q9zcJ_6yyfykPvHJaI";
// var filter_list = [];
// var yelp_data = ko.observableArray();
var yelp_data = ['liberty', 'jefferson', 'benefits', 'greenlake', 'delridge' ];
function buildFilterList(DB) {  // do nothing for now.
    // database = DB;
    // database.forEach(function(location){
    //     // console.log(location);
    //     getFourSquareCityData({'lat':location.lat, 'lng':location.lng},function(city_data){
    //         // var city_name = city_data.name;
    //         yelp_data.push(city_data);
    //     });
    // });
}
