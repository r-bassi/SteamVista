class RadarChart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 720,
      containerHeight: 260,
      margin: {
        top: 70,
        right: 70,
        bottom: 70,
        left: 100,
      },
      levels: 5,
      dotRadius: 4,
      opacityCircles: 0.1,
      strokeWidth: 3,
    };
    this.data = [
      [
        { axis: "Peak CCU", value: data[0]["Peak_CCU"] },
        { axis: "Price", value: data[0]["Price"] },
        { axis: "DLC Count", value: data[0]["DLC_count"] },
        { axis: "Positive Ratio", value: data[0]["positive_ratio"] },
        { axis: "Supported Languages", value: data[0]["Supported_languages"] },
        {
          axis: "Average playtime forever",
          value: data[0]["Average_playtime_forever"],
        },
      ],
    ];
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.scaleList = [
      [500, 4625, 8750, 12875, 17000], //"Peak CCU"
      [200, 400, 600, 800, 1000], //"Price"
      [480, 960, 1440, 1920, 2400], //"DLC count":
      [20, 40, 60, 80, 100], //"Positive_ratio"
      [60, 120, 180, 240, 300], //"User score":
      [1300, 2600, 3900, 5200, 6500], //"Average playtime forever"
    ];
    vis.myColor = "green";
    vis.radius = (window.innerWidth + window.innerHeight) / 8;

    (vis.allAxis = vis.data[0].map(function (i, j) {
      return i.axis;
    })),
      (vis.total = vis.allAxis.length),
      (vis.Format = d3.format(".1f")),
      (vis.angleSlice = (Math.PI * 2) / vis.total);

    var svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr(
        "width",
        vis.radius * 2 + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.radius * 2 + vis.config.margin.top + vis.config.margin.bottom
      )
      .attr("class", "radar" + vis.config.parentElement);

    vis.g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (vis.radius + vis.config.margin.left) +
          "," +
          (vis.radius + vis.config.margin.top) +
          ")"
      );

    vis.axisGrid = vis.g.append("g").attr("class", "axisWrapper");

    vis.axisGrid
      .selectAll(".levels")
      .data(d3.range(1, vis.config.levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function (d, i) {
        return (vis.radius / vis.config.levels) * d;
      })
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", vis.config.opacityCircles);
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.rScaleList = [
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[0][4]]), //"Peak CCU"
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[1][4]]), //"Price"
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[2][4]]), //"DLC count"
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[3][4]]), //"Positive_ratio"
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[4][4]]), //"User score"
      d3
        .scaleLinear()
        .range([0, vis.radius - 50])
        .domain([0, vis.scaleList[5][4]]), //"Average playtime forever"
    ];
    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    var axis = vis.axisGrid
      .selectAll(".axis")
      .data(vis.allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    for (let scaleIndex = 0; scaleIndex < 6; scaleIndex++) {
      axis
        .append("text")
        .attr("class", "textscale")
        .style("font-size", "10px")
        .style("fill", "white")
        .data(vis.scaleList[scaleIndex])
        .attr("x", 4)
        .attr("dy", "-8")
        .attr("y", function (d, i) {
          return (-vis.radius * i) / vis.scaleList[scaleIndex].length;
        })
        .attr("transform", function (d, i) {
          var angleI = (vis.angleSlice * scaleIndex * 180) / Math.PI;
          var flip = angleI < 90 || angleI > 270 ? false : true;
          if (flip == true) {
            return "rotate(" + angleI + ")";
          } else {
            return "rotate(" + angleI + ")";
          }
        })
        .text(function (d) {
          if (scaleIndex == 0) {
            return vis.Format(d);
          } else {
            if (d != 0) {
              return vis.Format(d);
            } else {
              return;
            }
          }
        });
    }

    //Append lines
    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", function (d, i) {
        return vis.radius * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr("y2", function (d, i) {
        return vis.radius * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .attr("class", "line")
      .style("stroke", "#CDCDCD")
      .style("stroke-width", "2px");

    //Append axis labels
    axis
      .append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return vis.radius * 1.2 * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr("y", function (d, i) {
        return vis.radius * 1.1 * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .text(function (d) {
        return d;
      });

    var blobWrapper = vis.g
      .selectAll(".radarWrapper")
      .data(vis.data)
      .enter()
      .append("g")
      .attr("class", "radarWrapper");

    var radarLine = d3
      .lineRadial()
      .curve(d3.curveCardinalClosed)
      .radius(function (d, i) {
        return Math.min(vis.rScaleList[i](d.value), vis.radius);
        //return vis.rScaleList[i](d.value);
      })
      .angle(function (d, i) {
        return i * vis.angleSlice;
      });

    //Create blob outline
    blobWrapper
      .append("path")
      .attr("class", "radarStroke")
      .attr("d", function (d, i) {
        return radarLine(d);
      })
      .style("stroke-width", vis.config.strokeWidth + "px")
      .style("stroke", function (d, i) {
        return vis.myColor;
      })
      .style("fill", "none")
      .style("filter", "url(#glow)");

    //Append the mark
    blobWrapper
      .selectAll(".radarCircle")
      .data(function (d, i) {
        return d;
      })
      .enter()
      .append("circle")
      .attr("class", "radarCircle")
      .attr("r", vis.config.dotRadius)
      .attr("cx", function (d, i) {
        if (d.value > vis.scaleList[i][4]) {
          var scaledValue = vis.rScaleList[i](d.value);

          if (d.value > vis.scaleList[i][4] && scaledValue > vis.radius) {
            return vis.radius * Math.cos(vis.angleSlice * i - Math.PI / 2);
          }
        }
        return (
          vis.rScaleList[i](d.value) *
          Math.cos(vis.angleSlice * i - Math.PI / 2)
        );
      })
      .attr("cy", function (d, i) {
        var scaledValue = vis.rScaleList[i](d.value);

        if (d.value > vis.scaleList[i][4] && scaledValue > vis.radius) {
          return vis.radius * Math.sin(vis.angleSlice * i - Math.PI / 2);
        }
        return (
          vis.rScaleList[i](d.value) *
          Math.sin(vis.angleSlice * i - Math.PI / 2)
        );
      })
      .style("fill", "lightgreen")
      .style("fill-opacity", 0.8)
      .style("pointer-events", "all")
      .on("mouseover", function (i, d) {
        var newX = parseFloat(d3.select(this).attr("cx")) - 10;
        var newY = parseFloat(d3.select(this).attr("cy")) - 10;

        tooltip
          .attr("x", newX)
          .attr("y", newY)
          .text(vis.Format(d.value))
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("fill", "white")
          .style("font-weight", "bold");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    var tooltip = vis.g
      .append("text")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }
}
