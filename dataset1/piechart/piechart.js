// Set dimensions for pie chart
var margin = {top: 100, right: 50, bottom: 50, left: 50},
    width = 1260 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

// List of colors for each slice
var color = d3.scale.ordinal()
    .range(["#ED8664", "#BF5D3D", "#F0DE16", "#BDB131", "#F5C75D", "#D49400", "#C3D959", "#8EB32B", "#72D1DB", "#287F9C", "#9267DB", "#60259C", "#E072D9", "#962481", "#A37272","#7D3B3B", "#9AB6B8", "#366163", "#BABABA", "#6B6B6B"]);

// Width for the inner radius for the donut pie chart
var donutWidth = 125;

// Information for pie chart radius
var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

// Information for donut pie chart radius
var arc2 = d3.svg.arc()
  .outerRadius(radius - 10)
  .innerRadius(radius - donutWidth);

// Label location for each slice
var labelArc = d3.svg.arc()
    .outerRadius(radius - 50)
    .innerRadius(radius - 90);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.occurances; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var isdonut = 0;
var isSeperate = 0;

// Get data
d3.csv("pie.csv", type, function(error, data) {
  if (error) throw error;

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.month); })
      .transition()
      .ease("elastic")
      .delay(function(d, i) { return 2000 + i * 50; })
      .duration(750)
      .attrTween("d", tweenDonut);

  // Create path to use for clip path- used for dot grid
   g.append("clipPath")
      .attr("id", "graphy") // Clip path ID
    .append("circle") // Add the shape for clipping
      .attr("transform", "translate(" + width / 2.16 + "," + height / 2 + ")")
      .attr("r",radius - 12)
      .attr("fill", "black");

  function tweenDonut(b) {
    b.innerRadius = radius * .6;
    var i = d3.interpolate({innerRadius: 0}, b);
    return function(t) { return arc(i(t)); };
  }

  // Dataset to create a pie graph of 10 equal slices
  var dataset = [
    { month: '1', occurances: 10 }, 
    { month: '2', occurances: 10 },
    { month: '3', occurances: 10 },
    { month: '4', occurances: 10 }, 
    { month: '5', occurances: 10 },
    { month: '6', occurances: 10 },
    { month: '7', occurances: 10 }, 
    { month: '8', occurances: 10 },
    { month: '9', occurances: 10 },
    { month: '10', occurances: 10 }
    ];

  // Add second pie graph over main pie
  // CSS of pie graph has no fill but stroke width
  var g2 = svg.selectAll(".arc2")
      .data(pie(dataset))
    .enter().append("g")
      .attr("class", "arc2");

  g2.append("path")
      .attr("d", arc)
      .style("opacity",0) // Set opacity to be toggled

  // Adds text label
  g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".5em")
      .attr("dx", "-1em")
      .attr("class","textlabel")
      .style("opacity",1)
      .text(function(d) { return d.data.occurances; })
      //.style("fill", function(d) { return color(d.data.month); });
      .style("fill", "white");

  var legendRectSize = 18;
  var legendSpacing = 5;

  //Add a legend
  var legend = svg.selectAll('.legend')
    .data(pie(data))
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
          var height = legendRectSize + legendSpacing;
          var offset =  height * color.domain().length / 2;
          var x = 15 * legendRectSize + 40;
          if (i%2 == 0){
            offset += 5;
          }
          else{
            offset += 10;
          }
          var y = i * height - offset + 40;
          return 'translate(' + x + ',' + y + ')';
      });

  legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style("fill", function(d) { return color(d.data.month); })

  legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d.data.month; })


  // Add the graph title
  svg.append("text")
      .attr("x", (15 * legendRectSize + 90))     
      .attr("y", -240)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text("Petty and Grand Theft Occurances");

  svg.append("text")
      .attr("x", (15 * legendRectSize + 90))     
      .attr("y", -220)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text("Los Angeles During 2015");


  // Assign function to checkboxes
  d3.selectAll("#grid").on("change", grid);
  d3.selectAll("#showdata").on("change", showdata);
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

  // Function to add text points again- used in other functions
  function addtexts(){
          g.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dy", ".5em")
            .attr("dx", "-1em")
            .attr("class","textlabel")
            .style("opacity",1)
            .text(function(d) { return d.data.occurances; })
            .style("fill", "white");
    }

  //Function to 'seperate' pie slices by adding a white border on each piece
  function seperate(){
          if(this.checked){
            isSeperate = 1;
            g.selectAll("path")
                .style("stroke-width",10)
                .style("stroke","white")
          }
          else{           
            isSeperate = 0;
            g.selectAll("path")
                .style("stroke-width",0)
                .style("stroke","white")     
          }
        }

  function seperate2(){
          if(isSeperate == 1){
            g.selectAll("path")
                .style("stroke-width",10)
                .style("stroke","white")
          }
          else{           
            g.selectAll("path")
                .style("stroke-width",0)
                .style("stroke","white")     
          }
        }

  //Function to toggle the data points on the pie slices
  function showdata(){
          if(this.checked){
          d3.selectAll(".textlabel")
              .style("opacity",1);
          }
          else{
          d3.selectAll(".textlabel")
             .style("opacity",0);
          }
        }
  //Function to toggle pie grid on/off
  function grid(){
          if(this.checked){
          g2.selectAll("path")
              .style("opacity",1);
          }
          else{
          g2.selectAll("path")
              .style("opacity",0);
          }
        }

});

function type(d) {
  d.occurances = +d.occurances;
  return d;
}


//SVG of the dot grid overlay
    var svgns = "http://www.w3.org/2000/svg";

    // Draws dots in a horizontal line using a loop
    function drawYlines(t){
        var z = 100;
        for (var i = 0; i < 100; i++) {
            var x = 0 + z, y = t * 25;
            z += 25;
            var circles = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circles.setAttribute("cx",x);
            circles.setAttribute("cy",y);
            circles.setAttribute("r",5);
            circles.setAttribute("class","dot");
            circles.setAttribute("fill","darkblue");
            document.getElementById('svgTwo').appendChild(circles);
         }
    }

    // Draw dots in repeating lines vertically using a loop and drawYlines
    function drawXlines(){
    for (var i = 0; i < 100; i++) {
           drawYlines(i);
         }
    }

