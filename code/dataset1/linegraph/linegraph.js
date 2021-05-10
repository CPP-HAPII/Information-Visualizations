// Variables for creating graph area
var margin = {top: 50, right: 250, bottom: 50, left: 80},
    width = 1360 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// List of colors for bars- count must be same as line count (3 lines, 3 colors)
var color = d3.scale.ordinal()
.range(["#6CBA3C", "#ABDE8E", "#99C7BC","#84CED3", "#4CA3D2", "#BF3B58", "#CD91D9","#9D8EF5", "#583FE8"]);


var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(15);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

// Functions for the x and y grid lines
function xgrid() {        
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(15)
}

function ygrid() {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(30)
}

// Function to draw area under the line paths
var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.temperature); });

// Function to draw the lines
var line = d3.svg.line()
    .interpolate("linear") // Makes them jagged/angles at data points
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("line.csv", function(error, data) {
  if (error) throw error;

  // Gets each specific line from file
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date); // Parses the date format
  });

  // For each line, returns the line dates and the values
  var cities = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, temperature: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Crime Occurances");

  // Draw the X grid lines
  svg.append("g")
      .attr("class", "gridx") //assign class for toggling opacity/CSS
      .attr("transform", "translate(0," + height + ")")
      .call(xgrid()
          .tickSize(-height, 0, 0)
          .tickFormat("")
      )
  // Draw the Y grid lines
  svg.append("g")            
      .attr("class", "gridy") //assign class for toggling opacity/CSS
      .call(ygrid()
          .tickSize(-width, 0, 0)
          .tickFormat("")
      )

  // Creates value that connects to data
  var city = svg.selectAll(".city")
      .data(cities)
    .enter().append("g")
      .attr("class", "city");

  // Draws the line based on the data
  city.append("path")
      .attr("class", "line")
      .attr("id" , function(d, i){
              return "line" + i;
            })
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  // Adds area under the line path
  city.append("path")
        .attr("class", "area")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d) { return color(d.name); });

  // Adds the text name of line at end of path
  city.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 7)
      .attr("dy", ".1em")
      .attr("class","linename")
      .style("fill", function(d) { return color(d.name); })
      .text(function(d) { return d.name; });

  // Add the dot for each data point
  city.selectAll("dot")
        .data(function(d){ return d.values})
      .enter().append("circle")
        .attr("class","dot")
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.temperature); })
        .style("stroke", function(d) { return color(this.parentNode.__data__.name); })
        .style("fill", "white")
        .attr("opacity",0); //set opacity to 0 first, will be toggled 

  // Add text data above the data points
  city.selectAll("text.dot")
      .data(function(d){ return d.values})
  .enter().append("text")
    .attr("class","datapt")
    .attr("font-size", "15px")
    .style("fill", function(d) { return color(this.parentNode.__data__.name); })
    .attr("text-align", "center")
    .style("opacity",0)
    .attr("x", function(d) { return x(d.date); })
    .attr("y", function(d) { return y(d.temperature) - 10; })
    .text(function(d) { return d.temperature; });


  // Add the legend of each color and group
  var legend = svg.selectAll(".legend")
      .data(cities)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width + 100)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return color(d.name)});

  legend.append("text")
      .attr("x", width + 130)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d.name; });

  
  // Add the graph title
  svg.append("text")
      .attr("x", (width / 2))     
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text("Crime Occurances per Month in Los Angeles During 2015");

    // Assign function to checkboxes
    d3.selectAll("#gridh").on("change", addh);
    d3.selectAll("#gridv").on("change", addv);
    d3.selectAll("#putdot").on("change", putdot);
    d3.selectAll("#fillarea").on("change", fillarea);
    d3.selectAll("#addpt").on("change", addpt);
    d3.selectAll("#addlinename").on("change", addlinename);
    d3.selectAll("#animate").on("change", animate);
    d3.selectAll("#showdots").on("change", showdots);

  // Function to toggle the dot grid
  function showdots(){
          if(this.checked){
            var x = document.getElementById('svgOne');
            x.setAttribute("visibility", "visible");
          }
          else{              
            var x = document.getElementById('svgOne');
            x.setAttribute("visibility", "hidden");
          }
    }

    //Function to toggle horizontal grid lines on/off
    function animate(){
            if(this.checked){
              // Select all lines in lines class
              // and go through each one by one using each line's id
                d3.selectAll(".line").each(function(d,i){

                // Get the length of each line
                var totalLength = d3.select("#line" + i).node().getTotalLength();

                d3.selectAll("#line" + i)
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                      .duration(3000)
                      .delay(100*i)
                      .ease("quad") //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
                      .attr("stroke-dashoffset", 0)
                      .style("stroke-width",2)
                })
            }
            else{
              svg.selectAll(".gridy")     
                .style("opacity", 0)
            }
          }

    //Function to toggle horizontal grid lines on/off
    function addh(){
            if(this.checked){
              svg.selectAll(".gridy")         
                .style("stroke", "#C7C7C7")
                .style("opacity", 1)
              svg.selectAll("text")         
                .style("stroke", "none")
            }
            else{
              svg.selectAll(".gridy")     
                .style("opacity", 0)
            }
          }


    //Function to toggle vertical grid lines on/off
    function addv(){
            if(this.checked){
              svg.selectAll(".gridx")         
                .style("stroke", "#C7C7C7")
                .style("opacity", 1)
              svg.selectAll("text")         
                .style("stroke", "none")
            }
            else{
              svg.selectAll(".gridx")      
                .style("opacity", 0)
            }
          }


    //Function to toggle dot data points on/off
    function putdot(){
          if(this.checked){
            svg.selectAll("circle")
                .style("opacity",1)
              }
          else{
            svg.selectAll("circle")
                .style("opacity",0)
          }
    }

    //Function to toggle fill under the line
    function fillarea(){
          if(this.checked){
            svg.selectAll(".area")
                .style("opacity",.3)
              }
          else{
            svg.selectAll(".area")
                .style("opacity",0)
          }
    }

    //Function to toggle data point info
    function addpt(){
          if(this.checked){
            city.selectAll("text.dot")
              city.selectAll(".datapt")
                .style("opacity",1);
              }
          else{
            city.selectAll("text.dot")
              city.selectAll(".datapt")
                .style("opacity",0);
            city.selectAll("text.dot")
              city.selectAll(".linename")
                .style("opacity",0);
          }
    }

     //Function to toggle data point info
    function addlinename(){
          if(this.checked){
            city.selectAll("text.dot")
              city.selectAll(".linename")
                .style("opacity",1);
              }
          else{
            city.selectAll("text.dot")
              city.selectAll(".linename")
                .style("opacity",0);
          }
    }

});



//SVG of the dot grid overlay
    var svgns = "http://www.w3.org/2000/svg";

    // Draws dots in a horizontal line using a loop
    function drawYlines(t){
        var z = 100;
        for (var i = 0; i < 100; i++) {
            var x = 0 + z, y = t * 15;
            z += 14;
            var circles = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circles.setAttribute("cx",x);
            circles.setAttribute("cy",y);
            circles.setAttribute("r",2);
            circles.setAttribute("class","dot");
            circles.setAttribute("fill","darkblue");
            document.getElementById('svgOne').appendChild(circles);
         }
    }

    // Draw dots in repeating lines vertically using a loop and drawYlines
    function drawXlines(){
    for (var i = 0; i < 100; i++) {
           drawYlines(i);
         }
    }

