/**
 * Load data from CSV file asynchronously and render charts
 */

const genrePopularity = [];
let ranking = [];

d3.csv("data/games_radarTest.csv").then((data) => {
  radarChart = new RadarChart(
    {
      parentElement: "#radar-chart",
    },
    data
  );
  radarChart.updateVis();
});

d3.csv("data/games.csv").then((data) => {
  // Convert columns to numerical values and preprocess data
  data.forEach((d) => {
    d.positive_ratio = +d.positive_ratio;
    d.user_reviews = +d.user_reviews;
    d["Release date"] = new Date(d["Release date"]);
    d.Supported_languages = d.Supported_languages.length;
    d.Peak_CCU = +d.Peak_CCU;
    d.Price = +d.Price;
    d.DLC_count = +d.DLC_count;
    d.Average_playtime_forever = +d.Average_playtime_forever;
    d.Metacritic_score = +d.Metacritic_score;

    // Initialise array of genres for each game
    if (Array.isArray(d.Genres)) {
      d.Genres = d.Genres.map((genre) => genre.trim());
    } else if (typeof d.Genres === "string") {
      d.Genres = d.Genres.split(",").map((genre) => genre.trim());
    } else {
      d.Genres = [];
    }

    // Create "Miscellaneous" super category
    const miscGenres = [
      "Animation & Modeling",
      "Audio Production",
      "Design & Illustration",
      "Education",
      "Game Development",
      "Photo Editing",
      "Software Training",
      "Utilities",
      "Video Production",
      "Web Publishing",
    ];

    const misc = "Miscellaneous";

    // Replace genres to "Miscellaneous" for relevant games
    miscGenres.forEach((g) => {
      if (d.Genres.includes(g)) {
        if (!d.Genres.includes(misc)) {
          d.Genres.splice(d.Genres.indexOf(g), 1);
          d.Genres.push(misc);
        } else {
          d.Genres.splice(d.Genres.indexOf(g), 1);
        }
      }
    });

    // Find number of occurrences for each genre across dataset
    d.Genres.forEach((g) => {
      genrePopularity[g] = (genrePopularity[g] || 0) + 1;
    });

    // HTML encoder
    d["About the game"] = decodeHTMLEntities(d["About the game"]);
  });

  // Remove blank genres
  if (genrePopularity.hasOwnProperty("")) {
    delete genrePopularity[""];
  }

  // Determine the main genre of each game
  determineGenres(data);

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

  packLayout = new PackLayout(
    {
      parentElement: "#pack-layout",
    },
    data
  );
  packLayout.updateVis();

  scatterMatrix = new ScatterMatrix(
    {
      parentElement: "#scatter-matrix",
    },
    data
  );
  scatterMatrix.updateVis();

  filterPanel = new FilterPanel(
    {
      parentElement: "#filter-panel",
    },
    data,
    packLayout,
    scatterMatrix
  );
  filterPanel.updateFilters();

  forceGraph = new ForceDirectedGraph(
    {
      parentElement: "#force-graph",
    },
    { nodes: [...uniqueGenres, ...data], links: links }
  );
  forceGraph.updateVis();

  
});

function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function determineGenres(data) {
  // Create genre rankings
  ranking = Object.keys(genrePopularity).sort((a, b) => {
    return genrePopularity[b] - genrePopularity[a];
  });

  // Determine highest ranking genre of each game and assign to array
  data.forEach((d) => {
    let highestRank = 0;
    d.Genres.forEach((g) => {
      if (ranking.indexOf(g) >= highestRank) {
        highestRank = ranking.indexOf(g);
      }
    });
    d.isClicked = false;
    d.GenreMain = ranking[highestRank];
  });
}
