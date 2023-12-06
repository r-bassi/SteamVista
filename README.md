# SteamVista: A Visual Journey Through Gaming Trends

_Note: This was meant to be viewed on a 2560x1440 screen. Please resize your browser window to fit this aspect ratio for the best experience._

## Overview

For industry analysts, navigating the labyrinth of the Steam gaming market presents a challenge. Amidst the expanding array of titles on the platform, deciphering strategic opportunities becomes both time-consuming and mentally taxing. This visualization can provide invaluable insights into consumer behaviour, market trends, and the current competitive landscape. Steam is one of the largest digital distribution platforms for PC gaming, with millions of users and a vast library of games. With this data visualization, they can make informed strategic decisions, such as targeting specific player demographics or recommend adjusting game development strategies to cater to emerging trends. For industry analysts, these visualizations offer the opportunity to study and understand the gaming market in-depth, making it easier to predict future trends and evaluate the performance of various titles. Ultimately, this tool has the potential to empower the gaming industry with actionable data insights that could enhance the overall gamer experience.

## Usage Scenario

Joe is a game industry professional who is looking to discover the most well-reviewed, affordable recent games as market research and for possible game ideas. When he opens the app he wants an overview of all the games available, so he looks at the force-directed network visualization of all the games in the dataset. Since he cares about affordability and also only wants to see the latest highly rated games, he’s able to use sliders to adjust price range, release date range, and rating range. By setting the filters, he can see the latest titles in the market - including their rating, price, genre, and more.

Later, Joe decides he wants to make a game of his own, and wants to figure out the optimal price/monetization strategy for his new game. Within the app he is able to see a histogram of different price points aggregated to certain ranges next to the main overview (and how popular they are). He is then able to click on any particular price point, and all views would filter to show only games within that price range. He could then switch the side view from a histogram to another view displaying a radar chart, comparing various attributes that make games successful like user scores or ratings (filtered for his chosen price point). This way he could explore which price points are most successful. He also wants to see if he should invest in multi-language support, so he goes back to the histogram view which shows the number of game owners with different numbers of languages supported. This lets him see how popular multi-language support is, and whether he should add them to his new game. When he pitches his idea for his game to a publisher, the publisher tells him to explore the competitive landscape to understand other successful games. Joe wants to see if there are any patterns with popular games over time, so he looks at both the radar chart view for what makes successful games, as well as switching to a line chart view which shows peak CCU and ownership over time. He is able to detect any trends that might factor into his upcoming game’s success, as well as identify in general what genres are succeeding or failing over time. This analysis helps Joe determine how best to publish his upcoming game.

## References

- https://observablehq.com/@d3/brushable-scatterplot-matrix - adapted some code for scatterplot matrix
- https://observablehq.com/@johnhaldeman/tutorial-on-d3-basics-and-circle-packing-heirarchical-bubb - adapted some code for pack layout (bubble chart)
- https://observablehq.com/@d3/zoomable-circle-packing - adapted zoom in function for genre groups
- https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array - shuffling array using Fisher-Yates shuffle
- https://colorswall.com/palette/193 - steam color palette for background
- https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush - adapted dual handle filter range sliders
- https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a - slider handles used by dual handles' source
- https://bl.ocks.org/mbostock/6498000 - brush overriding behaviour for the dual handle filter range sliders
- https://www.favicon.cc/?action=icon&file_id=694 - steam favicon
- https://stackoverflow.com/questions/74406811/d3-js-spider-radar-chart-multiple-scales-on-axes - adapted code for radar chart
