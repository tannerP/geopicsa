var map = {};

function viewModel() {
    var dayOfWeek = ko.observable('Sunday');
}

function initMap() {
    var self = this;

    console.log('init map');
    ko.applyBindings(new viewModel(), document.getElementById('body'));
    console.log(google);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 37.370, lng: -122.002}
    });

}
