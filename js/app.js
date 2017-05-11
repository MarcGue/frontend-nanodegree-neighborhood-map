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
        this.marker = ko.observable();
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
            self.removeAllMarkers();
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(function (result) {
                    searchResult = new SearchResult();
                    searchResult.name = result.name;
                    searchResult.formatted_address = result.formatted_address;
                    
                    // TODO call another API to get additional information
                    $.get('https://www.googleapis.com/youtube/v3/search', {
                        part: 'snippet, id',
                        q: result.name,
                        type: 'video',
                        key: 'AIzaSyAM-2JC_5a5CDvXU_mWH5exAUO9HC1mbhg'
                    }, function(data) {
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

                    });

                    self.searchResults.push(searchResult);
                    self.markers.push(self.createMarker(result));
                });
            }
        };

        /**
         * TODO
         */
        self.createMarker = function (result) {
            var marker = new google.maps.Marker({
                map: self.cheerMap.map,
                position: result.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                self.cheerMap.infowindow.setContent(result.name);
                self.cheerMap.infowindow.open(self.cheerMap.map, this);
            });

            return marker;
        };

        self.createSearchResult = function (place) {
            return {
                name: place.name,
                description: place.formatted_address,
                html: function () {
                    return '<h3 class="result-title">' + this.name + '</h3><div class="result-content"><p>' + this.description + '</p></div>';
                }
            };
        };

        /**
         * TODO
         */
        self.removeAllMarkers = function () {
            return function () {
                // loop over every marker and set its map to null
                self.markers.forEach(function (marker) {
                    marker.setMap(null);
                });

                // remove all markers from the array
                self.markers.removeAll();
            };
        };



        self.filterResults = function () {
            console.log('filter');
        };

        // self.placesCallback = function (results, status) {
        //     self.searchResults.removeAll();
        //     clearMarkers();
        //     self.markers.removeAll();
        //     if (status === google.maps.places.PlacesServiceStatus.OK) {
        //         createSearchResult(results);
        //         self.searchResults().forEach(function (result) {
        //             self.markers.push(createMarker(result));
        //         });
        //     } else {
        //         results = [{
        //             name: 'Es wurden keine Ergebnisse gefunden',
        //             formatted_address: ''
        //         }];
        //         createSearchResult(results);
        //     }
        // };

        self.search();
    };

    ko.applyBindings(new AppViewModel());
})();