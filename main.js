const fs = require("fs");
const crypto = require("crypto");
const puppeteer = require("puppeteer");

const directory = "./wasm/";
const wrapper = fs.readFileSync("./wrapper.js", "utf8");

function wasmFound(data) {
    //Use hash as filename for deduplication
    const filename = crypto.createHash("md5").update(data).digest("hex");
    fs.writeFileSync(directory + filename, Buffer.from(data, "base64"));
}

(async () => {
    if (!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }

    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
    const page = await browser.newPage();
    await page.exposeFunction("wasmFound", source => wasmFound(source));
    await page.evaluateOnNewDocument(wrapper);
    try {
    	await page.goto("https://www.wasmwombats.com/");
    } catch (e) {
	console.log("failed.");
    }

    //Wait a bit, to make sure the Wasm as chance to load
    await new Promise(done => setTimeout(done, 30000));
    await browser.close();
})();
