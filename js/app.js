var AppViewModel = function() {
    
    this.isSearchControl = ko.observable(true);
    this.searchValue = ko.observable();
    
    
    this.showSearchControl = function() {
        this.isSearchControl(!this.isSearchControl());
    };

    this.search = function(formElement) {
        var searchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.searchValue() + '&key=AIzaSyAM-2JC_5a5CDvXU_mWH5exAUO9HC1mbhg';

        $.ajax({
            url: searchUrl,
            dataType: 'jsonp',
            success: function(data) {
                console.log(data);
            }
        });
    };
};

ko.applyBindings(new AppViewModel());