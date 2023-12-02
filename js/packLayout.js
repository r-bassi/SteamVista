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
        bottom: 150,
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

    vis.getWellLinked(vis.data);
    // let mostLinks = 0;
    // let mostLinked = {};
    // linkList.forEach(d => {
    //   if (d.relatedGames > mostLinks) {
    //     mostLinks = d.relatedGames;
    //     mostLinked = d;
    //   }
    // })
    // console.log(linkList);
    // console.log(mostLinks);
    // console.log(mostLinked);

    // Create hierarchy based off genre and each game's peak CCU
    vis.nodeHierarchy = d3
      .hierarchy({
        children: vis.genreMainGroups,
      })
      .sum((d) => d.Peak_CCU);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Set pack parameters
    vis.pack = d3
      .pack()
      .size([vis.config.width + 100, vis.config.height + 180])
      .padding(5);

    vis.root = vis.pack.padding(3)(vis.nodeHierarchy);

    // Color scale domain set for available genres
    vis.colorScale.domain(ranking);

    // ranking.forEach(d => {
    //   console.log(d + ": " + vis.colorScale(d));
    // })

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll("*").remove();

    const leafNodes = vis.root.leaves();

    vis.chart
      .append("g")
      .selectAll(".node")
      .data(leafNodes, (d) => d.data.app_id)
      .join("circle")
      .attr("class", "node")
      .attr("r", (d) => (isNaN(d.r) ? 0 : d.r))
      .attr("cx", (d) => d.x - 100)
      .attr("cy", (d) => d.y - 30)
      .attr("fill", (d) =>
        d.data.hasOwnProperty("GenreMain")
          ? vis.colorScale(d.data.GenreMain)
          : "#ffffff"
      )
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#000000")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) =>
        d.data.hasOwnProperty("Genres") && d.data.Genres.includes("Indie")
          ? 2
          : 0.5
      );

    // Labels for games with Peak_CCU > 100,000
    vis.chart
      .append("g")
      .selectAll(".label")
      .data(leafNodes.filter((d) => d.data.Peak_CCU > 100000))
      .join("text")
      .attr("class", "label")
      .style("font", "12px Noto Sans JP")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${d.x - 100},${d.y - 30})`)
      .text((d) => d.data.title);
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

  updateVis() {
    let vis = this;

    // Set pack parameters
    vis.pack = d3
      .pack()
      .size([vis.config.width + 100, vis.config.height + 180])
      .padding(5);

    vis.root = vis.pack.padding(3)(vis.nodeHierarchy);

    // Color scale domain set for available genres
    vis.colorScale.domain(ranking);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll("*").remove();

    const leafNodes = vis.root.leaves();

    // Labels for games with Peak_CCU > 100,000
    vis.chart
      .append("g")
      .selectAll(".label")
      .data(leafNodes.filter((d) => d.data.Peak_CCU > 100000))
      .join("text")
      .attr("class", "label")
      .style("font", "12px Noto Sans JP")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${d.x - 100},${d.y - 30})`)
      .text((d) => d.data.title);

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
      .attr("cx", (d) => d.x - 100)
      .attr("cy", (d) => d.y - 30)
      .attr("fill", (d) => {
        if (d.data.hasOwnProperty("GenreMain")) {
          return vis.colorScale(d.data.GenreMain);
        } else {
          return "#ffffff";
        }
      })
      .attr("fill-opacity", 0.3) // Change opacity on hover/click?
      .attr("stroke", (d) => {
        if (d.data.hasOwnProperty("genre")) {
          return vis.colorScale(d.data.genre);
        } else {
          return "#000000";
        }
      })
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => {
        // No stroke = AAA games
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

    // Labels rendered for games with Peak_CCU > 100,000
    vis.nodeLabels = vis.chart
      .append("g")
      .selectAll("text")
      .data(vis.root.descendants().filter((d) => d.data.Peak_CCU > 100000))
      .join("text")
      .style("font", "12px Noto Sans JP")
      .attr("text-anchor", "middle")
      .attr("transform", (d) => {
        return `translate(${d.x - 100},${d.y - 30})`;
      })
      .text((d) => d.data.title);

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

  // Function to find all nodes with strong links
  // Also counts number of strong links for each node
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

  clickedEvent(event, data, selectedNode) {
    const nodeClick = d3.select(selectedNode);
    const nodeClickX = nodeClick._groups[0][0].__data__.x;
    const nodeClickY = nodeClick._groups[0][0].__data__.y;
    const nodeClickData = nodeClick._groups[0][0].__data__.data;
    const allNodes = data._groups[0];

    const selectedGameId = nodeClickData.app_id;
    this.scatterMatrix.highlightNode(selectedGameId);

    allNodes.forEach((d) => {
      const node = d3.select(d);
      let nodeData = node._groups[0][0].__data__.data;

      if (nodeData.title != nodeClickData.title) {
        nodeData.isClicked = false;
        node.attr("fill-opacity", 0.3);
        this.removeRadarChart();
        d3.selectAll(".link").remove();
      }
    });

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
          related.splice(5);

          // Render links
          d3.select(".bubble-chart")
            .append("g")
            .selectAll("line")
            .data(related)
            .join("line")
            .attr("class", "link")
            .attr("x1", nodeClickX - 100)
            .attr("y1", nodeClickY - 30)
            .attr("x2", (d) => d.__data__.x - 100)
            .attr("y2", (d) => d.__data__.y - 30)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.5)
            .raise();
          }
      } else {
        nodeClickData.isClicked = false;
        this.removeRadarChart();
        // Change back node opacity on click
        nodeClick.attr("fill-opacity", 0.3);

        // Remove links
        d3.selectAll(".link").remove();
      }
    }

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

  removeRadarChart() {
    // Assuming radarChart is a global variable or accessible
    // Remove the RadarChart
    d3.select("#radar-chart svg").remove();
  }

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

  resetHighlights() {
    let vis = this;
    
    vis.data.forEach((d) => {
      if (d.hasOwnProperty("isClicked")) {
        d.isClicked = false;
      }
    });

    vis.chart.selectAll(".node").attr("fill-opacity", 0.3);
    d3.selectAll(".link").remove();
  }

  updateFilteredData(filteredData) {
    let vis = this;

    vis.data = filteredData;

    vis.nodeHierarchy = d3
      .hierarchy({
        children: vis.groupByGenreMain(),
      })
      .sum((d) => d.Peak_CCU);

    vis.updateVis();
  }
}
