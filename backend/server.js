const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 5000;
const dataDir = path.join(__dirname, "data");
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Utility functions
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};
const getDataFilePath = (fileName) => {
  const sanitizedFileName = sanitizeFileName(fileName);
  return path.join(dataDir, `${sanitizedFileName}.json`);
};
const readDataFromFile = (fileName) => {
  const filePath = getDataFilePath(fileName);
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`Error: File ${fileName}.json not found`);
    } else {
      console.error(`Error reading data from file ${fileName}.json:`, error);
    }
    return {}; // Return empty object or handle as appropriate
  }
};
const writeDataToFile = (fileName, data) => {
  const filePath = getDataFilePath(fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing data to file ${fileName}.json:`, error);
    throw error; // Handle or throw the error as needed
  }
};
// Routes
app.post("/save-json", (req, res) => {
  const { fileName, fileType, subType, filePattern, fileFormat, columns } =
    req.body;
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log(`Created directory: ${dataDir}`);
  }
  const newData = {
    filePattern,
    fileFormat,
    columns,
  };
  const existingData = readDataFromFile(fileName);
  if (!existingData[fileType]) {
    existingData[fileType] = {};
  }
  existingData[fileType][subType] = newData;
  writeDataToFile(fileName, existingData);
  res.json({ message: "File saved successfully" });
});
app.get("/all-files", (req, res) => {
  try {
    const files = fs.readdirSync(dataDir).map((file) => {
      const filePath = path.join(dataDir, file);
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);
      // Add fileName to each file data object
      return { fileName: path.basename(file, ".json"), ...jsonData };
    });
    res.json(files);
  } catch (error) {
    console.error("Error reading files from data directory", error);
    res.status(500).json({ message: "Failed to fetch files." });
  }
});
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
