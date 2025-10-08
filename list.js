/**
 * @param {string[]} tags
 * @returns {string}
 */
const processTags = (tags) => {
  return tags
    .filter((tag) => tag.includes("alchemyst-awesome-saas"))
    .map((tag) => tag.replace("alchemyst-awesome-saas", "").replace("-", " "))
    .filter(res => res.length > 0)
    .join(", ");
};

/**
 * Creates a table of contents from markdown headings and adds it to the markdown string
 * @param {string} markdownString - The input markdown text
 * @returns {string} - Markdown string with TOC added
 */
const toc = (markdownString) => {
  const headings = markdownString.match(/^#{1,6}.+/gm) || [];
  const tocEntries = headings.map(heading => {
    const level = heading.match(/^#+/)[0].length;
    const text = heading.replace(/^#+\s*/, '');
    const link = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `${'  '.repeat(level - 1)}- [${text}](#${link})`;
  }).join('\n');

  return `## 📋 Table of Contents\n\n${tocEntries}\n\n<br />\n\n`;
};

const learnMore = () => {
  return `## 🔗 API Documentation

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <a href="https://platform-backend.getalchemystai.com/api/v1/docs" target="_blank">
          <img src="https://img.shields.io/badge/OpenAPI-Documentation-85EA2D?style=for-the-badge&logo=swagger&logoColor=white" alt="OpenAPI" />
        </a>
        <br />
        <sub><b>Interactive API Explorer</b></sub>
      </td>
      <td align="center" width="33%">
        <a href="https://docs.getalchemystai.com" target="_blank">
          <img src="https://img.shields.io/badge/API-Documentation-4FC08D?style=for-the-badge&logo=gitbook&logoColor=white" alt="API Docs" />
        </a>
        <br />
        <sub><b>Technical Documentation</b></sub>
      </td>
      <!-- <td align="center" width="33%">
        <a href="https://zendocs.getalchemystai.com" target="_blank">
          <img src="https://img.shields.io/badge/AI--native-Documentation-FF6B6B?style=for-the-badge&logo=robot&logoColor=white" alt="AI-native" />
        </a>
        <br />
        <sub><b>AI-Powered Docs</b></sub>
      </td> -->
    </tr>
  </table>
</div>

<br />

## 🎯 Quick Start

\`\`\`bash
# Get started with the Alchemyst Platform
curl -X GET https://platform.getalchemystai.com/api/v1/
\`\`\`

> 💡 **Pro Tip**: Check out our [AI-native Documentation](https://zendocs.getalchemystai.com) for intelligent code examples!

<br />`;
};

const introduction = () => {
  return `# 🧪 Alchemyst Platform Cookbook

<div align="center">
  <img src="https://img.shields.io/badge/AI-Platform-blue?style=for-the-badge&logo=artificial-intelligence" alt="AI Platform" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Community-COMMUNITY_COUNT%20Projects-orange?style=for-the-badge" alt="Community Projects" />
  <img src="https://img.shields.io/badge/Team-TEAM_COUNT%20Templates-purple?style=for-the-badge" alt="Team Templates" />
</div>

<div align="center">
  <h3>🚀 Make your next big AI idea come to life</h3>
  <p>Empowering developers and builders with cutting-edge AI tools and templates</p>

  <a href="https://platform.getalchemystai.com" target="_blank">
    <img src="https://img.shields.io/badge/🔥%20Start%20Building-platform.getalchemystai.com-6366f1?style=for-the-badge&labelColor=1f2937" alt="Start Building" />
  </a>
  <a href="https://dub.sh/context-community" target="_blank">
  <img src="https://img.shields.io/badge/💬%20Join%20Our%20Discord-community.getalchemystai.com-5865F2?style=for-the-badge&labelColor=1f2937" alt="Join our Discord" />
</a>
</div>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Rainbow line" />
</div>

`;
};

const preMessageForTeam = (count) => {
  return `## 📦 Templates

### 💡 Official Templates

<div align="center">
  <img src="https://img.shields.io/badge/Official%20Templates-${count}%20Available-4F46E5?style=for-the-badge" alt="Official Templates" />
</div>

<br />

<table>
  <tr>
    <th width="200">🎯 Project</th>
    <th width="100">⭐ Stars</th>
    <th width="400">📝 Description</th>
    <th width="150">🏷️ Topics</th>
  </tr>`;
};

const preMessageForCommunity = (count, stars) => {
  return `
<br />

### 🚀 Community Templates

<div align="center">
  <img src="https://img.shields.io/badge/Community%20Templates-${count}%20(Total%20${stars}%20stars)-FF6B6B?style=for-the-badge" alt="Community Templates" />
</div>

<br />

<table>
  <tr>
    <th width="200">🎯 Project</th>
    <th width="100">⭐ Stars</th>
    <th width="400">📝 Description</th>
    <th width="150">🏷️ Topics</th>
  </tr>`;
};

const postMessageForTeam = () => {
  return `</table>

<br />

This is an ever expanding list - we'll keep on adding open source templates!

`;
};

const postMessageForCommunity = () => {
  return `</table>

<br />

## 🏆 Community

<div align="center">
      <td align="center" width="50%">
        <a href="https://github.com/Alchemyst-ai/awesome-saas/blob/main/leaderboard/README.md">
          <img src="https://img.shields.io/badge/🏆%20Community-Leaderboard-FFD700?style=for-the-badge&logo=trophy" alt="Leaderboard" />
        </a>
        <br />
        <sub><b>See top contributors</b></sub>
      </td>
</div>

<br />

## 🤝 Contributing

We welcome contributors! Here's how to get started:

### 🎯 How to Contribute

1. **Fork the repository** and create your feature branch
2. **Add the topic** \`alchemyst-awesome-saas\` to your repository
3. **Make your repo public** for visibility
4. **Submit a pull request** with your awesome project!

### 🔍 Troubleshooting

<details>
<summary><b>My contribution doesn't appear in the list</b></summary>

Check the following:

- ✅ Repository is set to **public**
- ✅ Added topic **"alchemyst-awesome-saas"** to your repo
- ✅ Wait for the **daily refresh** at 12:00 AM UTC
- ✅ If still missing, [**raise an issue**](https://github.com/Alchemyst-ai/awesome-saas/issues/new)

</details>

<br />

---

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Rainbow line" />

  <h3>🚀 Ready to build something amazing?</h3>

  <a href="https://platform.getalchemystai.com" target="_blank">
    <img src="https://img.shields.io/badge/Get%20Started%20Now-6366f1?style=for-the-badge&logo=rocket&logoColor=white" alt="Get Started" />
  </a>

  <br /><br />

  <p>Made with ❤️ by the Alchemyst AI Team</p>

  <a href="https://github.com/Alchemyst-ai/awesome-saas/stargazers">
    <img src="https://img.shields.io/github/stars/Alchemyst-ai/awesome-saas?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Alchemyst-ai/awesome-saas/network/members">
    <img src="https://img.shields.io/github/forks/Alchemyst-ai/awesome-saas?style=social" alt="GitHub Forks" />
  </a>

</div>`;
};

const generateTopicBadges = (topics) => {
  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'cyan'];
  return topics.split(', ').map((topic, index) => {
    const color = colors[index % colors.length];
    return `<img src="https://img.shields.io/badge/${topic.trim()}-${color}?style=flat-square" alt="${topic.trim()}" />`;
  }).join('\n      ');
};

const gatherAgentsFromAwesomeSaas = () => {
 let agentsSection = '';

 return fetch("https://api.github.com/repos/Alchemyst-ai/awesome-saas/git/trees/main?recursive=1")
   .then((res) => {
      if (!res.ok) {
      console.error("❌ Failed to fetch repo tree:", res.status);
      return "⚠️ Could not fetch agents from awesome-saas.";
      }
      return res.json();
   })
   .then((tree) => {
      const agents = tree.tree
        .filter((item) => item.path.match(/^agents\/[^/]+\/README\.md$/))
        .map((item) => item.path.match(/^agents\/([^/]+)\/README\.md$/)[1]);

      if (agents.length === 0) {
        console.log("⚠️ No agents found.");
        return '';
      }

      agentsSection += `
  <h2 align="center">🧠 Community AI Agents</h2>
  <p align="center">These agents are part of the <a href="https://github.com/Alchemyst-ai/awesome-saas">awesome-saas</a> collection.</p>
  <table>
    <thead>
      <tr>
        <th>Agent</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
  `;

      agents.forEach((agentName) => {
        agentsSection += `
      <tr>
        <td>
          <a href="https://github.com/Alchemyst-ai/awesome-saas/tree/main/agents/${agentName}">
            <img src="https://img.shields.io/badge/${agentName.replace(/-/g, '--')}-1f2937?style=for-the-badge&logo=github" alt="${agentName}" />
          </a>
        </td>
        <td>AI agent built by the community</td>
      </tr>`;
      });

       agentsSection += `
    </tbody>
  </table>`;
      
      return agentsSection;
    })
    .catch((error) => {
      console.log("An error was encountered while gathering agents: " + error);
      return `⚠️ Could not fetch agents from awesome-saas.`;
    });
};



const gatherReposFromTeam = () => {
  let gatheredTeamRepoInfo = '';
  return fetch("https://api.github.com/users/alchemyst-ai/repos")
    .then((res) => res.json())
    .then((repoDataForTeam) => {
      const teamRepos = repoDataForTeam.filter(entry => entry.topics.includes("alchemyst-awesome-saas"));
      gatheredTeamRepoInfo += preMessageForTeam(teamRepos.length);

      teamRepos.forEach((entry) => {
        const topics = processTags(entry.topics);
        const topicBadges = topics ? generateTopicBadges(topics) : '';

        gatheredTeamRepoInfo += `
  <tr>
    <td>
      <a href="https://github.com/${entry.full_name}">
        <img src="https://img.shields.io/badge/${entry.name.replace(/-/g, '--')}-1f2937?style=for-the-badge&logo=github" alt="${entry.name}" />
      </a>
    </td>
    <td align="center">
      <img src="https://img.shields.io/github/stars/${entry.full_name}?style=social" alt="Stars" />
    </td>
    <td>${entry.description || 'No description available'}</td>
    <td>
      ${topicBadges}
    </td>
  </tr>`;
      });

      gatheredTeamRepoInfo += postMessageForTeam();
      return gatheredTeamRepoInfo;
    })
    .catch(error => {
      console.log("An error was encountered while gathering team repos: " + error);
      return `An error was encountered while gathering team repos. If you see this, don't worry - we'll get it up ASAP!`;
    });
};

const gatherReposFromCommunity = () => {
  let gatheredCommunityRepoInfo = '';
  return fetch("https://api.github.com/search/repositories?q=topic:alchemyst-awesome-saas")
    .then((res) => res.json())
    .then((data) => data.items ?? [])
    .then((communityRepoData) => {
      const communityRepos = communityRepoData
        .filter(entry => !entry.full_name.toLowerCase().startsWith("alchemyst-ai"))
        .sort((a, b) => a.full_name.localeCompare(b.full_name));

      const communityStargazersCount = communityRepos.reduce((acc, curr) => {
        return acc + curr.stargazers_count;
      }, 0)

      gatheredCommunityRepoInfo += preMessageForCommunity(communityRepos.length, communityStargazersCount);

      communityRepos.forEach((entry) => {
        const topics = processTags(entry.topics);
        const topicBadges = topics ? generateTopicBadges(topics) : '-';

        gatheredCommunityRepoInfo += `
  <tr>
    <td>
      <a href="https://github.com/${entry.full_name}">
        <img src="https://img.shields.io/badge/${entry.name.replace(/-/g, '--')}-1f2937?style=for-the-badge&logo=github" alt="${entry.name}" />
      </a>
    </td>
    <td align="center">
      <img src="https://img.shields.io/github/stars/${entry.full_name}?style=social" alt="Stars" />
    </td>
    <td>${entry.description || 'No description available'}</td>
    <td>
      ${topicBadges}
    </td>
  </tr>`;
      });

      gatheredCommunityRepoInfo += postMessageForCommunity();
      return gatheredCommunityRepoInfo;
    })
    .catch(error => {
      console.log("An error was encountered while gathering community repos: " + error);
      return `An error was encountered while gathering community repos. If you see this, don't worry - we'll get it up ASAP!`;
    });
};

const main = async () => {
  let finalString = ``;

  // Get repo data to count projects
  const teamRepoData = await fetch("https://api.github.com/users/alchemyst-ai/repos")
    .then(res => res.json())
    .catch(() => []);

  const communityRepoData = await fetch("https://api.github.com/search/repositories?q=topic:alchemyst-awesome-saas")
    .then(res => res.json())
    .then(data => data.items ?? [])
    .catch(() => []);

  const teamCount = teamRepoData.filter(entry => entry.topics?.includes("alchemyst-awesome-saas")).length;
  const communityCount = communityRepoData.filter(entry => !entry.full_name.toLowerCase().startsWith("alchemyst-ai")).length;

  // Create introduction with dynamic counts
  const intro = introduction()
    .replace('TEAM_COUNT', teamCount)
    .replace('COMMUNITY_COUNT', communityCount);

  finalString += learnMore();

  const agentList = await gatherAgentsFromAwesomeSaas();
  finalString += agentList;

  const teamRepoInfo = await gatherReposFromTeam();
  finalString += teamRepoInfo;

  const communityRepoInfo = await gatherReposFromCommunity();
  finalString += communityRepoInfo;

  const finalStringWithToc = intro + toc(finalString) + finalString;
  console.log(finalStringWithToc);
};

main();
