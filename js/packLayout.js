class PackLayout {
    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 1000,
        containerHeight: 1000,
        margin: {
          top: 5,
          right: 20,
          bottom: 5,
          left: 35,
        },
      };
      this.data = _data;
      this.initVis();
    }
  
    initVis() {
      let vis = this;
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.config.height =  vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // Initialize color scale
      vis.colorScale = d3.scaleOrdinal()
        .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928", "#df0ce9"]);

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
        .attr(
          "transform",
          `translate(${vis.config.margin.left},${vis.config.margin.top - 30})`
          );

      // Find genre groups
      vis.genreMainGroups = vis.groupByGenreMain();

      // Create hierarchy based off genre and each game's peak CCU
      vis.nodeHierarchy = d3.hierarchy({
        children: vis.genreMainGroups
      })
      .sum(d => d.Peak_CCU);

      vis.updateVis();
    }
  
    updateVis() {
      let vis = this;

      // Set pack parameters
      vis.pack = d3.pack()
          .size([vis.config.width + 100, vis.config.height + 180])
          .padding(5);

      vis.root = vis.pack.padding(3)(vis.nodeHierarchy);
      
      // Color scale domain set for available genres
      vis.colorScale.domain(ranking);

      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;

      const nodes = vis.chart.append("g").selectAll(".nodes")
          .data(vis.root.descendants())
        .join("circle")
          .attr("r", d => d.r)
          .attr("cx", d => d.x - 100)
          .attr("cy", d => d.y - 30)
          .attr("fill", d => {
            if (d.data.hasOwnProperty("GenreMain")) {
              return vis.colorScale(d.data.GenreMain);
            } else {
              return "#ffffff";
            }
          })
          .attr("fill-opacity", 0.8)                // Change opacity on hover/click?
          .attr("stroke", "#000000")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-width", d => {
            // No stroke = AAA games
            // Thick stroke = indie games
            if (d.data.hasOwnProperty("Genres")) {
              if (d.data.Genres.includes("Indie")) {
                return 2;
              } else {
                return 0.5;
              }
            } else {
              return 0;
            }
          });

      // Labels rendered for games with Peak_CCU > 100,000
      const nodeLabels = vis.chart.append("g").selectAll("text")
          .data(vis.root.descendants().filter(d => d.data.Peak_CCU > 100000))
        .join("text")
          .style("font", "12px Noto Sans JP")
          .attr("text-anchor", "middle")
          .attr("transform", d => {return `translate(${d.x - 100},${d.y - 30})`})
          .text(d => d.data.title);
    }

    // Function to find genre groups
    groupByGenreMain() {
      let vis = this;
      let genres = [];

      vis.grouped = d3.groups(vis.data, d => d.GenreMain);
      for (let i = 0; i < vis.grouped.length; i++) {
        genres.push({genre: vis.grouped[i][0], children: vis.grouped[i][1]});
      }
      return genres;
    }
  }