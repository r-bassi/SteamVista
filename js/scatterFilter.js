class ScatterFilter {
  constructor(_config, _data, _scatterMatrix) {
    this.config = _config;
    this.data = _data;
    this.scatterMatrix = _scatterMatrix;

    this.filters = {
      dateRange: [new Date(1970, 1, 1), new Date()],
      rating: null,
      price: [0, 999.99],
      metacriticScore: [0, 100],
    };

    this.createScatterFilter();
  }

  createScatterFilter() {
    const filterPanel = d3.select(this.config.parentElement);

    // Rating filter
    const ratingFilter = filterPanel.append("div").attr("class", "filter");
    ratingFilter.append("label").text("Release Date:").append("br");
    ratingFilter
      .append("select")
      .attr("id", "rating")
      .on("change", () => this.updateFilters())
      .selectAll("option")
      .data([
        "Overwhelmingly Positive",
        "Very Positive",
        "Mostly Positive",
        "Positive",
        "Mixed",
        "Negative",
        "Mostly Negative",
      ])
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
    this.filters.dateRange = [
      new Date(d3.select("#startDate").property("value")),
      new Date(d3.select("#endDate").property("value")),
    ];
    this.filters.rating =
      d3.select("#rating").property("value") || "Overwhelmingly Positive";
    this.filters.price = [
      parseFloat(d3.select("#priceRange").property("value")),
      1000.0,
    ];
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
      const matchesRating =
        this.filters.rating === null ||
        (d.rating &&
          d.rating.toLowerCase() === this.filters.rating.toLowerCase());

      const withinMetacriticScoreRange =
        d.metacritic_score >= this.filters.metacriticScore[0] &&
        d.metacritic_score <= this.filters.metacriticScore[1];

      return matchesRating && withinMetacriticScoreRange;
    });

    this.packLayout.updateFilteredData(filteredData);
  }
}
