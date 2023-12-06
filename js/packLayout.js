class PackLayout {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */

  constructor(_config, _data, _scatterMatrix) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 1000,
      tooltipPadding: 15,
      margin: {
        top: 60,
        right: 15,
        bottom: 60,
        left: 15,
      },
    };
    this.data = _data;
    this.scatterMatrix = _scatterMatrix;
    this.initVis();
  }

  initVis() {
    let vis = this;
    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.config.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize color scale
    vis.colorScale = d3
      .scaleOrdinal()
      .range([
        "#a6cee3",
        "#1f78b4",
        "#b2df8a",
        "#33a02c",
        "#fb9a99",
        "#e31a1c",
        "#fdbf6f",
        "#ff7f00",
        "#cab2d6",
        "#6a3d9a",
        "#ffff99",
        "#b15928",
        "#df0ce9",
      ]);

    vis.radiusScale = d3
      .scaleLinear()
      .domain(d3.extent(vis.data, d => d.Peak_CCU))
      .range([1, 200]);

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg
      .append("g")
      .attr("class", "bubble-chart")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top - 30})`
      );

    // Find genre groups
    vis.genreMainGroups = vis.groupByGenreMain();

    // Find number of strong links each game has to other games
    vis.getWellLinked(vis.data);

    // Create hierarchy based off genre and each game's peak CCU
    vis.nodeHierarchy = d3
      .hierarchy({
        children: vis.genreMainGroups,
      })
      .sum((d) => vis.radiusScale(d.Peak_CCU));
      

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Set pack parameters
    vis.pack = d3
      .pack()
      .size([vis.config.width + 80, vis.config.height]);

    vis.root = vis.pack.padding(1.5)(vis.nodeHierarchy);

    // Color scale domain set for available genres
    vis.colorScale.domain(ranking);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll("*").remove();

    vis.nodes = vis.chart
      .append("g")
      .selectAll("circle")
      .data(vis.root.descendants())
      .join("circle")
      .attr("class", (d) => {
        if (d.data.hasOwnProperty("GenreMain")) {
          return "node";
        } else if (d.data.hasOwnProperty("genre")) {
          return "genreGroup";
        } else {
          return "outerGroup";
        }
      })
      .attr("r", (d) => (isNaN(d.r) ? 0 : d.r))
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => {
        if (d.data.hasOwnProperty("GenreMain")) {
          return vis.colorScale(d.data.GenreMain);
        } else if (d.data.hasOwnProperty("genre")) {
          return vis.colorScale(d.data.genre);
        } else {
          return "#ffffff";
        }
      })
      .attr("fill-opacity", (d) => {
        if (d.data.hasOwnProperty("genre")) {
          return 0.3;
        } else if (d.data.hasOwnProperty("GenreMain")) {
          return 0.5;
        }else {
          return 0;
        }
      })
      .attr("stroke", (d) => {
        if (d.data.hasOwnProperty("genre")) {
          return vis.colorScale(d.data.genre);
        } else {
          return "#000000";
        }
      })
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => {
        // Thin stroke = AAA games
        // Thick stroke = indie games
        if (d.data.hasOwnProperty("Genres")) {
          if (d.data.Genres.includes("Indie")) {
            return 2;
          } else {
            return 0.5;
          }
        } else if (d.data.hasOwnProperty("genre")) {
          return 1;
        } else {
          return 0;
        }
      })
      .on("click", function (event, d) {
        vis.clickedEvent(event, d3.selectAll(".node"), this);
      });


    // Labels rendered for genre groups
    vis.nodeLabels = vis.chart
      .append("g")
      .selectAll("text")
      .data(vis.root.descendants().filter((d) => d.data.hasOwnProperty("genre")))
      .join("text")
      .style("font-size", "15px")
      .style("font-family", "Arial, Helvetica, sans-serif")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .attr("fill", "white")
      .attr("fill-opacity", "0.5")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => {
        return `translate(${d.x},${d.y})`;
      })
      .text((d) => d.data.genre);

    // Tooltip
    vis.nodes
      .on("mouseover", (event, d) => {
        if (d.data.hasOwnProperty("title")) {
          d3.select("#tooltip").style("display", "block").html(`
          <div class="tooltip-title">${d.data.title} (${
            d.data.Release_date
          })</div>
          <div><i>${d.data.Developers}, ${d.data.Publishers}</i></div>
          <ul>
            <li><b>Peak CCU</b>: ${d.data.Peak_CCU}</li>
            <li><b>Supported languages</b>: ${d.data.Supported_languages}</li>
            <li><b>Genres</b>: ${d.data.Genres}</li>
            <li><b>Number of related games (by genre)</b>: ${
              d.data.hasOwnProperty("relatedGames") ? d.data.relatedGames : 0
            }</li>
          </ul>
        `);
        }
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });
  }

  // Function to find genre groups
  groupByGenreMain() {
    let vis = this;
    let genres = [];

    vis.grouped = d3.groups(vis.data, (d) => d.GenreMain);
    for (let i = 0; i < vis.grouped.length; i++) {
      genres.push({ genre: vis.grouped[i][0], children: vis.grouped[i][1] });
    }
    return genres;
  }

  // Function to find strong links (games that have > 2 genres in common)
  // Also counts number of strong links each node has
  getWellLinked(data) {
    let linkedGames = [];
    data.forEach((d) => {
      if (d.Genres.length > 2) {
        let matchCount = 0;
        data.forEach((e) => {
          if (e != d) {
            let matchingGenres = 0;
            for (let i = 0; i < d.Genres.length; i++) {
              if (e.Genres.includes(d.Genres[i])) {
                matchingGenres++;
              }
            }
            if (matchingGenres > 2) {
              matchCount++;
              if (!linkedGames.includes(d)) {
                linkedGames.push(d);
              }
            }
          }
        });
        d.relatedGames = matchCount;
      }
    });
    return linkedGames;
  }

  // Click event
  /*
  Handles:
  - Node click status reset/toggle
  - Capping and shuffling node links
  - Link rendering
  - Radar chart rendering
  */
  clickedEvent(event, data, selectedNode) {
    // Get data of each node
    const nodeClick = d3.select(selectedNode);
    const nodeClickX = nodeClick._groups[0][0].__data__.x;
    const nodeClickY = nodeClick._groups[0][0].__data__.y;
    const nodeClickData = nodeClick._groups[0][0].__data__.data;
    const allNodes = data._groups[0];
    const selectedGameId = nodeClickData.app_id;
    this.scatterMatrix.highlightNode(selectedGameId);

    // Reset all nodes status on click
    allNodes.forEach((d) => {
      const node = d3.select(d);
      let nodeData = node._groups[0][0].__data__.data;

      if (nodeData.hasOwnProperty("isClicked") && nodeData.title != nodeClickData.title) {
        nodeData.isClicked = false;
        node.attr("fill-opacity", 0.5);
        this.removeRadarChart();
        d3.selectAll(".link").remove();
      }
    });

    // Set status and apply click changes if not already clicked
    if (nodeClickData.hasOwnProperty("isClicked")) {
        nodeClickData.isClicked = true;
        this.createRadarChart(nodeClickData);

        // Change node opacity on click
        nodeClick.attr("fill-opacity", 5);
        if (nodeClickData.hasOwnProperty("Genres") && Array.isArray(nodeClickData.Genres)) {
          // Find all games that are similar (at least three common genres)
          let related = [];
          allNodes.forEach((comparedNode) => {
            const comparedNodeData = comparedNode.__data__.data;
            if (nodeClick !== comparedNode) {
              if (comparedNodeData.hasOwnProperty("Genres")) {
                const similarGenres = comparedNodeData.Genres.filter((genre) =>
                  nodeClickData.Genres.includes(genre)
                );
                if (similarGenres.length > 2) {
                  if (!related.includes(comparedNode)) {
                    related.push(comparedNode);
                  }
                }
              }
            }
          });

          // Shuffle array order to get different related games each click
          for (let i = related.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [related[i], related[randomIndex]] = [
              related[randomIndex],
              related[i],
            ];
          }

          // Limit related games to 5
          related.splice(10);

          // Render links
          d3.select(".bubble-chart")
            .append("g")
            .selectAll("line")
            .data(related)
            .join("line")
            .attr("class", "link")
            .attr("x1", nodeClickX)
            .attr("y1", nodeClickY)
            .attr("x2", (d) => d.__data__.x)
            .attr("y2", (d) => d.__data__.y)
            .attr("stroke", "black")
            .attr("stroke-width", 1.2)
            .attr("stroke-opacity", 0.5)
            .raise();
          }
    } else {
      if (nodeClickData.hasOwnProperty("isClicked")) {
        nodeClickData.isClicked = false;
        this.removeRadarChart();
        // Change back node opacity on click
        nodeClick.attr("fill-opacity", 0.5);

        // Remove links
        d3.selectAll(".link").remove();
      }
    }
  }

  // Function for rendering radar chart based on clicked node data
  createRadarChart(nodeData) {
    // nodeData = {
    //   Peak_CCU: 13500,
    //   Price: 700,
    //   DLC_count: 1450,
    //   positive_ratio: 91,
    //   User_score: 73,
    //   Average_playtime_forever: 172,
    // };
    console.log("PEAK_CCU:", nodeData["Peak_CCU"]);
    console.log("Price:", nodeData["Price"]);
    console.log("DLC_Count:", nodeData["DLC_count"]);
    console.log("positive_ratio:", nodeData["positive_ratio"]);
    console.log("Supported_languages:", nodeData["Supported_languages"]);
    console.log(nodeData);

    // Assuming radarChart is a global variable or accessible
    this.radarChart = new RadarChart(
      {
        parentElement: "#radar-chart",
      },
      [nodeData] // Pass a single data point for the RadarChart
    );

    this.radarChart.updateVis();
  }

  // Function for removing radar chart upon node deselection
  removeRadarChart() {
    // Assuming radarChart is a global variable or accessible
    d3.select("#radar-chart svg").remove();
  }

  // Function from external click event
  clickedEventFromExternal(gameId) {
    let vis = this;

    const node = vis.chart
      .selectAll(".node")
      .filter((d) => d.data.app_id === gameId)
      .node();

    if (node) {
      vis.clickedEvent(null, d3.selectAll(".node"), node);
    } else {
      console.error("Node not found in PackLayout for gameId:", gameId);
    }
  }

  // Function to reset highlighted nodes
  resetHighlights() {
    let vis = this;
    
    vis.data.forEach((d) => {
      if (d.hasOwnProperty("isClicked")) {
        d.isClicked = false;
      }
    });

    vis.chart.selectAll(".node").attr("fill-opacity", (d) => {
      if (d.data.hasOwnProperty("genre")) {
        return 0.3;
      } else if (d.data.hasOwnProperty("GenreMain")) {
        return 0.5;
      }else {
        return 0;
      }
    });
    d3.selectAll(".link").remove();
  }

  // Function to update data from filter selections
  updateFilteredData(filteredData) {
    let vis = this;

    vis.data = filteredData;

    vis.nodeHierarchy = d3
      .hierarchy({
        children: vis.groupByGenreMain(),
      })
      .sum((d) => vis.radiusScale(d.Peak_CCU));

    vis.updateVis();
  }
}