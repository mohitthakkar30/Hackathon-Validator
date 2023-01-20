const fs = require("fs");
const dotenv = require("dotenv").config();
const githubToken = process.env.GITHUB_TOKEN;
const { Octokit } = require("@octokit/core");

const hackStartDate = new Date("2023-01-06T00:00:00Z");
const hackEndDate = new Date("2023-01-08T00:00:00Z");

const octokit = new Octokit({
    auth: githubToken,
  });

  const repositoryLinks = JSON.parse(fs.readFileSync("repos.json", "utf8"));

  const repos = repositoryLinks.map((link) => {
    const [owner, repo] = link.split("/").slice(-2);
    return { owner, repo };
  });

  const getCommits = async (owner, repo) => {
    const commits = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
    });
  
    return commits.data;
  };
  
  const getFirstCommit = async (owner, repo) => {
    const commits = await getCommits(owner, repo);
    return commits[commits.length - 1];
  };
  
  const getFirstCommitDates = async () => {
    const validRepos = [];
    const firstCommitDates = await Promise.all(
      repos.map(async ({ owner, repo }) => {
        const firstCommit = await getFirstCommit(owner, repo);
        return new Date(firstCommit.commit.author.date);
      })
    );

    firstCommitDates.forEach((date, index) => {
      if (date > hackStartDate && date < hackEndDate) {
        console.log("Between Hackathon Dates");
        const link = repositoryLinks[index];
        validRepos.push(link);
      } else {
        console.log("Not in Hackathon Dates");
      }
    });
    fs.writeFileSync("validRepos.json", JSON.stringify(validRepos));
  };
  
  getFirstCommitDates();