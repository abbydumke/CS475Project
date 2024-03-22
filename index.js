
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

function makeBoxPlot(ride, month){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    // Read the data and compute summary statistics for each species
    d3.csv("overallwait1.csv", function(data) {
    //get all data rows where D.RIDE == ride
    data = data.filter(function(d) {
      return d.RIDE == ride;
    });
    //if month doesnt equal overall then filter data by month
    if (month != "overall") {
      data = data.filter(function(d) {
        return d.MONTH == month;
      });
    }
    
    //for ridedata, computer quartiles, median, inter quantile range min and max of AVERAGE_WAIT_TIME_MIN
      // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
      var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.TIME_OF_DAY;})
      .rollup(function(d) {
            var q1 = d3.quantile(d.map(function(g) { return g.AVERAGE_WAIT_TIME_MIN;}).sort(d3.ascending),.25)
            var median = d3.quantile(d.map(function(g) { return g.AVERAGE_WAIT_TIME_MIN;}).sort(d3.ascending),.5)
            var q3 = d3.quantile(d.map(function(g) { return g.AVERAGE_WAIT_TIME_MIN;}).sort(d3.ascending),.75)
            var interQuantileRange = q3 - q1
            var min = q1 - 1.5 * interQuantileRange
            var max = q3 + 1.5 * interQuantileRange
            return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
      })
      .entries(data)     

    // Show the X scale
    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["12 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"])
    .paddingInner(1)
    .paddingOuter(.5)
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

// Show the Y scale
var ymax = d3.max(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
var ymin = d3.min(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
var y = d3.scaleLinear()
  .domain([ymin,ymax + 10])
  .range([height, 0])
  svg.append("g").call(d3.axisLeft(y))

  if (month == "overall") {
// Show the main vertical line
  svg
  .selectAll("vertLines")
  .data(sumstat)
  .enter()
  .append("line")
  .attr("x1", function(d){return(x(d.key))})
  .attr("x2", function(d){return(x(d.key))})
  .attr("y1", function(d){return(y(d.value.min))})
  //if y1 is less than 0, set y1 to 0
  .attr("y1", function(d){if (y(d.value.min) < 0) {return 0;} else {return(y(d.value.min))}})
  .attr("y2", function(d){return(y(d.value.max))})
  .attr("stroke", "black")
  .style("width", 40)

// rectangle for the main box
var boxWidth = 15
svg
  .selectAll("boxes")
  .data(sumstat)
  .enter()
  .append("rect")
    .attr("x", function(d){return(x(d.key)-boxWidth/2)})
    .attr("y", function(d){return(y(d.value.q3))})
    .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
    .attr("width", boxWidth )
    .attr("stroke", "black")
    .style("fill", "#69b3a2")
  }
// Show the median
svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
    .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
    .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
    .attr("y1", function(d){return(y(d.value.median))})
    .attr("y2", function(d){return(y(d.value.median))})
    .attr("stroke", "black")
    .style("width", 80)

   if (month != "overall") {
    //add point wait time for each domain
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

   }
    })  
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
            marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
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
            const content = ` <h3>${park}: ${ride}</h3><div id="my_dataviz"></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            //get month by finding the selected month in index.html
            var month = document.getElementById("month").value;
            makeBoxPlot(d.RIDE,month);
            
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














