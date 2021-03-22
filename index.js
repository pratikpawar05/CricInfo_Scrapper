const cheerio = require("cheerio");
const getHtml = require("./helpers/getHtml");
const createFileIfNotExist = require("./helpers/createFileIfNotExist");
const fs = require('fs');
let iplInfo = {};

async function batsmanDetails(chSelector, teamNames, commonDetails) {
  let bothTeamsBatsmenData = chSelector(`.table.batsman > tbody`);
  for (let i = 0; i < bothTeamsBatsmenData.length; i++) {
    createFileIfNotExist("./ipl2020/" + chSelector(teamNames[i]).text(), "Dir");
    teamName = chSelector(teamNames[i]).text().trim();
    if (!iplInfo.hasOwnProperty(teamName)) {
      iplInfo[teamName] = {};
    }
    let allBatsmenInfo = chSelector(bothTeamsBatsmenData[i]).find("tr:nth-child(odd)");

    for (let j = 0; j < allBatsmenInfo.length - 1; j++) {
      let currbatsmenRow = chSelector(allBatsmenInfo[j]).find("td");
      let batsmanData = {};
      if (i == 0) {
        batsmanData["Opponent"] = chSelector(teamNames[1]).text();
      } else {
        batsmanData["Opponent"] = chSelector(teamNames[0]).text();
      }
      let batsmanName = chSelector(currbatsmenRow[0])
        .find("a")
        .attr("title")
        .split("View full profile of ")[1];
      if (!iplInfo[teamName].hasOwnProperty(batsmanName)) {
        iplInfo[teamName][batsmanName] = [];
      }
    //   console.log("Batsmen Name", batsmanName);
      batsmanData["Runs_Scored"] = chSelector(currbatsmenRow[2]).text();
      batsmanData["Balls_Played"] = chSelector(currbatsmenRow[3]).text();
      batsmanData["fours"] = chSelector(currbatsmenRow[5]).text();
      batsmanData["sixs"] = chSelector(currbatsmenRow[6]).text();
      batsmanData["Strike_Rate"] = chSelector(currbatsmenRow[7]).text();
      batsmanData["Match_No"] = commonDetails["Match_No"];
      batsmanData["Match_Venue"] = commonDetails["Match_Venue"];
      batsmanData["Match_Date"] = commonDetails["Match_Date"];
      batsmanData["Winning_Team"] = commonDetails["Winning_Team"];
      iplInfo[teamName][batsmanName].push(batsmanData);
      console.log(iplInfo[teamName][batsmanName]);
    }
  }
}
async function matchDetails(url) {
  let commonDetails = {};
  let html = await getHtml(url);
  let chSelector = cheerio.load(html);
  let matchInfo = chSelector(`.match-info.match-info-MATCH`);
  let MatchDetails = chSelector(matchInfo)
    .find(".description")
    .text()
    .split(", ");
  commonDetails["Match_No"] = MatchDetails[0];
  commonDetails["Match_Venue"] = MatchDetails[1];
  commonDetails["Match_Date"] = MatchDetails[2];
  //   console.log(MatchDetails);
  let teamNames = chSelector(matchInfo).find(".teams .team .name");
  let winningTeam = chSelector(matchInfo).find(`.team:not(.team-gray) p`);
  let team = "";
  if (winningTeam.length != 2) {
    team = chSelector(winningTeam).text().trim();
  } else {
    winningTeam = chSelector(
      `.match-details-table tbody tr:last-child td:last-child`
    );
    figureWinningTeam = chSelector(winningTeam).text().split(",");
    if (figureWinningTeam[0].includes("2")) {
      team = figureWinningTeam[0];
    } else {
      team = figureWinningTeam[1];
    }
  }
  commonDetails["Winning_Team"] = team;
  batsmanDetails(chSelector, teamNames, commonDetails);
}

async function allMatchesInfo(url) {
  let html = await getHtml(url);
  let chSelector = cheerio.load(html);
  let scorecards = chSelector(`a[data-hover="Scorecard"]`);
  for (let i = 0; i < scorecards.length; i++) {
    url =
      "https://www.espncricinfo.com" + chSelector(scorecards[i]).attr("href");
    await matchDetails(url);
    console.log(url);
  }
  for (const teamName in iplInfo) {
      for(const playerName in iplInfo[teamName]){
          let path="./ipl2020/"+teamName+"/"+playerName+".json";
          fs.writeFileSync(path,JSON.stringify(iplInfo[teamName][playerName]));
        //   console.log(teamName,iplInfo[teamName][playerName]);
      }
  }
}
// let url = `https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-kings-xi-punjab-36th-match-1216517/full-scorecard`;
// (async function () {
//   await matchDetails(url);
//   console.log(iplInfo);
// })();
let url = `https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results`;
allMatchesInfo(url);
