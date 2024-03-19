function initMap() {
  const center = { lat: 28.39109030017273, lng: -81.58097911833917};
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: center,
  });
  const infoWindow = new google.maps.InfoWindow();

  d3.csv("location_data_disney.csv", function (data) {
    data.forEach(function (d) {
      const marker = new google.maps.Marker({
        position: { lat: +d.LAT, lng: +d.LONG },
        map,
        title: d.PARK+ ": " + d.RIDE,
      });

      marker.addListener("click", function() {
        const park = marker.getTitle().split(":")[0];
        const ride = marker.getTitle().split(":")[1];
        const content = `<div>
          <h3>${park}: ${ride}</h3>

        </div>`;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
    });
  });
}




window.initMap = initMap;














