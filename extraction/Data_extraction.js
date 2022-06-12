const puppeteer = require("puppeteer");
const puppeteerExtraPluginStealth = require("puppeteer-extra-plugin-stealth");
const puppeteerExtraPluginUserAgentOverride = require("puppeteer-extra-plugin-stealth/evasions/user-agent-override");
const { PuppeteerExtra } = require("puppeteer-extra");

function preload(device) {
  Object.defineProperty(navigator, "platform", {
    value: device.platform,
    writable: true,
  });
  Object.defineProperty(navigator, "userAgent", {
    value: device.userAgent,
    writable: true,
  });
  Object.defineProperty(screen, "height", {
    value: device.viewport.height,
    writable: true,
  });
  Object.defineProperty(screen, "width", {
    value: device.viewport.width,
    writable: true,
  });
  Object.defineProperty(window, "devicePixelRatio", {
    value: device.viewport.deviceScaleFactor,
    writable: true,
  });
}

const device = {
  userAgent: "Mozilla/5.0 (Macintosh)",
  viewport: {
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true,
  },
  locale: "en-US,en;q=0.9",
  platform: "Macintosh",
};

const fs = require("fs");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

const bar1 = new cliProgress.SingleBar({
  format:
    "CLI Progress |" +
    colors.cyan("{bar}") +
    "| {percentage}% || {value}/{total} Pages",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

const pptr = new PuppeteerExtra(puppeteer);
const pluginStealth = puppeteerExtraPluginStealth();
pluginStealth.enabledEvasions.delete("user-agent-override"); // Remove this specific stealth plugin from the default set
pptr.use(pluginStealth);

const pluginUserAgentOverride = puppeteerExtraPluginUserAgentOverride({
  userAgent: device.userAgent,
  locale: device.locale,
  platform: device.platform,
});
pptr.use(pluginUserAgentOverride);

puppeteer
  .launch({
    args: [
      "--disable-features=site-per-process",
      `--window-size=${device.viewport.width},${device.viewport.height}`,
    ],
    headless: false,
    defaultViewport: device.viewport,
    executablePath:
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    userDataDir: "C:/Users/TEJAS/AppData/Local/Google/Chrome/User Data/Default",
  })
  .then(async (browser) => {
    fs.readFile("test.json", "utf8", async function (err, data) {
      if (err) return console.log(err);
      var list = JSON.parse(data);
      var newlist = [];
      bar1.start(list.length, 0);

      async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          try {
            const page = await browser.newPage();
            await page.goto(array[index].src, {
              waitUntil: "domcontentloaded",
              timeout: 0,
            });
            await page.evaluateOnNewDocument(preload, device);
            await page.waitForSelector(".jw-video", { timeout: 10000 });
            await page.waitForSelector(".ExDetail-guide", { timeout: 10000 });

            const result = await page.evaluate(() => {
              var final_output = {};

              if(document.querySelector(".jw-video").src){
                let video = document.querySelector(".jw-video").src;
                final_output.video_src = video;
              }

              if (document.querySelector(".ExDetail-guide .ExImg")) {
                let eximg = document.querySelector(
                  ".ExDetail-guide .ExImg"
                ).src;
                final_output.muscle_img = eximg;
              }

              if (document.querySelectorAll(".ExDetail-imgWrap img")) {
                let imgs = document.querySelectorAll(".ExDetail-imgWrap img");
                let img = [...imgs];
                let images = img.map((h) => h.src);

                final_output.ext_img = images;
              }

              if (document.querySelector(".ExDetail-benefits")) {
                let benifits = document.querySelector(".ExDetail-benefits");
                let benifits2 = [...benifits.querySelectorAll("li")];
                final_benifits = benifits2.map((h) => h.innerText);

                final_output.benifits = final_benifits;
              }

              let ins_section = document.querySelector(".ExDetail-guide");

              if (ins_section.querySelector("ol")) {
                let instruction = ins_section.querySelector("ol");
                let instruction2 = [...instruction.querySelectorAll("li")];
                final_instruction = instruction2.map((h) => h.innerText);

                final_output.instructions = final_instruction;
              }

              if (
                document.querySelectorAll(".ExResult-row--relatedExercises")
              ) {
                let related_exc = document.querySelectorAll(
                  ".ExResult-row--relatedExercises"
                );
                let total_related_exc = [...related_exc];

                let final_related_exc = total_related_exc.map((h) => {
                  if (h.querySelector(".ExHeading a")) {
                    var name = h.querySelector(".ExHeading a").innerText;
                  }
                  return {
                    name: name,
                  };
                });

                final_output.related_excercises = final_related_exc;
              }

              if (document.querySelector(".ExDetail-shortDescription p")) {
                let short_desc = document.querySelector(
                  ".ExDetail-shortDescription p"
                ).innerText;

                final_output.short_desc = short_desc;
              }

              if (document.querySelector(".bb-list--plain")) {
                let stats = document.querySelector(".bb-list--plain");
                let stats2 = [...stats.querySelectorAll("li")];
                let final_stats = stats2.map((h) => {
                  if (h.querySelector("a")) {
                    return [h.innerText, h.querySelector("a").href];
                  } else {
                    return h.innerText;
                  }
                });

                final_output.stats = final_stats;
              }
              return final_output;
            });

            array[index].extra = result;
            newlist.push(array[index]);
            array[index] = null;
            bar1.update(index + 1);
            await page.close();
            if (list.length === index + 1) {
              await browser.close();
            }
          } catch (error) {
            console.log(error);
            bar1.update(index + 1);
          }
        }
        await callback(array);
      }

      asyncForEach(list, () => {
        var filteredlist = list.filter((e) => e !== null);

        fs.readFile(
          "level2_extraction.json",
          "utf8",
          async function (err, data) {
            if (err) console.log(err);
            let final_newlist = [...JSON.parse(data), ...newlist];
            fs.writeFile(
              "level2_extraction.json",
              JSON.stringify(final_newlist),
              async (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
        );

        fs.writeFile("test.json", JSON.stringify(filteredlist), async (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
    });
    bar1.stop();
  });
