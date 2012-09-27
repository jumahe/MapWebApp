var map;
var maxDist = 10000; // max 10Km
var blueIconSrc = "http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png";
var directionsDisplay;
var directionsService;

// -- INIT
function initialize()
{
    var myOptions = 
    {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    // -- create map
    map = new google.maps.Map(document.getElementById('map'), myOptions);
    
    // -- create direction display & service
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer( { markerOptions:{ visible:false } } );
    directionsDisplay.setMap(map);

    // -- Try HTML5 geolocation
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition( function(position)
        {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
            var mImg = new google.maps.MarkerImage(blueIconSrc);
            var usrMarker = new google.maps.Marker(
            {
                map:map,
                icon:mImg,
                position:pos
            });
            
            searchNearest(pos);
        }, 
        function()
        {
            // -- Geolocation Fail
            handleNoGeolocation(true);
        });
    } 
    else 
    {
        // -- Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
}

// -- search nearest
function searchNearest( currentPos )
{
    var len = datas.poi.length;
    var i;
    
    var nearestPos = currentPos;
    var shortestDist = this.maxDist;
    var dataObj = { "name":"You are", "address":"HERE" };
    var farEnough = false;
    
    var testPos;
    var dist;
    
    for(i = 0; i < len; i++)
    {
        testPos = new google.maps.LatLng( parseFloat(datas.poi[i].lat), parseFloat(datas.poi[i].lon) );
        dist = google.maps.geometry.spherical.computeDistanceBetween( currentPos, testPos );
        
        if( dist < shortestDist )
        {
            nearestPos = testPos;
            shortestDist = dist;
            dataObj = datas.poi[i];
            
            farEnough = true;
        }
        
        var mark = new google.maps.Marker(
        {
            map:this.map,
            position:testPos,
            animation:google.maps.Animation.DROP
        });
    }
    
    var content = "Nearest Point:<br>";
    content += "<strong>" + dataObj.name + "</strong><br>" + dataObj.address;
    
    displayInfo(nearestPos, content);
    
    if( farEnough == true ) calcRoute( currentPos, nearestPos );
}

// -- display info
function displayInfo(pos, content)
{
    var options = {
        map: map,
        position: pos,
        content: content
    };
    
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

// -- no geoloc error
function handleNoGeolocation(errorFlag) 
{
    var content = "---";
    
    if (errorFlag) content = 'FAIL';
    else content = 'Browser Error';
    
    var pos = new google.maps.LatLng(0, 0);
    
    displayInfo(pos, content);
}

// -- calc route
function calcRoute(from, to)
{
    var request = 
    {
        origin:from, 
        destination:to,
        travelMode: google.maps.TravelMode.WALKING
    };
    
    directionsService.route(request, function(response, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            directionsDisplay.setDirections(response);
        }
    });
}

// -- load
google.maps.event.addDomListener(window, 'load', initialize);  