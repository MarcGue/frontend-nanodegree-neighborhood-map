(function () {

    var AppViewModel = function () {
        // store this to the variable self
        var self = this;
        // indicate whether to show the searchbar or not
        self.isSearchVisible = ko.observable(true);
        // indicate whether to show the resultbox or not
        self.isResultBoxVisible = ko.observable(true);
        // store the given search value
        self.searchValue = ko.observable('Berlin');

        self.searchResults = ko.observableArray();

        self.currentLocation = ko.observable({
            lat: ko.observable(52.52000659999999),
            lng: ko.observable(13.404953999999975)
        });

        self.cheerMap = ko.observable(self.currentLocation());

        self.markers = ko.observableArray();

        /**
         * Show or hide the search box 
         */
        self.showSearch = function () {
            self.isSearchVisible(!self.isSearchVisible());
        };

        /**
         * Show or hide the result box
         */
        self.showResultBox = function () {
            self.isResultBoxVisible(!self.isResultBoxVisible());
        };

        /**
         * Search will call the Google Maps APIs' Geocoder to search for the given searchValue.
         * The Geocoder will return an array of results as well as the status of this search.
         * We will save the location of the first item in the results array to set the new location
         * to our map. After this we take the location to call the Google Map Places API to query
         * for Cheerleading around that location. For every result we put a Marker on our map.
         */
        self.search = function () {
            self.cheerMap().geocoder.geocode({
                'address': this.searchValue()
            }, function (results, status) {
                self.currentLocation(results[0].geometry.location);
                self.cheerMap().googleMap.setCenter(self.currentLocation());
                self.cheerMap().placesService.textSearch({
                    location: self.cheerMap().googleMap.center,
                    radius: 5000,
                    query: 'Cheerleading in ' + self.searchValue()
                }, self.placesCallback);
            });
        };

        self.placesCallback = function (results, status) {
            self.searchResults.removeAll();
            clearMarkers();
            self.markers.removeAll();
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                createSearchResult(results);
                self.searchResults().forEach(function (result) {
                    self.markers.push(createMarker(result));
                });
            } else {
                results = [{
                    name: 'Es wurden keine Ergebnisse gefunden',
                    formatted_address: ''
                }];
                createSearchResult(results);
            }
        };

        function createMarker(place) {
            var marker = new google.maps.Marker({
                map: self.cheerMap().googleMap,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                self.cheerMap().infowindow.setContent(place.name);
                self.cheerMap().infowindow.open(self.cheerMap().googleMap, this);
            });

            return marker;
        }

        function clearMarkers() {
            self.markers().forEach(function (marker) {
                marker.setMap(null);
            });
        }

        function createSearchResult(results) {
            results.forEach(function (result) {
                self.searchResults.push(result);
            });
        }
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

    var appViewModel = new AppViewModel();
    ko.applyBindings(appViewModel);
    appViewModel.search();
})();