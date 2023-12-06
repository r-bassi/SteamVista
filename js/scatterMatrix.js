class ScatterMatrix {
  constructor(_config, data, _packLayout) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 828,
      containerHeight: 828,
      margin: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30,
      },
    };

    this.data = data;
    this.packLayout = _packLayout;

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

    // Define the horizontal axis (it will be applied separately for each column).
    const axisx = d3
      .axisBottom()
      .ticks(6)
      .tickSize(size * attributes.length);
    vis.xAxis = (g) =>
      g
        .selectAll("g")
        .data(x)
        .join("g")
        .attr("transform", (d, i) => `translate(${i * size},0)`)
        .each(function (d) {
          return d3.select(this).call(axisx.scale(d));
        })
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"));

    // Define the vertical axis (it will be applied separately for each row).
    const axisy = d3
      .axisLeft()
      .ticks(6)
      .tickSize(-size * attributes.length);
    vis.yAxis = (g) =>
      g
        .selectAll("g")
        .data(y)
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * size})`)
        .each(function (d) {
          return d3.select(this).call(axisy.scale(d));
        })
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").attr("stroke", "#ddd"));

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

    vis.svg
      .append("rect")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("fill", "transparent") // make sure the rect is not visible
      .on("click", () => vis.resetHighlights());

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
      .attr(
        "transform",
        (d, i) => `translate(${i * size - 15},${vis.height - 60})`
      )
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .attr("fill", "white")
      .attr("fill-opacity", 0.9)
      .style("font-size", "10px")
      .style("font-family", "Arial, Helvetica, sans-serif")
      .style("font-weight", "bold")
      .text((d) => d.replace(/_/g, " "));

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
      .attr("fill", "white")
      .attr("fill-opacity", 0.9)
      .style("font-size", "10px")
      .style("font-family", "Arial, Helvetica, sans-serif")
      .style("font-weight", "bold")
      .text((d) => d.replace(/_/g, " "));

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

    // Append circles to represent data points,
    vis.cell.each(function ([i, j]) {
      d3.select(this)
        .selectAll("circle")
        .data(
          vis.data.filter(
            (d) =>
              !isNaN(d[attributes[i]]) && !isNaN(d[attributes[j]]) && d.app_id
          )
        )
        .join("circle")
        .attr("cx", (d) => {
          return vis.x[i](d[attributes[i]]);
        })
        .attr("cy", (d) => {
          return vis.y[j](d[attributes[j]]);
        })
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .attr("fill", "#d69b65")
        .on("click", function (event, d) {
          console.log(d);
          if (d.app_id) {
            vis.packLayout.clickedEventFromExternal(d.app_id);
          } else {
            console.error("Undefined gameId in ScatterMatrix click event");
          }
        });
    });
  }

  updateFilteredData(filteredData) {
    let vis = this;
    vis.data = filteredData;
    vis.renderVis();
  }

  resetHighlights() {
    let vis = this;

    vis.cell.selectAll("circle").attr("stroke", "none");

    if (vis.packLayout) {
      vis.packLayout.resetHighlights();
    }
  }

  highlightNode(gameId) {
    // Reset any previous highlights
    this.cell.selectAll("circle").attr("stroke", "none");

    // Highlight the node with the matching game ID
    this.cell
      .selectAll("circle")
      .filter((d) => d.app_id === gameId)
      .attr("stroke", "black")
      .attr("stroke-width", 3);
  }
}
