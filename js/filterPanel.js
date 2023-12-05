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
      dateRange: [new Date("1998-11-08"), new Date()],
    };

    this.createFilterPanel();
  }

  createFilterPanel() {
    let vis = this;

    const filterPanelContainer = d3
      .select(vis.config.parentElement)
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
      .on("change", () => vis.updateFilters());

    dateRangeFilter
      .append("input")
      .attr("type", "date")
      .attr("id", "endDate")
      .attr("value", new Date().toISOString().split("T")[0])
      .on("change", () => vis.updateFilters());

    // Rating filter
    const ratingFilter = filterPanelContainer
      .append("div")
      .attr("class", "filter");

    ratingFilter.append("label").text("Rating").append("br");

    const ratingSelect = ratingFilter
      .append("select")
      .attr("id", "rating")
      .on("change", () => vis.updateFilters());

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

    vis.createDualHandleSlider(
      "Price ($USD)",
      [0, 69.99],
      [0, 69.99],
      "priceFilter",
      "Price",
      filterPanelContainer,
      false
    );

    vis.createDualHandleSlider(
      "Metacritic Score",
      [0, 100],
      [0, 100],
      "metacriticFilter",
      "Metacritic_score",
      filterPanelContainer,
      true
    );

    vis.createDualHandleSlider(
      "Positive Ratio",
      [0, 100],
      [0, 100],
      "positiveRatioFilter",
      "positive_ratio",
      filterPanelContainer,
      true
    );

    vis.createDualHandleSlider(
      "User Reviews",
      [0, 7494460],
      [0, 7494460],
      "userReviewsFilter",
      "user_reviews",
      filterPanelContainer,
      true
    );

    vis.createDualHandleSlider(
      "Average Playtime (Hours, Forever)",
      [0, 64973],
      [0, 64973],
      "averagePlaytimeFilter",
      "Average_playtime_forever",
      filterPanelContainer,
      true
    );

    vis.createDualHandleSlider(
      "DLC Count",
      [0, 1555],
      [0, 1555],
      "dlcCountFilter",
      "DLC_count",
      filterPanelContainer,
      true
    );

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
      .on("change", () => vis.updateFilters());

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
  }

  updateFilters() {
    let vis = this;

    const selectedRating = d3.select("#rating").property("value");
    vis.filters.rating = selectedRating === "All" ? null : selectedRating;

    const startDate = d3.select("#startDate").property("value");
    const endDate = d3.select("#endDate").property("value");
    vis.filters.dateRange = [new Date(startDate), new Date(endDate)];

    vis.filters.Supported_languages_list = Array.from(
      d3.select("#supportedLanguages").property("selectedOptions"),
      (option) => option.value
    );

    vis.applyFilters();
  }

  applyFilters() {
    let vis = this;

    const filteredData = vis.data.filter((d) => {
      // Handle undefined price
      const price = d.Price !== undefined ? d.Price : 0;

      const matchesRating =
        vis.filters.rating === null ||
        (d.rating && d.rating === vis.filters.rating);

      const withinPriceRange =
        price >= vis.filters.Price[0] && price <= vis.filters.Price[1];

      const withinMetacriticScoreRange =
        d.Metacritic_score >= vis.filters.Metacritic_score[0] &&
        d.Metacritic_score <= vis.filters.Metacritic_score[1];

      const releaseDate = new Date(d.Release_date);
      const withinDateRange =
        (!vis.filters.dateRange[0] ||
          releaseDate >= vis.filters.dateRange[0]) &&
        (!vis.filters.dateRange[1] ||
          releaseDate <= vis.filters.dateRange[1]);

      const withinPositiveRatioRange =
        d.positive_ratio >= vis.filters.positive_ratio[0] &&
        d.positive_ratio <= vis.filters.positive_ratio[1];

      const withinUserReviewsRange =
        d.user_reviews >= vis.filters.user_reviews[0] &&
        d.user_reviews <= vis.filters.user_reviews[1];

      const withinAveragePlaytimeRange =
        d.Average_playtime_forever >=
          vis.filters.Average_playtime_forever[0] &&
        d.Average_playtime_forever <= vis.filters.Average_playtime_forever[1];

      const withinDlcCountRange =
        d.DLC_count >= vis.filters.DLC_count[0] &&
        d.DLC_count <= vis.filters.DLC_count[1];

      const matchesSupportedLanguages =
        vis.filters.Supported_languages_list.length === 0 ||
        vis.filters.Supported_languages_list.some((lang) =>
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

    vis.packLayout.updateFilteredData(filteredData);
    vis.scatterMatrix.updateFilteredData(filteredData);
  }

  createDualHandleSlider = function (
    labelText,
    range,
    startingRange,
    containerId,
    filterKey,
    filterPanelContainer,
    useIntegers = false
  ) {
    let vis = this;
    
    const sliderContainer = filterPanelContainer
      .append("div")
      .attr("class", "filter")
      .attr("id", containerId);
    sliderContainer.append("label").text(labelText);
    sliderContainer.append("span").attr("id", `${filterKey}Value`);

    const layout = {
      width: 265,
      height: 45,
      margin: { top: 8, right: 60, bottom: 25, left: 23 },
    };
    vis.slider(
      range[0],
      range[1],
      startingRange[0],
      startingRange[1],
      layout,
      (values) => {
        vis.filters[filterKey] = values;
        vis.applyFilters();
      },
      sliderContainer,
      useIntegers
    );
  };

  slider = function (
    min,
    max,
    starting_min,
    starting_max,
    layout,
    callback,
    container,
    useIntegers
  ) {
    let vis = this;

    var range = [min, max];
    var starting_range = [starting_min, starting_max];
    var lastSelection = null;

    // set width and height of svg
    var w = layout.width;
    var h = layout.height;
    var margin = layout.margin;

    // dimensions of slider bar
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    // create x scale
    var x = d3.scaleLinear().domain(range).range([0, width]);

    // create svg and append to provided container
    var svg = container.append("svg").attr("width", w).attr("height", h);
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // labels
    var labelL = g
      .append("text")
      .attr("id", "labelleft")
      .attr("x", 0)
      .attr("y", height + 5);

    var labelR = g
      .append("text")
      .attr("id", "labelright")
      .attr("x", 0)
      .attr("y", height + 5);

    // define brush
    var brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush", function (event) {
        var s = event.selection;
        if (!s) return;
        var minDistance = 1;
        // Prevent collapsing to a single point
        if (s[1] - s[0] < minDistance) {
          if (s[0] === d3.brushSelection(this)[0]) {
            // Right handle moved
            s[1] = s[0] + minDistance;
          } else {
            // Left handle moved
            s[0] = s[1] - minDistance;
          }
          d3.select(this).call(brush.move, s);
        }

        // Convert to integers if specified
        if (useIntegers) {
          var roundedSelection = s.map((d) => Math.round(x.invert(d)));
          if (
            roundedSelection[0] !== Math.round(x.invert(s[0])) ||
            roundedSelection[1] !== Math.round(x.invert(s[1]))
          ) {
            d3.select(vis).call(brush.move, roundedSelection.map(x));
            return; // Exit to prevent further execution and recursion
          }
        }
        // Update labels
        labelL
          .attr("x", s[0])
          .text(
            useIntegers ? Math.round(x.invert(s[0])) : x.invert(s[0]).toFixed(2)
          );
        labelR
          .attr("x", s[1])
          .text(
            useIntegers ? Math.round(x.invert(s[1])) : x.invert(s[1]).toFixed(2)
          );
        // move brush handles
        handle.attr("display", null).attr("transform", function (d, i) {
          return "translate(" + [s[i], -height / 4] + ")";
        });
        // update view
        // if the view should only be updated after brushing is over,
        // move these two lines into the on('end') part below
        var selectedValues = s.map((d) => x.invert(d));
        callback(selectedValues);
      });

    // append brush to g
    var gBrush = g.append("g").attr("class", "brush").call(brush);

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function (d) {
      var e = +(d.type == "e"),
        x = e ? 1 : -1,
        y = height / 2;
      return (
        "M" +
        0.5 * x +
        "," +
        y +
        "A6,6 0 0 " +
        e +
        " " +
        6.5 * x +
        "," +
        (y + 6) +
        "V" +
        (2 * y - 6) +
        "A6,6 0 0 " +
        e +
        " " +
        0.5 * x +
        "," +
        2 * y +
        "Z" +
        "M" +
        2.5 * x +
        "," +
        (y + 8) +
        "V" +
        (2 * y - 8) +
        "M" +
        4.5 * x +
        "," +
        (y + 8) +
        "V" +
        (2 * y - 8)
      );
    };

    var handle = gBrush
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .enter()
      .append("path")
      .attr("class", "handle--custom")
      .attr("stroke", "#000")
      .attr("fill", "#eee")
      .attr("cursor", "ew-resize")
      .attr("d", brushResizePath);

    // override default behaviour - clicking outside of the selected area
    // will select a small piece there rather than deselecting everything
    // https://bl.ocks.org/mbostock/6498000
    gBrush
      .selectAll(".overlay")
      .each(function (d) {
        d.type = "selection";
      })
      .on("mousedown touchstart", brushcentered);

    function brushcentered(event) {
      var dx = x(1) - x(0), // Use a fixed width when recentering.
        cx = d3.pointer(event, vis)[0], // Use d3.pointer instead of d3.mouse
        x0 = cx - dx / 2,
        x1 = cx + dx / 2;
      d3.select(vis.parentNode).call(
        brush.move,
        x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
      );
    }


    // select entire range
    gBrush.call(brush.move, starting_range.map(x));

    return svg.node();
  };
}