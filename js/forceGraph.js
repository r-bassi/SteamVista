class ForceDirectedGraph {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 800,
      containerHeight: 600,
      margin: { top: 25, right: 20, bottom: 20, left: 35 },
    };
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    vis.config.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;

    vis.config.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    vis.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(vis.config.width / 2, vis.config.height / 2)
      );

    vis.genres = vis.data.nodes.filter(
      (node) => !node.Genres || node.Genres.length === 0
    );

    vis.games = vis.data.nodes.filter(
      (node) => node.Genres && node.Genres.length > 0
    );

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    vis.genres = vis.genres.filter(
      (d) => d.id !== undefined && d.id !== null && d.id !== ""
    );

    vis.games = vis.games.filter(
      (d) => d.id !== undefined && d.id !== null && d.id !== ""
    );
    
    const allNodes = [...vis.genres, ...vis.games];
    
    vis.simulation.nodes(allNodes);
    
    vis.colorScale.domain(vis.genres.map((d) => d.id));
    
    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;
    
    const genreNodes = vis.chart
      .selectAll(".genre-node")
      .data(vis.genres, (d) => d.id)
      .join("circle")
      .attr("class", "genre-node")
      .attr("r", 10)
      .attr("fill", (d) => vis.colorScale(d.id))
      .on("click", (event, d) => vis.filterDataByGenre(d.id));
    
    const genreLabels = vis.chart
      .selectAll(".genre-label")
      .data(vis.genres, (d) => d.id)
      .join("text")
      .attr("class", "genre-label")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .text((d) => d.id);
    
    const gameNodes = vis.chart
      .selectAll(".game-node")
      .data(vis.games, (d) => d.id)
      .join("circle")
      .attr("class", "game-node")
      .attr("r", 5)
      .attr("fill", "gray")
      .on("click", (event, d) => {});
  
    const gameLabels = vis.chart
      .selectAll(".game-label")
      .data(vis.games, (d) => d.id)
      .join("text")
      .attr("class", "game-label")
      .attr("dy", 15)
      .attr("text-anchor", "middle")
      .text((d) => d.title);

    vis.simulation.on("tick", () => {
      genreNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      genreLabels.attr("x", (d) => d.x).attr("y", (d) => d.y);
      gameNodes
        .attr("cx", (d) => Math.max(0, Math.min(vis.config.width, d.x)))
        .attr("cy", (d) => Math.max(0, Math.min(vis.config.height, d.y)));
      gameLabels
        .attr("x", (d) => Math.max(0, Math.min(vis.config.width, d.x)))
        .attr("y", (d) => Math.max(0, Math.min(vis.config.height, d.y)));
    });
  }

  filterDataByGenre(genreId) {
    let vis = this;
  
    vis.simulation.stop();
  
    const filteredGames = vis.data.nodes.filter((node) => {
    const hasGenre = node.Genres && node.Genres.includes(genreId);
    const hasAppId = node.app_id;
      return hasGenre && hasAppId;
    });

    vis.chart.selectAll(".genre-node").remove();
    vis.chart.selectAll(".genre-label").remove();
    
    vis.simulation = d3
      .forceSimulation(filteredGames)
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(vis.config.width / 2, vis.config.height / 2)
      );
    
    const gameNodes = vis.chart
      .selectAll(".game-node")
      .data(filteredGames, (d) => d.id)
      .join("circle")
      .attr("class", "game-node")
      .attr("r", 5)
      .attr("fill", "gray")
      .on("click", (event, d) => {});
  
    const gameLabels = vis.chart
      .selectAll(".game-label")
      .data(filteredGames, (d) => d.title)
      .join("text")
      .attr("class", "game-label")
      .attr("dy", 15)
      .attr("text-anchor", "middle")
      .text((d) => d.title);
    
      vis.simulation.on("tick", () => {
      gameNodes
        .attr("cx", (d) => Math.max(0, Math.min(vis.config.width, d.x)))
        .attr("cy", (d) => Math.max(0, Math.min(vis.config.height, d.y)));
      gameLabels
        .attr("x", (d) => Math.max(0, Math.min(vis.config.width, d.x)))
        .attr("y", (d) => Math.max(0, Math.min(vis.config.height, d.y)));
    });
  }
}
