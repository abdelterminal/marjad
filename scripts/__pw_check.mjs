import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.fill("input[type=email]", "admin@marjad.ma");
await page.fill("input[type=password]", "TonMotDePasse123");
await page.click("button[type=submit]");
try { await page.waitForURL("**/admin**", { timeout: 8000 }); } catch(e) {}
await page.goto("http://localhost:3000/admin/products/new", { waitUntil: "networkidle" });
const info = await page.evaluate(() => ({
  mainW: document.querySelector("main")?.offsetWidth,
  formW: document.querySelector("form")?.offsetWidth,
  inputW: document.querySelector("input[type=text]")?.offsetWidth,
  bodyW: document.body.offsetWidth,
  url: location.href,
}));
console.log(JSON.stringify(info));
await page.screenshot({ path: "C:/Users/Brandshift 01/Desktop/admin-form.png", fullPage: true });
await browser.close();
