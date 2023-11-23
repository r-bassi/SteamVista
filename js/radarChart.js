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
      strokeWidth: 2,
    };
    this.data = [
      [
        { axis: "Peak CCU", value: data[0]["Peak CCU"] },
        { axis: "Price", value: data[0]["Price"] },
        { axis: "DLC count", value: data[0]["DLC count"] },
        { axis: "positive_ratio", value: data[0]["positive_ratio"] },
        { axis: "User score", value: data[0]["User score"] },
        {
          axis: "Average playtime forever",
          value: data[0]["Average playtime forever"],
        },
      ],
    ];
    this.initVis();
  }

  initVis() {
    let vis = this;
    //console.log(vis.data);

    vis.scaleList = [
      [400, 800, 1200, 1600, 2000], //"Peak CCU"
      [20, 40, 60, 80, 100], //"Price"
      [2, 4, 6, 8, 10], //"DLC count"
      [20, 40, 60, 80, 100], //"Positive_ratio"
      [20, 40, 60, 80, 100], //"User score"
      [600, 1200, 1800, 2400, 3000], //"Average playtime forever"
    ];
    vis.myColor = d3.scaleOrdinal().domain(vis.data).range(d3.schemeSet1);
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
        .attr("fill", "#737373")
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
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return vis.radius * 1.3 * Math.cos(vis.angleSlice * i - Math.PI / 2);
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
        return vis.rScaleList[i](d.value);
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
        return vis.myColor(i);
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
        //console.log(d.value);
        return (
          vis.rScaleList[i](d.value) *
          Math.cos(vis.angleSlice * i - Math.PI / 2)
        );
      })
      .attr("cy", function (d, i) {
        return (
          vis.rScaleList[i](d.value) *
          Math.sin(vis.angleSlice * i - Math.PI / 2)
        );
      })
      .style("fill", vis.myColor(0))
      .style("fill-opacity", 0.8);
  }
}
