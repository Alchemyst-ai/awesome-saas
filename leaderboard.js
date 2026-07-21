/**
 * Fetches and processes repository data to create a contributor leaderboard
 */

/**
 * Creates a map of contributors and their repository statistics
 * @param {Object[]} repos - Array of repository data from GitHub API
 * @returns {Map} - Map of contributors and their stats
 */
const processContributorStats = (repos) => {
  const contributorStats = new Map();

  repos.forEach(repo => {
    if (!repo.topics.includes("alchemyst-awesome-saas")) return;

    const owner = repo.owner.login;
    if (owner.toLowerCase() === 'alchemyst-ai') return; // Skip official repos

    const currentStats = contributorStats.get(owner) || {
      repos: [],
      totalStars: 0,
      profile: `https://github.com/${owner}`
    };

    currentStats.repos.push({
      name: repo.full_name,
      stars: repo.stargazers_count,
      url: repo.html_url
    });
    currentStats.totalStars += repo.stargazers_count;

    contributorStats.set(owner, currentStats);
  });

  return contributorStats;
};

/**
 * Generates a badge for top contributors
 * @param {number} position - Rank position of the contributor
 * @param {number} totalStars - Total number of stars
 * @returns {string} - Badge markdown string
 */
const generateContributorBadge = (position, totalStars) => {
  let badgeColor = "";
  let badgeLabel = "";
  
  if (position === 1) {
    badgeColor = "FFD700"; // Gold
    badgeLabel = "🏆 Top Contributor";
  } else if (position === 2) {
    badgeColor = "C0C0C0"; // Silver
    badgeLabel = "🥈 Silver Contributor";
  } else if (position === 3) {
    badgeColor = "CD7F32"; // Bronze
    badgeLabel = "🥉 Bronze Contributor";
  } else if (totalStars >= 10) {
    badgeColor = "9F2B68"; // Purple
    badgeLabel = "⭐ Rising Star";
  }
  
  return badgeColor ? `![${badgeLabel}](https://img.shields.io/badge/${encodeURIComponent(badgeLabel)}-${badgeColor}?style=flat-square)` : "";
};

/**
 * Creates the leaderboard markdown string
 * @param {Map} contributorStats - Map of contributor statistics
 * @returns {string} - Formatted markdown string
 */
const createLeaderboardString = (contributorStats) => {
  const sortedContributors = [...contributorStats.entries()]
    .sort((a, b) => b[1].totalStars - a[1].totalStars);

  let leaderboardString = `# Alchemyst Platform Community Leaderboard\n\n`;
  leaderboardString += `Recognition for our amazing community of **${sortedContributors.length}** contributors! 🏆\n\n`;
  leaderboardString += `## Top Contributors\n\n`;
  leaderboardString += `<div align="center">\n\n`;
  
  // Add badges for top 3 contributors
  sortedContributors.slice(0, 3).forEach((contrib, idx) => {
    const badge = generateContributorBadge(idx + 1, contrib[1].totalStars);
    if (badge) {
      leaderboardString += `${badge}\n`;
    }
  });
  
  leaderboardString += `\n</div>\n\n`;
  leaderboardString += `| **Rank** | **Contributor** | **Projects** | **Total Stars** |\n`;
  leaderboardString += `| -------------- | -------------- | ------------ | --------------- |\n`;

  sortedContributors.forEach(([contributor, stats], idx) => {
    const projectsList = stats.repos
      .map((repo) => {
        return `[${repo.name}](${repo.url}) (⭐${repo.stars})`
      })
      .join(', ');

    let position = idx + 1;

    const badge = generateContributorBadge(position, stats.totalStars);
    const displayPosition = position <= 3 ? ["🥇", "🥈", "🥉"][position - 1] : "🌟";
    const positionDisplay = `${displayPosition} ${position}`;
    const badgeDisplay = badge ? `${badge} ` : "";
    
    leaderboardString += `| ${positionDisplay} | ${badgeDisplay}[${contributor}](${stats.profile}) | ${projectsList} | ${stats.totalStars} |\n`;
  });

  return leaderboardString;
};

/**
 * Main function to fetch data and generate leaderboard
 */
const generateLeaderboard = async () => {
  try {
    const response = await fetch(
      "https://api.github.com/search/repositories?q=topic:alchemyst-awesome-saas"
    );
    const data = await response.json();
    const repos = data.items || [];

    const contributorStats = processContributorStats(repos);
    const leaderboardString = createLeaderboardString(contributorStats);

    console.log(leaderboardString);
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return "An error occurred while generating the leaderboard. Please try again later.";
  }
};

generateLeaderboard();