const request = require("request");

function getHtml(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, html) => {
      if (err) {
        reject(err);
      }
      resolve(html);
    });
  });
}

module.exports = getHtml;
