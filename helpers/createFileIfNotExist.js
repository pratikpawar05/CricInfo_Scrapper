const fs = require("fs");
function createFileIfNotExist(url,checker) {
  if (!fs.existsSync(url)) {
    if (checker == "Dir") {
      fs.mkdirSync(url);
    } else if (checker == "File") {
      fs.writeFileSync(url,{});
    }
  }
}
module.exports = createFileIfNotExist;
