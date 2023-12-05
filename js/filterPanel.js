class FilterPanel {
  constructor(_config, _data, _packLayout, _scatterMatrix) {
    this.config = _config;
    this.data = _data;
    this.packLayout = _packLayout;
    this.scatterMatrix = _scatterMatrix;

    this.filters = {
      rating: null,
      Price: [0, 69.99],
      Metacritic_score: [0, 100],
      positive_ratio: [0, 100],
      user_reviews: [0, 7494460],
      Average_playtime_forever: [0, 64973],
      DLC_count: [0, 1555],
      Supported_languages_list: [],
    };

    this.createFilterPanel();
  }

  createFilterPanel() {
    const filterPanelContainer = d3
      .select(this.config.parentElement)
      .append("div")
      .attr("class", "filter-panel");

    // Date range filter
    const dateRangeFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    dateRangeFilter.append("label").text("Release Date Range").append("br");

    dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "startDate")
      .attr("value", "1998-11-08")
      .on("change", () => this.updateFilters());

    dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "endDate")
      .attr("value", new Date().toISOString().split("T")[0])
      .on("change", () => this.updateFilters());

    // Rating filter
    const ratingFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    ratingFilter.append("label").text("Rating").append("br");

    const ratingSelect = ratingFilter
      .append("select")
      .attr("id", "rating")
      .on("change", () => this.updateFilters());

    ratingSelect.append("option").text("All").attr("value", "All");

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

    ratingSelect.property("value", "All");

    // Price filter
    const priceFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    priceFilter.append("label").text("Price").append("br");

    priceFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "priceRange")
      .attr("min", 0)
      .attr("max", 69.99)
      .attr("step", 0.01)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    priceFilter.append("span").attr("id", "priceRangeValue").text("0 - 69.99");

    // Metacritic score filter
    const metacriticFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    metacriticFilter.append("label").text("Metacritic Score").append("br");

    metacriticFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "metacriticRange")
      .attr("min", 0)
      .attr("max", 100)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    metacriticFilter.append("span").attr("id", "metacriticRangeValue");

    // Positive Ratio Filter
    const positiveRatioFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    positiveRatioFilter.append("label").text("Positive Ratio").append("br");

    positiveRatioFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "positiveRatioRange")
      .attr("min", 0)
      .attr("max", 100)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    positiveRatioFilter
      .append("span")
      .attr("id", "positiveRatioRangeValue")
      .text("0 - 100");

    // User Reviews Filter
    const userReviewsFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    userReviewsFilter.append("label").text("User Reviews").append("br");

    userReviewsFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "userReviewsRange")
      .attr("min", 0)
      .attr("max", 7494460)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    userReviewsFilter
      .append("span")
      .attr("id", "userReviewsRangeValue")
      .text("0 - 7494460");

    // Average Playtime (Forever) Filter
    const averagePlaytimeFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    averagePlaytimeFilter
      .append("label")
      .text("Average Playtime (Hours, Forever)")
      .append("br");

    averagePlaytimeFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "averagePlaytimeRange")
      .attr("min", 0)
      .attr("max", 64973)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    averagePlaytimeFilter
      .append("span")
      .attr("id", "averagePlaytimeRangeValue")
      .text("0 - 64973");

    // DLC Count Filter
    const dlcCountFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    dlcCountFilter.append("label").text("DLC Count").append("br");

    dlcCountFilter
      .append("input")
      .attr("type", "range")
      .attr("id", "dlcCountRange")
      .attr("min", 0)
      .attr("max", 1555)
      .attr("value", 0)
      .on("input", () => this.updateFilters());

    dlcCountFilter
      .append("span")
      .attr("id", "dlcCountRangeValue")
      .text("0 - 1555");

    // Supported Languages Filter
    const supportedLanguagesFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");
      
    supportedLanguagesFilter
      .append("label")
      .text("Supported Languages")
      .append("br");
      
    const supportedLanguagesSelect = supportedLanguagesFilter
      .append("select")
      .attr("multiple", true)
      .attr("id", "supportedLanguages")
      .on("change", () => this.updateFilters());
      
    supportedLanguagesSelect
      .selectAll("option")
      .data([
        "Arabic",
        "Belarusian",
        "Bulgarian",
        "Croatian",
        "Czech",
        "Danish",
        "Dutch",
        "English",
        "Estonian",
        "Finnish",
        "French",
        "German",
        "Greek",
        "Hebrew",
        "Hindi",
        "Hungarian",
        "Indonesian",
        "Italian",
        "Japanese",
        "Korean",
        "Macedonian",
        "Norwegian",
        "Polish",
        "Portuguese",
        "Portuguese - Brazil",
        "Portuguese - Portugal",
        "Romanian",
        "Russian",
        "Serbian",
        "Simplified Chinese",
        "Slovak",
        "Slovakian",
        "Spanish - Latin America",
        "Spanish - Spain",
        "Swedish",
        "Thai",
        "Traditional Chinese",
        "Traditional Chinese (text only)",
        "Turkish",
        "Ukrainian",
        "Vietnamese",
      ])
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

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

    this.filters.positive_ratio = [
      parseInt(d3.select("#positiveRatioRange").property("value")),
      100,
    ];

    this.filters.user_reviews = [
      parseInt(d3.select("#userReviewsRange").property("value")),
      7494460,
    ];

    this.filters.Average_playtime_forever = [
      parseInt(d3.select("#averagePlaytimeRange").property("value")),
      64973,
    ];

    this.filters.DLC_count = [
      parseInt(d3.select("#dlcCountRange").property("value")),
      1555,
    ];

    this.filters.Supported_languages_list = 
      Array.from(d3.select("#supportedLanguages").property("selectedOptions"),
      (option) => option.value
  );

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

      const withinPositiveRatioRange =
        d.positive_ratio >= this.filters.positive_ratio[0] &&
        d.positive_ratio <= this.filters.positive_ratio[1];

      const withinUserReviewsRange =
        d.user_reviews >= this.filters.user_reviews[0] &&
        d.user_reviews <= this.filters.user_reviews[1];

      const withinAveragePlaytimeRange =
        d.Average_playtime_forever >=
          this.filters.Average_playtime_forever[0] &&
        d.Average_playtime_forever <= this.filters.Average_playtime_forever[1];

      const withinDlcCountRange =
        d.DLC_count >= this.filters.DLC_count[0] &&
        d.DLC_count <= this.filters.DLC_count[1];

      const matchesSupportedLanguages =
        this.filters.Supported_languages_list.length === 0 ||
        this.filters.Supported_languages_list.some((lang) =>
          d.Supported_languages_list.includes(lang)
        );


      return (
        matchesRating &&
        withinPriceRange &&
        withinMetacriticScoreRange &&
        withinDateRange &&
        withinPositiveRatioRange &&
        withinUserReviewsRange &&
        withinAveragePlaytimeRange &&
        withinDlcCountRange &&
        matchesSupportedLanguages
      );
    });

    this.packLayout.updateFilteredData(filteredData);
    this.scatterMatrix.updateFilteredData(filteredData);
  }
}