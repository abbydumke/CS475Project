
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

function makeBoxPlot(){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // Read the data and compute summary statistics for each specie
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {
    console.log(data);
      // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
      var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.Species;})
      .rollup(function(d) {
        
            var q1 = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.25)
            var median = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.5)
            var q3 = d3.quantile(d.map(function(g) { return g.Sepal_Length;}).sort(d3.ascending),.75)
            var interQuantileRange = q3 - q1
            var min = q1 - 1.5 * interQuantileRange
            var max = q3 + 1.5 * interQuantileRange
            return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
      })
      .entries(data)

    // Show the X scale
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(["setosa", "versicolor", "virginica"])
        .paddingInner(1)
        .paddingOuter(.5)
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([3,9])
      .range([height, 0])
      svg.append("g").call(d3.axisLeft(y))

    // Show the main vertical line
    svg
      .selectAll("vertLines")
      .data(sumstat)
      .enter()
      .append("line")
      .attr("x1", function(d){return(x(d.key))})
      .attr("x2", function(d){return(x(d.key))})
      .attr("y1", function(d){return(y(d.value.min))})
      .attr("y2", function(d){return(y(d.value.max))})
      .attr("stroke", "black")
      .style("width", 40)

    // rectangle for the main box
    var boxWidth = 100
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

    // Add individual points with jitter
    var jitterWidth = 50
    svg
      .selectAll("indPoints")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d){return(x(d.Species) - jitterWidth/2 + Math.random()*jitterWidth )})
      .attr("cy", function(d){return(y(d.Sepal_Length))})
      .attr("r", 4)
      .style("fill", "white")
      .attr("stroke", "black")


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
    
          all_markers.push(marker);
    
          marker.addListener("click", function() {
            const park = marker.getTitle().split(":")[0];
            const ride = marker.getTitle().split(":")[1];
            const content = ` <h3>${park}: ${ride}</h3><div id="my_dataviz"></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
            makeBoxPlot();
            
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














