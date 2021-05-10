// Variables for creating graph area
var margin = {top: 50, right: 150, bottom: 50, left: 100},
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// Width of each bar, scaled
// .1 -> 0, bars touch; higher number, bigger space between them
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal()
  .rangeBands([0, width], 0);

var y = d3.scale.linear()
    .range([height, 0]);

// List of colors for bars- count must be same as group count (4 groups, 4 colors)
var color = d3.scale.ordinal()
    .range(["#F2BB6D", "#42A6C6","#B0E38A", "#B33E1E", "#404252", "#3DA866", "#7FCCCC", "#C4833D", "#E8B920"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

// Functions for the x and y grid lines
function xgrid() {        
    return d3.svg.axis()
        .scale(x0)
        .orient("bottom")
        .ticks(15)
}

function ygrid() {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(15)
}

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("bar.csv", function(error, data) {
//d3.csv(csv, function(error, data) {
  if (error) throw error;

  // Variable to get all different groups
  var freqNum = d3.keys(data[0]).filter(function(key) { return key !== "letter"; });
  // For each group, returns the group name and the values
  data.forEach(function(d) {
    d.freq = freqNum.map(function(name) {
     return {
         name: name,
         value: +d[name]};
       });
  });

  // Group: each bar color (freq1, etc.)
  // Collection: each collection of bars on an X domain value

  x0.domain(data.map(function(d) { return d.letter; })); // X domain
  x1.domain(freqNum).rangeRoundBands([0, x0.rangeBand()]); // X domain for each bar
  y.domain([0, d3.max(data, function(d) { return d3.max(d.freq, function(d) { return d.value; }); })]);


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

  // Use data to draw each bar
  var letter = svg.selectAll(".letter")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.letter) + ",0)"; });

  // Draw bar dynamically
  letter.selectAll("rect")
      .data(function(d) { return d.freq; })
    .enter().append("rect")
      .attr("class", "letter")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); }) // X domain for each bar group
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); }) // Height of bar
      .style("fill", function(d) { return color(d.name); }); // Fills color based on color array

  // Draw the background bars, showing faded bars that reach the max Y value
  var letter2 = svg.selectAll(".bars")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.letter) + ",0)"; });

  letter2.selectAll("rect")
      .data(function(d) { return d.freq; })
    .enter().append("rect")
      .attr("class", "letter")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      // From the data, gets the max value from the group
      //.attr("y", function(d) { return d3.max(data, function(d) { return d3.max(d.freq, function(d) { return d.value; }); }); })
      .attr("y", function(d) { 5000 })
      .attr("height", function(d) { return height; })
      .style("fill", function(d) { return color(d.name); })
      .style("opacity",0);
  
  // Add the legend of each color and group
  var legend = svg.selectAll(".legend")
      .data(freqNum.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 24 + ")"; });

  legend.append("rect")
      .attr("x", width + 10)
      .attr("y", 10)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width + 35)
      .attr("y", 18)
      .attr("dy", ".4em")
      .style("text-anchor", "start")
      .text(function(d) { return d; });

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

  // Add the graph title
  svg.append("text")
      .attr("x", (width / 2))     
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text("Types of Crime Occurances per Month in Los Angeles in 2015");

  // Text data above the bars
  letter.selectAll("text.bar")
    .data(function(d) { return d.freq; })
  .enter().append("text")
    .attr("class", "bar")
    .style("opacity",0)
    .style("fill", function(d) { return color(d.name); })
    .attr("text-align", "middle")
    .attr("x", function(d) { return x1(d.name) + 5; })
    .attr("y", function(d) { return y(d.value) - 5; })
    .text(function(d) { return d.value; });

   // Assign function to checkboxes
    d3.selectAll("#gridh").on("change", addh);
    d3.selectAll("#gridv").on("change", addv);
    d3.selectAll("#showdata").on("change", showdata);
    d3.selectAll("#fillarea").on("change", fillarea);
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


    // Function to toggle horizontal grid lines on/off
    function addh(){
            if(this.checked){
              svg.selectAll(".gridy")         
                .style("stroke", "grey")
                .style("opacity", 1)
              svg.selectAll("text")         
                .style("stroke", "none")
            }
            else{
              svg.selectAll(".gridy")     
                .style("opacity", 0)
            }
          }


    // Function to toggle vertical grid lines on/off
    function addv(){
            if(this.checked){
              svg.selectAll(".gridx")         
                .style("stroke", "grey")
                .style("opacity", 1)
              svg.selectAll("text")         
                .style("stroke", "none")
            }
            else{
              svg.selectAll(".gridx")      
                .style("opacity", 0)
            }
          }

    function showdata(){
            if(this.checked){
              svg.selectAll("text.bar")  
                .style("opacity", 1)
            }
            else{
              svg.selectAll("text.bar")      
                .style("opacity", 0)
            }
          }

    function animate(){
            if(this.checked){
              letter.selectAll("rect").remove(); //removes all current bars        
              letter.selectAll("rect") //draws new bars at 0
               .data(function(d) { return d.freq; })
              .enter().append("rect")
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.name); })
                .attr("y", height)
                .attr("height", 0)
                .style("fill", function(d) { return color(d.name); })
              .transition() //transitions to the full bar
                .delay(function(d, i) { return i * 100; })
                .duration(1000)
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .style("fill", function(d) { return color(d.name); })
            }
            else{
            }
          }

    // Function to toggle opacity of the background fill area
    function fillarea(){
            if(this.checked){
              letter2.selectAll("rect") 
                .style("opacity", .2)
            }
            else{
              letter2.selectAll("rect")     
                .style("opacity", 0)
            }
          }
});



//SVG of the dot grid overlay
    var svgns = "http://www.w3.org/2000/svg";

    // Draws dots in a horizontal line using a loop
    function drawYlines(t){
        var z = 100;
        for (var i = 0; i < 100; i++) {
            var x = 0 + z, y = t * 20;
            z += 20;
            var circles = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circles.setAttribute("cx",x);
            circles.setAttribute("cy",y);
            circles.setAttribute("r",2.5);
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

