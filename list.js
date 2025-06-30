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
  const toc = headings.map(heading => {
    const level = heading.match(/^#+/)[0].length;
    const text = heading.replace(/^#+\s*/, '');
    const link = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `${'  '.repeat(level - 1)}- [${text}](#${link})`;
  }).join('\n');

  return `## Table of Contents\n${toc}\n\n${markdownString}`;
};

const learnMore = () => {
  return `\n## Learn about the Alchemyst APIs
We maintain the documentation of the Alchemyst API in the form of:
- [OpenAPI Documentation](https://platform-backend.getalchemystai.com/api/v1/docs)
- [API Documentation](https://alchemyst-ai.github.io/technical-docs) ![Static Badge](https://img.shields.io/badge/%20-new-blue)
- [AI-native Documentation](https://zendocs.getalchemystai.com) ![Static Badge](https://img.shields.io/badge/%20-new-blue)`;
}

const introduction = () => {
  return `# Awesome Alchemyst Platform Cookbook
Make your next big AI idea come to life with the [Alchemyst AI Platform](https://platform.getalchemystai.com).

At Alchemyst AI, we love empowering developers and builders with AI. Below is a list of the projects that our team has put out - use the resources linked here to lock in and start shipping! 🚀🚀`;
};

const preMessageForTeam = () => {
  return `### 💡 From the Team

Explore these SaaS templates by our cracked team 🧨\n\n`;
};

const preMessageForCommunity = () => {
  return `\n\n
### 🚀 From the Community
Explore these SaaS templates by our awesome community 🤩\n\n`;
};

const postMessageForTeam = () => {
  return "This is an ever expanding list - we'll keep on adding open source templates!";
};

const postMessageForCommunity = () => {
  return `\n\n
## For contributors

Contributors are welcome! Get started by contributing to our projects! **Have a new idea?** Do tell us about it [***here***](https://github.com/orgs/alchemyst-ai/discussions/1)!

### Can't find your contributions?
Consider doing the following:

- Check if you have set your repo to public.
- Check if you have added a topic "alchemyst-awesome-saas" on your repo.
- If your repo tags don't show up yet, check if you have added topics starting with "alchemyst-awesome-saas".

**NOTE**: This list refreshes once a day at 12:00 AM UTC. Please be patient while it does :D.

If it still doesn't show up, please [**raise an issue**](https://github.com/Alchemyst-ai/awesome-saas/issues/new)`;
};

const gatherReposFromTeam = () => {
  let gatheredTeamRepoInfo = '';
  return fetch("https://api.github.com/users/alchemyst-ai/repos")
    .then((res) => res.json())
    .then((repoDataForTeam) => {
      gatheredTeamRepoInfo += '\n' + preMessageForTeam();
      gatheredTeamRepoInfo += "\n| **Name** | **Stars** | **Description** | **Topic(s)** |";
      gatheredTeamRepoInfo += "\n| ---- | ---- | ---- | ---- |\n";
      repoDataForTeam.map((entry) => {
        if (entry.topics.includes("alchemyst-awesome-saas")) {
          gatheredTeamRepoInfo +=
            `| [**${entry.full_name}**](https://github.com/${entry.full_name}) | ${entry.stargazers_count} | ${entry.description} | ${processTags(entry.topics)} |\n`;
        }
      });
      gatheredTeamRepoInfo += '\n';
      gatheredTeamRepoInfo += '\n' + postMessageForTeam();
    }).then(() => gatheredTeamRepoInfo)
    .catch(error => {
      console.log("An error was encountered while gathering team repos: " + error);
      return `An error was encountered while gathering team repos. If you see this, don't worry - we'll get it up ASAP!`
    })
    ;
};

const gatherReposFromCommunity = () => {
  let gatheredCommunityRepoInfo = '';
  return fetch(
    "https://api.github.com/search/repositories?q=topic:alchemyst-awesome-saas"
  )
    .then((res) => res.json())
    .then((data) => data.items ?? [])
    .then((communityRepoData) => {
      gatheredCommunityRepoInfo += '\n' + preMessageForCommunity();
      gatheredCommunityRepoInfo += "\n| **Name** | **Stars** | **Description** | **Topic(s)** |";
      gatheredCommunityRepoInfo += "\n| ---- | ---- | ---- |  ---- |\n";

      communityRepoData
        .filter(entry => !entry.full_name.toLowerCase().startsWith("alchemyst-ai"))
        .sort((a, b) => { return a.full_name.localeCompare(b.full_name)})
        .map((entry) => {
          if (entry.topics.includes("alchemyst-awesome-saas")) {
            gatheredCommunityRepoInfo +=
              `| [**${entry.full_name}**](https://github.com/${entry.full_name}) | ${entry.stargazers_count} | ${entry.description} | ${processTags(entry.topics)} |\n`
              ;
          }
        });
      gatheredCommunityRepoInfo += '\n\n';
      gatheredCommunityRepoInfo += postMessageForCommunity();
    }).then(() => gatheredCommunityRepoInfo)
    .catch(error => {
      console.log("An error was encountered while gathering community repos: " + error);
      return `An error was encountered while gathering community repos. If you see this, don't worry - we'll get it up ASAP!`
    })
    ;
};

const main = async () => {
  let finalString = ``;
  // finalString += introduction();
  finalString += learnMore();
  finalString += `\n\n## Templates`;
  const teamRepoInfo = await gatherReposFromTeam();
  finalString += teamRepoInfo;
  const communityRepoInfo = await gatherReposFromCommunity();
  finalString += communityRepoInfo;

  const finalStringWithToc = introduction() + '\n\n' + toc(finalString);
  console.log(finalStringWithToc);
};

main();
