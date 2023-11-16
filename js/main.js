/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/games.csv").then((data) => {
  // Convert columns to numerical values and preprocess data
  data.forEach((d) => {
    d.positive_ratio = +d.positive_ratio;
    d.user_reviews = +d.user_reviews;
    d["Release date"] = new Date(d["Release date"]);

    if (Array.isArray(d.Genres)) {
      d.Genres = d.Genres.map((genre) => genre.trim());
    } else if (typeof d.Genres === "string") {
      d.Genres = d.Genres.split(",").map((genre) => genre.trim());
    } else {
      d.Genres = [];
    }

    d["About the game"] = decodeHTMLEntities(d["About the game"]);
  });

  // Prepare data for the force-directed graph
  const uniqueGenres = Array.from(new Set(data.flatMap((d) => d.Genres))).map(
    (genre) => ({ id: genre })
  );

  const links = data.flatMap((game) => {
    const gameGenres = game.Genres;

    // Create links only between genres and games that have those genres
    return gameGenres.map((genre) => ({
      source: genre,
      target: game,
    }));
  });

  forceGraph = new ForceDirectedGraph(
    {
      parentElement: "#force-graph",
    },
    { nodes: [...uniqueGenres, ...data], links: links }
  );
  forceGraph.updateVis();

  scatterMatrix = new ScatterMatrix(
    {
      parentElement: "#scatter-matrix",
    },
    data
  );
  scatterMatrix.updateVis();

  radarChart = new RadarChart(
    {
      parentElement: "#radar-chart",
    },
    data
  );
  radarChart.updateVis();
});

function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
