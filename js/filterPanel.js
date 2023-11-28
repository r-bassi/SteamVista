class FilterPanel {
  constructor(_config, _data, _packLayout) {
    this.config = _config;
    this.data = _data;
    this.packLayout = _packLayout;

    this.filters = {
      rating: null,
      Price: [0, 69.99],
      Metacritic_score: [0, 100],
    };

    this.createFilterPanel();
  }

  createFilterPanel() {
    const filterPanel = d3.select(this.config.parentElement);

    const dateRangeFilter = filterPanel.append("div").attr("class", "filter");
    dateRangeFilter.append("label").text("Release Date Range:").append("br");

    dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "startDate")
      .attr("value", "1998-11-08")
      .on("change", () => this.updateFilters());

    const today = new Date().toISOString().split("T")[0]; 
    dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "endDate")
      .attr("value", today)
      .on("change", () => this.updateFilters());

    // Rating filter
    const ratingFilter = filterPanel.append("div").attr("class", "filter");
    ratingFilter.append("label").text("Rating:").append("br");
    const ratingSelect = ratingFilter
      .append("select")
      .attr("id", "rating")
      .on("change", () => this.updateFilters());

    // Add 'All' option for ratings
    ratingSelect.append("option").text("All").attr("value", "All");
    // Add other rating options
    ratingSelect
      .selectAll("option.rating")
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
      .attr("class", "rating")
      .text((d) => d);

    // Set 'All' as the default selection
    ratingSelect.property("value", "All");

    // Price filter
    const priceFilter = filterPanel.append("div").attr("class", "filter");
    priceFilter.append("label").text("Price:").append("br");
    priceFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "priceRange")
      .attr("min", 0)
      .attr("max", 69.99)
      .attr("value", 0)
      .on("input", () => this.updateFilters());
    priceFilter.append("span").attr("id", "priceRangeValue").text("0 - 69.99");

    // Metacritic score filter
    const metacriticFilter = filterPanel.append("div").attr("class", "filter");
    metacriticFilter.append("label").text("Metacritic Score:").append("br");
    metacriticFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "metacriticRange")
      .attr("min", 0)
      .attr("max", 100)
      .attr("value", 0)
      .on("input", () => this.updateFilters());
    metacriticFilter
      .append("span")
      .attr("id", "metacriticRangeValue")
      .text("25 - 75");

    // Initialize filter values
    this.updateFilterValues();
  }

  updateFilters() {
    const selectedRating = d3.select("#rating").property("value");
    this.filters.rating = selectedRating === "All" ? null : selectedRating;
    this.filters.Price = [
      parseFloat(d3.select("#priceRange").property("value")),
      69.99,
    ];
    this.filters.Metacritic_score = [
      parseInt(d3.select("#metacriticRange").property("value")),
      100,
    ];

    const startDate = d3.select("#startDate").property("value");
    const endDate = d3.select("#endDate").property("value");
    this.filters.dateRange = [new Date(startDate), new Date(endDate)];

    this.updateFilterValues();

    this.applyFilters();
  }

  updateFilterValues() {
    d3.select("#priceRangeValue").text(
      `${this.filters.Price[0].toFixed(2)} - ${this.filters.Price[1].toFixed(
        2
      )}`
    );
    d3.select("#metacriticRangeValue").text(
      `${this.filters.Metacritic_score[0]} - ${this.filters.Metacritic_score[1]}`
    );
  }

  applyFilters() {

    const filteredData = this.data.filter((d) => {
      // Handle undefined price
      const price = d.Price !== undefined ? d.Price : 0;

      const matchesRating =
        this.filters.rating === null ||
        (d.rating && d.rating === this.filters.rating);

      const withinPriceRange =
        price >= this.filters.Price[0] && price <= this.filters.Price[1];

      const withinMetacriticScoreRange =
        d.Metacritic_score >= this.filters.Metacritic_score[0] &&
        d.Metacritic_score <= this.filters.Metacritic_score[1];

      const releaseDate = new Date(d.Release_date);
      const withinDateRange =
        (!this.filters.dateRange[0] ||
          releaseDate >= this.filters.dateRange[0]) &&
        (!this.filters.dateRange[1] ||
          releaseDate <= this.filters.dateRange[1]);

      return (
        matchesRating &&
        withinPriceRange &&
        withinMetacriticScoreRange &&
        withinDateRange
      );
    });

    this.packLayout.updateFilteredData(filteredData);
  }
}