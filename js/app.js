(function () {

    var YouTubeVideo = function (videoId, title, thumb, desc) {
        this.videoId = videoId;
        this.title = title;
        this.thumb = thumb;
        this.desc = desc;
    };

    var SearchResult = function () {
        this.name = ko.observable();
        this.formatted_address = ko.observable();
        this.markerLocation = ko.observable();
        this.videos = ko.observableArray();
    };

    var CheerMap = function () {
        var self = this;
        self.options = {
            zoom: 10,
            mapTypeControl: false,
            panControl: false,
            fullscreenControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            },
            streetViewControl: false
        };
        self.map = new google.maps.Map(document.getElementById('map'), self.options);
        self.geocoder = new google.maps.Geocoder();
        self.infowindow = new google.maps.InfoWindow();
        self.placesService = new google.maps.places.PlacesService(self.map);
    };

    var AppViewModel = function () {
        var self = this;

        // initialize the CheerMap
        self.cheerMap = new CheerMap();

        // initialize the markers as an empty observableArray
        self.markers = ko.observableArray();

        // set isSearchVisible to true by default
        self.isSearchVisible = ko.observable(true);

        // set isResultBoxVisible to true by default
        self.isResultBoxVisible = ko.observable(true);

        // initialize searchValue with 'Berlin'
        self.searchValue = ko.observable('Berlin');

        // initialize filterValue
        self.filterValue = ko.observable();

        self.searchResults = ko.observableArray();

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
         * TODO
         */
        self.search = function () {
            self.searchResults.removeAll();
            self.removeAllMarkers();
            self.filterValue('');
            self.cheerMap.geocoder.geocode({
                address: self.searchValue()
            }, self.callBackGeoCoder);
        };

        /**
         * TODO
         */
        self.callBackGeoCoder = function (results, status) {
            self.cheerMap.map.setCenter(results[0].geometry.location);
            self.cheerMap.placesService.textSearch({
                location: self.cheerMap.map.center,
                radius: 5000,
                query: 'Cheerleading in ' + self.searchValue()
            }, self.callBackPlacesService);
        };

        /** 
         * TODO 
         */
        self.callBackPlacesService = function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(function (result) {
                    
                    // TODO call another API to get additional information
                    $.get('https://www.googleapis.com/youtube/v3/search', {
                        part: 'snippet, id',
                        q: result.name,
                        type: 'video',
                        key: 'AIzaSyAM-2JC_5a5CDvXU_mWH5exAUO9HC1mbhg'
                    }, function(data) {
                        searchResult = new SearchResult();
                        searchResult.name = result.name;
                        searchResult.formatted_address = result.formatted_address;
                        searchResult.markerLocation = result.geometry.location;

                        data.items.forEach(function(item, index) {
                            if (index > 2) {
                                return;
                            }

                            var videoId = 'http://www.youtube.com/embed/' + item.id.videoId;
                            var title = item.snippet.title;
                            var thumb = item.snippet.thumbnails.high.url;
                            var desc = item.snippet.description;
                            video = new YouTubeVideo(videoId, title, thumb, desc);

                            searchResult.videos.push(video);
                        });

                        self.searchResults.push(searchResult);
                        self.markers.push(self.createMarker(searchResult));
                    });
                });
            }
        };

        /**
         * TODO
         */
        self.createMarker = function (result) {
            var marker = new google.maps.Marker({
                map: self.cheerMap.map,
                position: result.markerLocation
            });

            google.maps.event.addListener(marker, 'click', function () {
                self.cheerMap.infowindow.setContent(createInfoWindowContent(result));
                self.cheerMap.infowindow.open(self.cheerMap.map, this);
            });

            return marker;
        };

        /**
         * TODO
         */
        self.removeAllMarkers = function () {
            // return function () {
                // loop over every marker and set its map to null
                self.markers().forEach(function (marker) {
                    marker.setMap(null);
                });

                // remove all markers from the array
                self.markers.removeAll();
            // };
        };

        self.createMarkers = function (results) {
            self.removeAllMarkers();
            results.forEach(function(result) {
                self.markers.push(self.createMarker(result));
            });
        };

        self.filteredResults = ko.computed(function () {
            if (!self.filterValue()) {
                self.createMarkers(self.searchResults());
                return self.searchResults();
            } else {
                var results = ko.utils.arrayFilter(self.searchResults(), function(result) {
                    return result.name.search(self.filterValue()) > -1;
                });

                self.createMarkers(results);
                return results;
            }
        });
    
        self.search();
    };

    createInfoWindowContent = function (searchResult) {
        return '<h6>' + searchResult.name + '</h6><small>' + searchResult.formatted_address + '</small>';
    };

    ko.applyBindings(new AppViewModel());
})();