const cheerio = require("cheerio");
const getHtml = require("./helpers/getHtml");
const createFileIfNotExist = require("./helpers/createFileIfNotExist");

async function matchDetails(url) {
  let playInfo = {};
  let html = await getHtml(url);
  let chSelector = cheerio.load(html);
  let matchInfo = chSelector(`.match-info.match-info-MATCH`);
  console.log(chSelector(matchInfo).find(".description").text().split(", "));
  let teamNames = chSelector(matchInfo).find(".teams .team .name");
  let teamsBatsmanData = chSelector(`.table.batsman > tbody`);
  for (let i = 0; i < teamsBatsmanData.length; i++) {
    createFileIfNotExist("./ipl2020/" + chSelector(teamNames[i]).text(), "Dir");
    let batsmanInfo = chSelector(teamsBatsmanData[i]).find("tr:nth-child(odd)");
    for (let j = 0; j < batsmanInfo.length - 1; j++) {
      let batsman = chSelector(batsmanInfo[j]).find("td");
      createFileIfNotExist(
        "./ipl2020/" +
          chSelector(teamNames[i]).text() +
          "/" +
          chSelector(batsman[0]).text() +
          ".json",
        "File"
      );
      if (i == 0) {
        console.log(chSelector(teamNames[1]).text());
      } else {
        console.log(chSelector(teamNames[0]).text());
      }
      console.log("Batsmen Name", chSelector(batsman[0]).text());
      console.log("Runs", chSelector(batsman[2]).text());
      console.log("Balls", chSelector(batsman[3]).text());
      console.log("4s", chSelector(batsman[5]).text());
      console.log("6s", chSelector(batsman[6]).text());
      console.log("Strikerate", chSelector(batsman[7]).text());
    }
  }
}

async function allMatchesInfo(url) {
  let html = await getHtml(url);
  let chSelector = cheerio.load(html);
  let scorecards = chSelector(`a[data-hover="Scorecard"]`);
  let matchInfo = chSelector(`.match-info.match-info-FIXTURES`);
  for (let i = 0; i < scorecards.length; i++) {
    url =
      "https://www.espncricinfo.com" + chSelector(scorecards[i]).attr("href");
    console.log(url);
    console.log(chSelector(matchInfo[i]).find(".description").text());
    console.log(chSelector(matchInfo[i]).find(".teams .team").text());
  }
}
let url = `https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-sunrisers-hyderabad-qualifier-2-1237180/full-scorecard`;
matchDetails(url);
// let url = `https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results`;
// allMatchesInfo(url);
