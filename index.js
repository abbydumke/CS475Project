
const center = { lat: 28.39109030017273, lng: -81.58097911833917};
var all_markers = [];
var selected_parks = [];
var map = null;
var infoWindow = null;

function filterMarkers() {

  console.log("Filtering markers");

  selected_parks = [];
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

function makeLinePlot(ride, month){
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 30},
  width = 600 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#boxplot_div")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Show the X scale
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["12 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"])
    .paddingInner(1)
    .paddingOuter(.5)
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))


  
  d3.csv("overallwait1.csv", function(data) {

    data = data.filter(function(d) {

      ride = ride.replace("'", "");
      ride = ride.trim();
      d.RIDE = d.RIDE.trim();
      return d.RIDE == ride;
    });

    console.log(data);
  
    data = data.filter(function(d) {
      return d.MONTH == month;
    });
    // Show the Y scale
    var ymax = d3.max(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
    var ymin = d3.min(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
    var y = d3.scaleLinear()
      .domain([ymin,ymax + 10])
      .range([height, 0])
      svg.append("g").call(d3.axisLeft(y))
    svg.selectAll("points")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d){return(x(d.TIME_OF_DAY))})
      .attr("cy", function(d){return(y(d.AVERAGE_WAIT_TIME_MIN))})
      .attr("r", 4)
      .style("fill", "white")
      .attr("stroke", "black")
      //add line that connects all points together
      svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.TIME_OF_DAY) })
        .y(function(d) { return y(d.AVERAGE_WAIT_TIME_MIN) })
      )
    });
}

function makeBoxPlot(ride){
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 600 - margin.left - margin.right,
      height = 525 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#boxplot_div")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
  // Read the data and compute summary statistics for each species
  d3.csv("boxplotdata.csv", function(data) {
    //get all data rows where D.RIDE == ride
    data = data.filter(function(d) {
      return d.RIDE == ride;
    });

    // Show the X scale.

    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(["12 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"])
      .paddingInner(1)
      .paddingOuter(.5)
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("font-size", "50px")
      .call(d3.axisBottom(x))

    // Show the Y scale
    //get the max of the max values
    var ymax = d3.max(data, function(d) { return d.max; });
    var ymin = d3.min(data, function(d) { return d.min; });
    var y = d3.scaleLinear()
    var domainValue = (ride !== 'SLINKY DOG DASH' && ride !== 'RISE OF RESISTANCE' && ride !== 'AVATAR FLIGHT PASSAGE') ? ymax : 125;
    domainValue = (ride == 'KILAMANJARO SAFARIS') ? 70 : domainValue;
    y.domain([0, domainValue]);

    // // Increase font size of y-axis
    // svg.selectAll("text").attr("font-size", "15px");


      //.domain([0, 125])
      y.range([height, 0])
      svg.append("g").call(d3.axisLeft(y))

    svg
      .selectAll("vertLines")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", function(d){return(x(d.TIME_OF_DAY))})
      .attr("x2", function(d){return(x(d.TIME_OF_DAY))})
      .attr("y1", function(d){return(y(d.min))})
      .attr("y2", function(d){return(y(d.max))})
      .attr("stroke", "black")
      .style("width", 60)

  
  // rectangle for the main box
  var boxWidth = 15
    svg
      .selectAll("boxes")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d){return(x(d.TIME_OF_DAY)-boxWidth/2)})
        .attr("y", function(d){return(y(d["75%"]))})
        // .attr("height", function(d){return (y(+d["75%"])-y(+d["25%"]))})
        .attr("height", function(d){return(y(d["25%"])-y(d["75%"]))})
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

  
  // Show the median
  svg
    .selectAll("medianLines")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", function(d){return(x(d.TIME_OF_DAY)-boxWidth/2) })
    .attr("x2", function(d){return(x(d.TIME_OF_DAY)+boxWidth/2) })
    .attr("y1", function(d){return(y(d["50%"]))})
    .attr("y2", function(d){return(y(d["50%"]))})
    .attr("stroke", "black")
    .style("width", 80)   
  });
}



function drawMarkers() { 
  d3.csv("location_data_disney.csv", function (data) {
    data.forEach(function (d) {

        if ((selected_parks.length == 0) || (selected_parks.includes(d.PARK))) {

          const marker = new google.maps.Marker({
            className: "marker_"+d.PARK,
            position: { lat: +d.LAT, lng: +d.LONG },
            map,
            title: d.PARK+ ": " + d.RIDE,
          });
          //if ridetype is rollercoaster, change marker color to blue
          if (d.RTYPE == "RC") {

            const svgMarker = {
              // path: "M496 128v16a8 8 0 0 1-8 8h-24v12c0 6.627-5.373 12-12 12H60c-6.627 0-12-5.373-12-12v-12H24a8 8 0 0 1-8-8v-16a8 8 0 0 1 4.941-7.392l232-88a7.996 7.996 0 0 1 6.118 0l232 88A8 8 0 0 1 496 128zm-24 304H40c-13.255 0-24 10.745-24 24v16a8 8 0 0 0 8 8h464a8 8 0 0 0 8-8v-16c0-13.255-10.745-24-24-24zM96 192v192H60c-6.627 0-12 5.373-12 12v20h416v-20c0-6.627-5.373-12-12-12h-36V192h-64v192h-64V192h-64v192h-64V192H96z",
              // path: "M5 8V17.0192M9 8V17M15 8V17M19 8V17.0192M5 17.0192C5.31428 17 5.70173 17 6.2 17H17.8C18.2983 17 18.6857 17 19 17.0192M5 17.0192C4.60779 17.0431 4.32953 17.097 4.09202 17.218C3.71569 17.4097 3.40973 17.7157 3.21799 18.092C3 18.5198 3 19.0799 3 20.2V21H21V20.2C21 19.0799 21 18.5198 20.782 18.092C20.5903 17.7157 20.2843 17.4097 19.908 17.218C19.6705 17.097 19.3922 17.0431 19 17.0192M3 5.5V8H21V5.5L12 3L3 5.5Z",
              path: "M16 6.28a1.23 1.23 0 0 0-.62-1.07l-6.74-4a1.27 1.27 0 0 0-1.28 0l-6.75 4a1.25 1.25 0 0 0 0 2.15l1.92 1.12v2.81a1.28 1.28 0 0 0 .62 1.09l4.25 2.45a1.28 1.28 0 0 0 1.24 0l4.25-2.45a1.28 1.28 0 0 0 .62-1.09V8.45l1.24-.73v2.72H16V6.28zm-3.73 5L8 13.74l-4.22-2.45V9.22l3.58 2.13a1.29 1.29 0 0 0 1.28 0l3.62-2.16zM8 10.27l-6.75-4L8 2.26l6.75 4z",
              // path: "M 0,0 A 5,5 0 1,1 0,-1 Z",
              fillColor: "green",
              fillOpacity: 0.7,
              strokeWeight: 1,
              rotation: 0,
              // scale: 0.1,
              scale: 2,
              anchor: new google.maps.Point(0, 20),
          };
          // marker.setIcon(svgMarker);
          marker.setIcon("roller-coaster.png");
          
            // marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
            // marker.setIcon("https://www.svgrepo.com/show/51816/roller-coaster.svg");
          
          // make the marker smaller
            // marker.setScaledSize(0.002, 0.002);
          }
          all_markers.push(marker);
           //if ridetype is boat, change marker color to blue
          if (d.RTYPE == "B") {
            marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
          }
          all_markers.push(marker);
          if (d.RTYPE == "MR") {
            marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
          }
          all_markers.push(marker);
          if (d.RTYPE == "O") {
            marker.setIcon("http://maps.google.com/mapfiles/ms/icons/pink-dot.png");
          }
          all_markers.push(marker);

    
          marker.addListener("click", function() {
            const park = marker.getTitle().split(":")[0];
            const ride = marker.getTitle().split(":")[1];
            const content = ` <h3>${park}: ${ride}</h3><div id="boxplot_div"></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            var month = document.getElementById("month").value;
        

            if (month == "overall"){
              makeBoxPlot(d.RIDE);
            }
            else{
              makeLinePlot(d.RIDE, month);
            }
            
          });
      }
    });
  });
}

function initMap() {

  let new_theme = [{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]}, {"featureType":"administrative.country","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#bcdb97"}]},{"featureType":"administrative.province","elementType":"geometry.fill","stylers":[{"color":"#d1ae77"},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"geometry.fill","stylers":[{"color":"#d1ae77"},{"visibility":"on"}]},{"featureType":"administrative.neighborhood","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d1ae77"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#d0e9ad"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#d0e9ad"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry.fill","stylers":[{"color":"#d0e9ad"},{"visibility":"on"}]},{"featureType":"landscape.natural.landcover","elementType":"labels.text.fill","stylers":[{"saturation":"-55"},{"visibility":"simplified"},{"hue":"#00ffff"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"gamma":"2.45"},{"weight":"4.29"},{"color":"#a7ca74"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#d1ae77"},{"visibility":"on"},{"weight":"3.30"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"saturation":"100"},{"lightness":"5"},{"visibility":"on"},{"color":"#a2db97"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d1ae77"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#d1ae77"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#29cfff"}]}];
  let previous_style = [{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]}];
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: center,
    disableDefaultUI: true,
    styles: new_theme
  });
  infoWindow = new google.maps.InfoWindow();

  drawMarkers(map, infoWindow);

  //Set onclick event for checkboxes using jQuery
  $('input[type=checkbox]').click(function() {
    filterMarkers();
  });

  const url_to_font_name = 'walter-font/Walter-zrol.ttf'
  const font_name = new FontFace('DisneyFont', `url(${url_to_font_name})`);
  document.fonts.add(font_name);
  font_name.load()
  // Work that does not require `font_name` to be loaded…
  // await font_name.load()
  // Work that requires `font_name` to be loaded…
}

window.initMap = initMap;














