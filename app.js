const express = require("express");
const app = express();
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

app.use(cors());

app.get("/generate_pdf", (req, res) => {
  const url = req.query.url;

  scriptDir = __dirname;
  scriptPath = path.join(scriptDir, "generate_pdf.js");
  outputPath = "";
  outputFilename = "";
  scriptArguments = [url, outputPath, outputFilename];
  const process = spawn("node", [scriptPath, ...scriptArguments]);

  // Listen for the script to exit
  process.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code == 0) {
      console.log("status 0 success");
      res.status(200).json({ message: "PDF generated successfully" });
    } else {
      console.log(`status code ${code}, failed`);
      res.status(500).json({ message: "Failed" });
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
