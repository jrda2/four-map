

// Model that is created using KnockoutJS which process
// the view of the Neighborhood Map
function RestaurantViewModel() {
    "use strict";
    var self = this;
    self.restaurants = ko.observableArray();
    self.list_rest = ko.observableArray();
    self.rest_markers = ko.observableArray();

    self.postalCodes = [
        { 
            title: "94102"
        },
        { 
            title: "94103"
        },
        { 
            title: "94109"
        },
        { 
            title: "94110"
        }
    ];

    //Pulls in Foursquare's API using Jquery and process
    //the data and add its to the map
    self.getContent = function() {
           $.ajax({
                url: "https://api.foursquare.com/v2/venues/search?ll=37.784469,-122.407986&query=sushi&client_id=G5TOZ3XNP4JW4UBDSZB0JZ54RLFGYPLGLHON22FTT5QUI0GR&client_secret=C1HH2ESSFEZ5XPGZDR5TRN1V3ABO0P1G53NDXK3C33GPCS3R&v=20170524",

                jsonp: "callback",

                dataType: "jsonp",

                data: {
                 q: "select id,name,location.lat,location.lng, location.postalCode from response.venue",
                 format: "json"
                },
           success: function (response) {
            for (var i = 0, length = response.response.venues.length; i < length; i++) {
                self.processData(response.response.venues[i]);
              }
                self.addMapData(self.restaurants());
            },
            error: function () {
                alert("Foursquare API currently not connected, please ensure your Jquery is v2 or higher");
            }
        });
    };
    //stylizes the data for the infoWindow using to provide info on the marker
    self.createInfo = function(restaurant) {
        var string = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">' + restaurant.title + '</h1>'+
                '<div id="bodyContent">'+
                 '<p><b>Phone</b>: ' + restaurant.phone + '</br>' +
                 '<p><b>Check Ins</b>: ' + restaurant.stats.checkins + '</br>' +
                 '<p><b>Tips</b>: ' + restaurant.stats.tips + '</br>' +
                 '<p><b>Foursquare Interactions</b>: ' + restaurant.stats.users + '</br>' +
                '</div>'+
                '</div>';
        return string;
    };

    //creates a restaurant object using JSON data 
    //and pushes to the restaurant array
    self.processData = function(data_obj) {
        var rest_obj = {
            title: data_obj.name,
            phone: data_obj.contact.phone,
            lat: data_obj.location.lat,
            lng: data_obj.location.lng,
            postal: data_obj.location.postalCode,
            stats: {
                checkins: data_obj.stats.checkinsCount,
                tips: data_obj.stats.tipCount,
                users: data_obj.stats.usersCount
            }
        };
        self.restaurants().push(rest_obj);
    };


    //using Google Maps API creates a marker for each restaurant
    //add it to the mapp, and pushes each marker into a marker array
    self.addMapData = function(restaurants) {
        var contentString;
        var latLng;
        var marker;
        var infoWindow;

        for (var i = 0, length = restaurants.length; i < length; i++) {
            contentString = self.createInfo(restaurants[i]);

            latLng = {lat: restaurants[i].lat, lng: restaurants[i].lng};
            marker = new google.maps.Marker({
                          position: latLng,
                          map: self.map,
                          animation: google.maps.Animation.DROP,
                          title: restaurants[i].title,
                          postal: restaurants[i].postal,
                          setVis: ko.observable(true)
                          });

            self.setTimeout(marker, 700);            
            self.rest_markers.push(marker);
            infoWindow = new google.maps.InfoWindow({
                content: contentString
            });
            self.bindInfoWindow(marker, self.map, infoWindow, contentString);
            self.list_rest.push(restaurants[i]);
        }
    };

    //creates the bounce animation for each marker
    self.setTimeout = function(marker, timeout) {
        marker.addListener('click', function(){
            marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout (function(){
                marker.setAnimation(null);
            }, timeout);
        });
    };

    //binds the marker to the list array and actived by Knockout
    self.bindMarker = function (marker) {
        google.maps.event.trigger(marker, 'click');
        };    

    //creates an infoWindow and binds it to the marker
    self.bindInfoWindow = function(marker, map, infowindow, contentString){
        marker.addListener('click', function() {
            infowindow.setContent(contentString);
            infowindow.open(map, this);
        });
    };

    //once the user selects the a zip from the dropdown - this function
    //clears any existing filters, then checks each marker that has 
    //the selected zipcode
    self.postalDrop = function (postal) {
        self.clearPostalDrop();
        for (var i = 0, length = self.rest_markers().length; i < length; i++) {
            if (self.rest_markers()[i].postal != postal.title) {
                //hides the marker on the map (map)
                self.rest_markers()[i].setVisible(false);
                //hides marker from the list (KO observable)
                self.rest_markers()[i].setVis(false);

            }
        }
    };

    //clears all the existing searches and filters
    self.clearPostalDrop = function() {
        for (var i = 0, length = self.rest_markers().length; i < length; i++) {
            self.rest_markers()[i].setVisible(true);
            self.rest_markers()[i].setVis(true);
        }
    };

    //creates the map
    self.initMap = function(){
            self.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.784469, lng: -122.407986},
            zoom: 13
          });
            self.getContent();
    };

}

var myRestModel = new RestaurantViewModel();
ko.applyBindings(myRestModel);


function initMap() {
    myRestModel.initMap();
}

function gError() {
    windows.alert("Map is currently not available");
}
