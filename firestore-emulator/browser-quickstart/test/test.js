const puppeteer = require('puppeteer');
const expect = require("chai").expect;

it('works', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5000');

  const { before, after } = await page.evaluate(async () => {
    const chat = document.getElementById("history");
    const before = chat.innerText;
    document.getElementById("input").innerText = "Hello, World!";
    document.getElementById("submit").click();
    await new Promise(r => setTimeout(r, 100));
    const after = chat.innerText;
    return { before, after };
  });

  expect(before).to.be.eql("");
  expect(after).to.be.eql("Hello, World!");

  await browser.close();
});
