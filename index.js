
const center = { lat: 28.39109030017273, lng: -81.58097911833917};
var all_markers = [];
var selected_parks = [];
var map = null;
var infoWindow = null;

function filterMarkers() {

  console.log("Filtering markers");

  //get selected parks using jquery
  $('input[type=checkbox]:checked').each(function() {
    selected_parks.push($(this).attr('value'));
  });

  //Hide all markers
  for (let i = 0; i < all_markers.length; i++) {
    all_markers[i].setMap(null);
  }

  all_markers = [];
  
  drawMarkers();
}

function drawMarkers(map, infoWindow) { 
  d3.csv("location_data_disney.csv", function (data) {
    data.forEach(function (d) {

      // if (selected_parks.length > 0) {
        // console.log("Selected "+selected_parks);
        // console.log("curr park "+d.PARK);
        console.log((selected_parks.includes(d.PARK)));
        if (selected_parks.includes(d.PARK)) {

          const marker = new google.maps.Marker({
            className: "marker_"+d.PARK,
            position: { lat: +d.LAT, lng: +d.LONG },
            map,
            title: d.PARK+ ": " + d.RIDE,
          });
    
          all_markers.push(marker);
    
          marker.addListener("click", function() {
            const park = marker.getTitle().split(":")[0];
            const ride = marker.getTitle().split(":")[1];
            const content = `<div>
              <h3>${park}: ${ride}</h3>
    
            </div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });
        }
      // }
      

    });
  });
}

function initMap() {
  
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: center,
  });
  infoWindow = new google.maps.InfoWindow();

  drawMarkers(map, infoWindow);

  //Set onclick event for checkboxes using jQuery
  $('input[type=checkbox]').click(function() {
    filterMarkers();
  });
}

window.initMap = initMap;














