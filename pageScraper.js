require("dotenv").config();
const scraperObject = {
  url: "https://crosshero.com/athletes/sign_in",
  urlClasses: "https://crosshero.com/dashboard/recurring_classes",
  //urlClasses:
  // "https://crosshero.com/dashboard/classes?id=60413d5454ef2c003fe6bfe8",
  search: "MiRi 🦄",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    let scrapedData = [];
    // Wait for the required DOM to be rendered
    async function scrapeCurrentPage() {
      await page.type("#athlete_email", process.env.user);
      await page.type("#athlete_password", process.env.password);
      // click and wait for navigation
      await Promise.all([
        page.click(".btn-default"),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);
    }
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        await newPage.waitForSelector("input#class_date");
        // Get the link to all the required books
        let athletes = await newPage.$$eval(" .athlete-box  ", (links) => {
          links = links.map((el) => el.querySelector("img").alt);
          //console.log(links);

          return links;
        });
        let found = false;
        for (athletesname in athletes) {
          // console.log(athletes[athletesname]);
          if (athletes[athletesname].includes(this.search)) {
            found = true;
            console.log("Trobada!");
          }
        }
        if (found) {
          let selectors = await newPage.$$eval(
            ".select2-selection__rendered",
            (links) => {
              links = links.map((el) => el.title);
              console.log(links.innerText);

              return links;
            }
          );
          for (selectorsValue in selectors) {
            console.log(selectors[selectorsValue]);
          }
          await newPage.waitForSelector("input#class_date");
          /*  dataObj["date"] = await page.$eval(
            " input#class_date",
            (datepicker) => datepicker.value
          );*/

          dataObj["type"] = selectors[0];
          dataObj["class"] = selectors[1];
        }
        console.log(dataObj);
        resolve(dataObj);
        await newPage.close();
      });
    /*new fi */
    let data = await scrapeCurrentPage();
    await page.goto(this.urlClasses);
    await page.waitForSelector(".table");

    const hrefs = await page.$$eval("tr   td    a", (as) =>
      as.map((a) => a.href)
    );

    /* let urls = await page.$$eval("tr   td  a", (links) => {
      // console.log(links);
      // links = links.map((el) => el.querySelector("  a")?.href);
      // links = links.map((el) => el.querySelector("a")?.href);

      /* links = links.map((ela) =>
        ela.map((el) => el.querySelector("  a")?.href)
      );
      return links?.href;
    });*/
    let dataWeek = [];
    //console.log(urls.length);
    //   console.log(urls);
    for (link in hrefs) {
      // urls[link] !== null && console.log(urls[link]);
      if (hrefs[link] !== null) {
        console.log(hrefs[link]);
        let currentPageData = await pagePromise(hrefs[link]);
        if (Object.keys(currentPageData).length !== 0) {
          dataWeek.push(currentPageData);
        }
      }
    }
    console.log("buscando horarios de: " + this.search);
    console.log(dataWeek);
    /* let dataWeek = [];
    let currentPageData = await pagePromise(this.urlClasses);
    console.log(currentPageData);
    dataWeek.push(currentPageData);
    console.log(dataWeek);
*/
    /*new */
    // Loop through each of those links, open a new page instance and get the relevant data from them

    /* await page.waitForSelector(".table");
    // Get the link to all the required books
    let urls = await page.$$eval(" tbody tr ", (links) => {
      
      links = links.map((el) => el.querySelector("td a").href);

      return links;
    });
    for (link in urls) {
      console.log(urls[link]);
    }*/
  },
};

module.exports = scraperObject;
