function initMap() {
  const center = { lat: 28.37559030017273, lng: -81.57095611833917};
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: center,
  });

//   new google.maps.Marker({
//     position: myLatLng,
//     map,
//     title: "Hello World!",
//   });

  d3.csv("location_data_disney.csv", function (data) {
    data.forEach(function (d) {
      new google.maps.Marker({
        position: { lat: +d.LAT, lng: +d.LONG },
        map,
        title: d.PARK+d.RIDE,
      });
    });
  });
}

window.initMap = initMap;