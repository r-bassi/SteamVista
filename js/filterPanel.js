class FilterPanel {
  constructor(_config, _data, _packLayout) {
    this.config = _config;
    this.data = _data;
    this.packLayout = _packLayout;

    this.filters = {
      dateRange: [new Date(1970, 1, 1), new Date()],
      rating: null,
      price: [0, 999.99],
      metacriticScore: [0, 100],
    };

    this.createFilterPanel();
  }

  createFilterPanel() {
    const filterPanel = d3.select(this.config.parentElement);

    const dateRangeFilter = filterPanel.append("div").attr("class", "filter");
    dateRangeFilter.append("label").text("Release Date Range:").append("br");

    const startDateInput = dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "startDate")
      .on("change", () => this.updateFilters());

    startDateInput.node().valueAsDate = this.filters.dateRange[0];

    const endDateInput = dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "endDate")
      .on("change", () => this.updateFilters());

    endDateInput.node().valueAsDate = this.filters.dateRange[1]; 

    // Rating filter
    const ratingFilter = filterPanel.append("div").attr("class", "filter");
    ratingFilter.append("label").text("Rating:").append("br");
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

    // Price filter
    const priceFilter = filterPanel.append("div").attr("class", "filter");
    priceFilter.append("label").text("Price:").append("br");
    priceFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "priceRange")
      .attr("min", 0)
      .attr("max", 999.99)
      .on("input", () => this.updateFilters());
    priceFilter.append("span").attr("id", "priceRangeValue").text("0 - 500.00");

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
    d3.select("#priceRangeValue").text(
      `${this.filters.price[0].toFixed(2)} - ${this.filters.price[1].toFixed(
        2
      )}`
    );
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

      const withinDateRange =
        d["Release date"].getTime() >= this.filters.dateRange[0].getTime() &&
        d["Release date"].getTime() <= this.filters.dateRange[1].getTime();

      const withinPriceRange =
        d.price >= this.filters.price[0] && d.price <= this.filters.price[1];

      const withinMetacriticScoreRange =
        d.metacritic_score >= this.filters.metacriticScore[0] &&
        d.metacritic_score <= this.filters.metacriticScore[1];

      // console.log("Title:", d.title); // Log the title for easier identification
      // console.log("Rating:", d.rating);
      // console.log("Price:", d.price);
      // console.log("Metacritic Score:", d.metacritic_score);
      // console.log("Date Range:", withinDateRange);
      // console.log("Rating:", matchesRating);
      // console.log("Price Range:", withinPriceRange);
      // console.log("Metacritic Score Range:", withinMetacriticScoreRange);

      return (
        withinDateRange &&
        matchesRating &&
        withinPriceRange &&
        withinMetacriticScoreRange
      );
    });

    // console.log("Filtered Data:", filteredData);

    this.packLayout.updateFilteredData(filteredData);
  }
}