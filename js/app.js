'use strict';

var fsquareClientId = 'CNOWHNKFA2JKEKZ12FCHNC1WRP2WTM2JKTXAEIVXQ1X24SBJ';
var fsquareClientSecrect = '52DX2KBYRNGDGWJZ244TTCANOJVO3TRGIERMZ5KGE5OAEFP2';

var initialLocations = [
    {title: 'Gropius Passagen', location: {lat: 52.4295793, lng: 13.4546777}},
    {title: 'Potsdamer Platz Arkaden', location: {lat: 52.5078631, lng: 13.3738804}},
    {title: 'ALEXA', location: {lat: 52.519903, lng: 13.4147787}},
    {title: 'LP12 Mall of Berlin', location: {lat: 52.5104228, lng: 13.3810472}},
    {title: 'Kaufhaus des Westens', location: {lat: 52.5016021, lng: 13.340993}},
    {title: 'Spandau Arcaden', location: {lat: 52.5339545, lng: 13.1962588}},
    {title: 'Tempelhofer Hafen Berlin', location: {lat: 52.4555581, lng: 13.3858547}}
];


function Location(locationData, map, infowindow) {
    // Store this to self
    var self = this;
    // Store the map
    self.map = map;
    // Store the infowindow
    self.infowindow = infowindow;
    // Store the title from the locationData
    self.title = locationData.title;
    // Store the position from the location array
    self.position = locationData.location;
    // Store the url of the location
    self.url = '';
    // Store the street of the location
    self.street = '';
    // Store the zipcode of the location
    self.zipcode = '';
    // Build the url for making an ajax call to FourSquare
    var fsquareUrl = getFSquareUrl(self.title, self.position);
    // Make an ajax call to FourSquare about the location
    $.getJSON(fsquareUrl).done(function(data) {
        var firstResult = data.response.venues[0];
        self.url = firstResult.url;
        self.street = firstResult.location.formattedAddress[0];
        self.zipcode = firstResult.location.formattedAddress[1];
    }).fail(function() {
        alert('Error on calling FourSquare API');
    });
    // Create a marker with the title and position
    self.marker = new google.maps.Marker({
        title: self.title,
        position: self.position,
        animation: null
    });
    // Set the map to the marker
    self.marker.setMap(self.map);
    // Add click listener to the marker
    self.marker.addListener('click', function() {
        populateInfowindow(self);
        bounceMarker(self);
    });
}

function AppViewModel() {
    var self = this;

    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {lat: 52.520008, lng: 13.404954}
	});
    self.geocoder = new google.maps.Geocoder();
    self.infowindow = new google.maps.InfoWindow();
    self.placesService = new google.maps.places.PlacesService(self.map);

    self.filterValue = ko.observable('');

    self.locations = ko.observableArray();
    initialLocations.forEach(function(initialLocation) {
        self.locations.push(new Location(initialLocation, self.map, self.infowindow));
    });

    self.filteredLocations = ko.computed(function () {
        if (!self.filterValue()) {
            self.locations().forEach(function (loc) {
                loc.marker.setMap(self.map);
            });
            return self.locations();
        } else {
            var results = ko.utils.arrayFilter(self.locations(), function (locationItem) {
                return locationItem.title.toLowerCase().search(self.filterValue().toLowerCase()) > -1;
            });

            self.locations().forEach(function (loc) {
                loc.marker.setMap(null);
            });

            results.forEach(function (result) {
                result.marker.setMap(self.map);
            });

            return results;
        }
    });

    self.highlightMarker = function(location, event) {
        if (event !== undefined && 'click' === event.type) {
            google.maps.event.trigger(location.marker, 'click');
        }
    };
}

function getFSquareUrl(title, position) {
    var lat = position.lat;
    var lng = position.lng;
    return 'https://api.foursquare.com/v2/venues/search?ll='+ lat + ',' + lng + '&client_id=' + fsquareClientId + '&client_secret=' + fsquareClientSecrect + '&v=20170525&query=' + title;
}

function populateInfowindow(location) {
    if (location.infowindow.marker != location.marker) {
        // Clear the content of the infowindow
        location.infowindow.setContent('');
        // Set the new marker to the infowindow
        location.infowindow.marker = location.marker;
        // Add closeclick listener to the infowindow
        location.infowindow.addListener('closeclick', function() {
            location.infowindow.marker = null;
        });
        // Set the content to the infowindow
        location.infowindow.setContent('<h5>' + location.title + '</h5>' + 
        '<a href="' + location.url + '">' + location.url + '</a>' + 
        '<div>' + location.street + '</div>' +
        '<div>' + location.zipcode + '</div>');
        // Open the infowindow on the correct marker
        location.infowindow.open(location.map, location.marker);
    }
}

function bounceMarker(location) {
    if (location.marker.getAnimation() !== null) {
        location.marker.setAnimation(null);
    } else {
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            location.marker.setAnimation(null);
        }, 2500);
    }
}

function initMap() {
    ko.applyBindings(new AppViewModel());
}
