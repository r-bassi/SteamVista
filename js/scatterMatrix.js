class ScatterMatrix {
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 928,
      containerHeight: 928,
      margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30,
      },
      // Todo: Add or remove attributes from config as needed
    };

    this.data = data;

    // Initialize scales, axes, and SVG
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define the attributes for the scatterplot matrix
    const attributes = [
      "Peak_CCU",
      "Price",
      "DLC_count",
      "Supported_languages",
      "Average_playtime_forever",
    ];
    const padding = 28;
    const size =
      (vis.width - (attributes.length + 1) * padding) / attributes.length +
      padding;

    // Define the horizontal scales (one for each row).
    vis.x = attributes.map((attr) =>
      d3
        .scaleLinear()
        .domain(d3.extent(vis.data, (d) => d[attr]))
        .rangeRound([padding / 2, size - padding / 2])
    );

    // Define the companion vertical scales (one for each column).
    vis.y = vis.x.map((xScale) =>
      xScale.copy().range([size - padding / 2, padding / 2])
    );

    // Define the color scale.
    vis.color = d3
      .scaleOrdinal()
      .domain(vis.data.map((d) => d.species))
      .range(d3.schemeCategory10);

    // Define the horizontal axis (it will be applied separately for each column).
    vis.xAxis = d3.axisBottom().tickSize(size * attributes.length);

    // Define the vertical axis (it will be applied separately for each row).
    vis.yAxis = d3.axisLeft().tickSize(-size * attributes.length);

    // Define the size of the SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append x-axis group
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append cells for scatterplot matrix
    vis.cell = vis.svg
      .append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(attributes.length), d3.range(attributes.length)))
      .join("g")
      .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

    // Append rectangles to define cells
    vis.cell
      .append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding)
      .attr("height", size - padding);

    // Append labels for x-axis
    vis.svg
      .append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
      .selectAll("text")
      .data(attributes)
      .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${vis.height - 50})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text((d) => d);

    // Append labels for y-axis, rotated on its side
    vis.svg
      .append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
      .selectAll("text")
      .data(attributes)
      .join("text")
      .attr(
        "transform",
        (d, i) => `translate(${vis.width},${i * size + 50}), rotate(90)`
      )
      .attr("x", -padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text((d) => d);

    // Call updateVis initially to render the initial state
    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const attributes = [
      "Peak_CCU",
      "Price",
      "DLC_count",
      "Supported_languages",
      "Average_playtime_forever",
    ];

    // Append circles to represent data points
    vis.cell.each(function ([i, j]) {
      d3.select(this)
        .selectAll("circle")
        .data(
          vis.data.filter(
            (d) => !isNaN(d[attributes[i]]) && !isNaN(d[attributes[j]])
          )
        )
        .join("circle")
        .attr("cx", (d) => vis.x[i](d[attributes[i]]))
        .attr("cy", (d) => vis.y[j](d[attributes[j]]))
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .attr("fill", "#69b3a2");
    });

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());

    vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
  }
}
