const puppeteer = require("puppeteer");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { spawn } = require("child_process");
const url = process.argv[2];
const outputPath = process.argv[3] || getDefaultDownloadDirectory();
const filename = process.argv[4] || "link_to_pdf.pdf";

(async () => {
  // console.log("---------------------inside file-----------------------------");

  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    args: [
      "--kiosk-printing",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // "--window-size=1440,900",
    ],
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: ["domcontentloaded", "load", "networkidle2"],
  });

  // await new Promise((resolve) => setTimeout(resolve, 15000));
  // Customize the PDF options as needed
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100; // The number of pixels to scroll by on each step.
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // The interval in milliseconds between each scroll step.
    });
  });

  let timestamp = new Date().toISOString().replace(/:/g, "-");
  timestamp = timestamp.split(".")[0];
  let tempFilename = `${filename}_${timestamp}.pdf`;
  const tempPdfPath = path.join(outputPath, tempFilename);

  await page.pdf({
    path: tempPdfPath,
    format: "A4",
    printBackground: true,
    cssBackgroundSize: true,
    margin: {
      top: "10mm", // Top margin
      right: "10mm", // Right margin
      bottom: "10mm", // Bottom margin
      left: "10mm", // Left margin
    },
  });

  await browser.close();

  // compression code

  // console.log(
  //   `--- ${outputPath} ----  ${filename} -----------------------------`
  // );
  // const pdfPath = path.join(outputPath, filename);
  // console.log("--------------------------------------------------");
  // const gsArgs = [
  //   "-sDEVICE=pdfwrite",
  //   "-dCompatibilityLevel=1.4",
  //   "-dPDFSETTINGS=/ebook", // Set compression level
  //   "-dNOPAUSE",
  //   "-dQUIET",
  //   "-dBATCH",
  //   `-sOutputFile=${pdfPath}`, // Output file name
  //   tempPdfPath, // Input file name
  // ];
  // const gsProcess = spawn("gs", gsArgs);
  // console.log(gsProcess);
  // gsProcess.on("close", (code) => {
  //   if (code === 0) {
  //     message = "Report pdf downloaded successfully";
  //     console.log(message);
  //     fs.unlinkSync(tempPdfPath);
  //     console.log("Temporary PDF files deleted");
  //   } else {
  //     message = "Report pdf download failed";
  //     console.log(message);
  //   }
  // });
})();

function getDefaultDownloadDirectory() {
  const userHomeDir = os.homedir();
  return path.join(userHomeDir, "Downloads");
}
