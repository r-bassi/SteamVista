/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/games_merged.csv").then((data) => {
  // Convert columns to numerical values
  data.forEach((d) => {
    Object.keys(d).forEach((attr) => {
      // Todo: convert columns to numerical values, preprocess data
    });
  });
});

/*
 * Todo:
 * - initialize views
 * - filter data
 * - listen to events and update views
 * - listen to select box changes
 */
