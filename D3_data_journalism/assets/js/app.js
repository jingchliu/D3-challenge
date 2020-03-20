let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
let svg = d3
  .select("#scatter")
  .append("svg")
  .classed('chart',true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating scale var upon click on axis label
function xScale(pplData, chosenXAxis) {
  // create scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(pplData, d => d[chosenXAxis]),d3.max(pplData, d => d[chosenXAxis]) 
    ])
    .range([0, width]);
  return xLinearScale;
}

function yScale(pplData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
      .domain([0,d3.max(pplData, d => d[chosenYAxis]) 
      ])
      .range([height, 0]);
    return yLinearScale;
  }

// function used for updating Axis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  else if (chosenXAxis === "age"){
    xLabel = "Age:";
  }
  else {
    xLabel = "Household Income:";
  };

  if (chosenYAxis === "obesity") {
    yLabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes"){
    yLabel = "Smokes:";
  }
  else {
    yLabel = "Healthcare:";
  };

  let toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(pplData, err) {
  if (err) throw err;

  // parse data
  pplData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.poverty= +data.poverty;
  });

  // xLinearScale function above csv import
  let xLinearScale = xScale(pplData, chosenXAxis);

  // Create y scale function
  let yLinearScale =yScale(pplData, chosenYAxis);
;

  // Create initial axis functions
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
    // .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  let circlesGroup = chartGroup.selectAll("circle")
    .data(pplData)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    // .attr("fill", "lightblue")
    // .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  let xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
  

  let povertyXLabel = xlabelsGroup.append("text")
    .classed('xText', true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  let ageXLabel = xlabelsGroup.append("text")
    .classed('xText', true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  let incomeXLabel = xlabelsGroup.append("text")
    .classed('xText', true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  let healthCareYLabel = ylabelsGroup.append("text")
    .classed('yText', true)
    .attr("y", 0 - margin.left+50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    // .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  let smokeYLabel = ylabelsGroup.append("text")
    .classed('yText', true)
    .attr("y", 0 - margin.left+45)
    .attr("x", 0 - (height / 2))
    .classed("inactive", true)
    // .attr("dy", "1em")
    // .classed("axis-text", true)
    .text("Smokes (%)");

  let obesityYLabel = ylabelsGroup.append("text")
    .classed('yText', true)
    .attr("y", 0 - margin.left+20)
    .attr("x", 0 - (height / 2))
    .classed("inactive", true)
    // .attr("dy", "1em")
    // .classed("axis-text", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll(".xText")
    .on("click", function() {
      // get value of selection
      let value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(pplData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyXLabel
            .classed("active", true)
            .classed("inactive", false);
          ageXLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeXLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyXLabel
            .classed("active", false)
            .classed("inactive", true);
          ageXLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeXLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyXLabel
            .classed("active", false)
            .classed("inactive", true);
          ageXLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeXLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    labelsGroup.selectAll(".yText")
    .on("click", function() {
      // get value of selection
      let value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(pplData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityYLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeYLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareYLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smoke"){
          obesityYLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeYLabel
            .classed("active", true)
            .classed("inactive", false);
          healthCareYLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityYLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeYLabel
            .classed("active", false)
            .classed("inactive", true);
          healthCareYLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
