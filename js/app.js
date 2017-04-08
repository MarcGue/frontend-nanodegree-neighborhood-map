(function () {

    var AppViewModel = function () {
        // store this to the variable self
        var self = this;
        // indicate wether to show the searchbar or not
        self.isSearchControl = ko.observable(true);
        // store the given search value
        self.searchValue = ko.observable();

        self.currentLocation = ko.observable({
            lat: ko.observable(52.52000659999999),
            lng: ko.observable(13.404953999999975)
        });

        self.cheerMap = ko.observable(self.currentLocation());

        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            }
        }

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: self.cheerMap().googleMap,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                self.cheerMap().infowindow.setContent(place.name);
                self.cheerMap().infowindow.open(self.cheerMap().googleMap, this);
            });
        }

        this.showSearchControl = function () {
            this.isSearchControl(!this.isSearchControl());
        };

        this.search = function (formElement) {
            self.cheerMap().geocoder.geocode({
                'address': this.searchValue()
            }, function (results, status) {
                self.currentLocation(results[0].geometry.location);
                self.cheerMap().googleMap.setCenter(self.currentLocation());
                self.cheerMap().placesService.textSearch({
                    location: self.cheerMap().googleMap.center,
                    radius: 500,
                    query: 'Cheerleading'
                }, callback);
            });
        };
    };

    ko.bindingHandlers.map = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var map = ko.utils.unwrapObservable(valueAccessor());
            var latlng = new google.maps.LatLng(
                ko.utils.unwrapObservable(map.lat),
                ko.utils.unwrapObservable(map.lng));
            var options = {
                center: latlng,
                zoom: 10,
                mapTypeControl: false,
                panControl: false,
                fullscreenControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                },
                streetViewControl: false
            };
            map.googleMap = new google.maps.Map(element, options);
            map.geocoder = new google.maps.Geocoder();
            map.infowindow = new google.maps.InfoWindow();
            map.placesService = new google.maps.places.PlacesService(map.googleMap);
        },
    };

    ko.applyBindings(new AppViewModel());
})();