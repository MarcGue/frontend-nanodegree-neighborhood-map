(function () {

    var AppViewModel = function () {

        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 52.4271833,
                lng: 13.4518913
            },
            zoom: 15,
            mapTypeControl: false,
            panControl: false,
            fullscreenControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            streetViewControl: false
        });

        // this.placesService = new google.maps.places.PlacesService(map);
        this.geocoder = new google.maps.Geocoder();


        this.isSearchControl = ko.observable(true);
        this.searchValue = ko.observable();

        this.showSearchControl = function () {
            this.isSearchControl(!this.isSearchControl());
        };

        this.search = function (formElement) {
            this.geocoder.geocode( { 'address': 'Kirschner Weg 13, Berlin'}, function(results, status) {
                console.log(results);
            });
        };
    };

    ko.applyBindings(new AppViewModel());
})();