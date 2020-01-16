

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
                url: "https://api.yelp.com/v3/businesses/search?term=sushi&latitude=37.784469&longitude=-122.407986&limit=25",
                jsonp: "callback",
                dataType: "json",
                headers: {
                    "accept": "application/json",
                    "x-requested-with": "xmlhttprequest",
                    "Access-Control-Allow-Origin":"*",
                    "Authorization": "Bearer VbGMe3v39_lXqqxal6_6MANpj-L4NSyHTYkWGZWEbXk5UDJ64DkDhd8KK93rqXy0y2RYq8bgCwpHzHtlbWe0SWVJ4I3-C7otsoq5AMOWlj62HjYbWau1SO4sSIQZXnYx"
                },
                
                data: {
                 q: "select id,name,coordinates.latitude,coordinates.longitude,location.zip_code,price,rating,review_count,display_phone from response.businesses",
                 format: "json"
                },
           success: function (response) {
               console.log(response);
            for (var i = 0, length = response.businesses.length; i < length; i++) {
                self.processData(response.busisness[i]);
              }
                self.addMapData(self.restaurants());
            },
            error: function () {
                console.log(data);
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
                 '<p><b>Price</b>: ' + restaurant.price + '</br>' +
                 '<p><b>Rating</b>: ' + restaurant.rating + '</br>' +
                 '<p><b>Review Count</b>: ' + restaurant.review_count + '</br>' +
                 '<p><b>Phone Number</b>: ' + restaurant.display_phone + '</br>' +
                '</div>'+
                '</div>';
        return string;
    };

    //creates a restaurant object using JSON data 
    //and pushes to the restaurant array
    self.processData = function(data_obj) {
        var rest_obj = {
            title: data_obj.name,
            phone: data_obj.display_phone,
            lat: data_obj.coordinates.latitude,
            lng: data_obj.coordinates.longitude,
            postal: data_obj.location.zip_code,
            stats: {
                price: data_obj.price,
                rating: data_obj.rating,
                tips: data_obj.review_count,
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
    window.alert("Map is currently not available");
}
