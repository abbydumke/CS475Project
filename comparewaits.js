
const center = { lat: 28.39109030017273, lng: -81.58097911833917};
var all_markers = [];
var selected_parks = [];
var map = null;
var infoWindow = null;

var global_data = [];
var svg = null;
var margin = null;
var x = null;
var y = null;
var width = null;
var height = null;



function makePlot(){
  // set the dimensions and margins of the graph
  margin = {top: 10, right: 30, bottom: 30, left: 30},
  width = 600 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  //append the svg object to the body of the page
  svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Show the X scale
  x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["12 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"])
    .paddingInner(1)
    .paddingOuter(.5)
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

    //get all data rows where D.RIDE == ride
  
  var data = global_data;

  // Show the Y scale
  var ymax = d3.max(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
  var ymin = d3.min(data, function(d) { return +d.AVERAGE_WAIT_TIME_MIN; });
  y = d3.scaleLinear()
    .domain([ymin,ymax + 10])
    .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))
}

function makeLinePlot(ride, month, color){
  console.log(global_data);
    console.log(ride);
     var data = global_data.filter(function(d) {
       return d.RIDE == ride;
     });
      console.log(data);

      data = data.filter(function(d) {
        return d.MONTH == month;
      });

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
      .attr("stroke", color )
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.TIME_OF_DAY) })
        .y(function(d) { return y(d.AVERAGE_WAIT_TIME_MIN) })
      )
}


function initPlot() {


  d3.csv("overallwait1.csv", function(data) {

    global_data = data;
    makePlot();

    //when month is changed, update plot
    document.getElementById("month").addEventListener("change", function() {
      //Clear the plot
      d3.select("#my_dataviz").selectAll("*").remove();
      makePlot();
      //Get all selected rides
      var selected_rides = $("input:checkbox[type=checkbox]:checked");
      selected_rides.each(function(i, d){
          // Get selected month for dropdown month 
          var month = document.getElementById("month").value;
          var ride = d.name;
          var color = d.value;
          makeLinePlot(ride, month, color);
      });
    });


    $('input[type=checkbox]').click(function() {
        var selected_rides = $("input:checkbox[type=checkbox]:checked");
        selected_rides.each(function(i, d){

            // Get selected month for dropdown month 
            var month = document.getElementById("month").value;
            var ride = d.name;
            makeLinePlot(ride, month);
        });

    });
    //when ride is deselected, remove ride from plot
    $('input[type=checkbox]').click(function() {
      //Clear the plot
      d3.select("#my_dataviz").selectAll("*").remove();
      makePlot();
      //Get all selected rides
      var selected_rides = $("input:checkbox[type=checkbox]:checked");
      selected_rides.each(function(i, d){
          // Get selected month for dropdown month 
          var month = document.getElementById("month").value;
          var ride = d.name;
          var color = d.value;
          makeLinePlot(ride, month, color);
      });
    });
  });
}

window.onload = initPlot;
