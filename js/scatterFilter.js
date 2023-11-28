class ScatterFilter {
  constructor(_config, _data, _scatterMatrix) {
    this.config = _config;
    this.data = _data;
    this.scatterMatrix = _scatterMatrix;

    this.filters = {
      date: null,
      metacriticScore: [0, 100],
    };

    this.createScatterFilter();
  }

  createScatterFilter() {
    const filterPanel = d3.select(this.config.parentElement);

    // Rating filter
    const dateFilter = filterPanel.append("div").attr("class", "filter");
    dateFilter.append("label").text("Release Date:").append("br");
    dateFilter
      .append("select")
      .attr("id", "date")
      .on("change", () => this.updateFilters())
      .selectAll("option")
      .data(["Q1", "Q2", "Q3", "Q4"])
      .enter()
      .append("option")
      .text((d) => d);

    // Metacritic score filter
    const metacriticFilter = filterPanel.append("div").attr("class", "filter");
    metacriticFilter.append("label").text("Metacritic Score:").append("br");
    metacriticFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "metacriticRange")
      .attr("min", 0)
      .attr("max", 100)
      .on("input", () => this.updateFilters());
    metacriticFilter
      .append("span")
      .attr("id", "metacriticRangeValue")
      .text("25 - 75");

    // Initialize filter values
    this.updateFilterValues();
  }

  updateFilters() {
    // Update filter values based on user input
    this.filters.date =
      d3.select("#date").property("value") || "Overwhelmingly Positive";
    this.filters.metacriticScore = [
      parseInt(d3.select("#metacriticRange").property("value")),
      100,
    ];

    // console.log("Updated Filters:", this.filters);

    this.updateFilterValues();

    this.applyFilters();
  }

  updateFilterValues() {
    d3.select("#metacriticRangeValue").text(
      `${this.filters.metacriticScore[0]} - ${this.filters.metacriticScore[1]}`
    );
  }

  applyFilters() {
    // console.log("Current Filters:", this.filters);

    const filteredData = this.data.filter((d) => {
      // TODO: Filter by date
      const matchesDate =
        this.filters.rating === null ||
        (d.rating &&
          d.rating.toLowerCase() === this.filters.rating.toLowerCase());

      const withinMetacriticScoreRange =
        d.metacritic_score >= this.filters.metacriticScore[0] &&
        d.metacritic_score <= this.filters.metacriticScore[1];

      return matchesDate && withinMetacriticScoreRange;
    });

    this.scatterMatrix.updateFilteredData(filteredData);
  }
}
