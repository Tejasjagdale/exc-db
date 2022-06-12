const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

const bar1 = new cliProgress.SingleBar({
  format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Pages || Speed: {speed}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

puppeteer.launch({
    headless: true,
    executablePath:"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    userDataDir: "C:/Users/TEJAS/AppData/Local/Google/Chrome/User Data/Default",
  })
  .then(async (browser) => {
    const page = await browser.newPage();
    console.log("*******Browser started********");

    var pageno = 1;
    const totalpages = 209;
    var all = [];

    bar1.start(totalpages, 0, {
      speed: "N/A"
    });

    while (pageno < totalpages + 1) {
      bar1.increment();
      bar1.update(pageno);
      await page.goto(`https://www.bodybuilding.com/exercises/finder/${pageno}`, {
        timeout: 0,
      });

      const result = await page.evaluate(() => {
        let a = document.querySelectorAll(".ExResult-row");
        const total = [...a];
        return total.map((h, i) => {
          if (h.querySelectorAll(".ExResult-img")[0]) {
            var img1 = h.querySelectorAll(".ExResult-img")[0].src;
          }
          if (h.querySelectorAll(".ExResult-img")[1]) {
            var img2 = h.querySelectorAll(".ExResult-img")[1].src;
          }
          if (h.querySelector(".ExHeading a")) {
            var src = h.querySelector(".ExHeading a").href;
          }
          if (h.querySelector(".ExHeading a")) {
            var name = h.querySelector(".ExHeading a").innerText;
          }
          return {
            pageno: `ExerciseNo_${i}`,
            images: [img1, img2],
            src: src,
            name: name,
          };
        });
      });

      all = [...all, ...result];
      pageno++;
    }
    bar1.stop();

    fs.writeFile("level1_extraction.json", JSON.stringify(all), (err) => {
      if (err) {
        console.log(err);
      }
    });
    await browser.close();
  });
