const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const inputFilename = process.argv[2];
const outputFilename = process.argv[3];

if (!inputFilename || !outputFilename) {
  console.error("Usage: node script.js <input.csv> <output.csv>");
  process.exit(1);
}

const data = [];

fs.createReadStream(inputFilename)
  .pipe(csv())
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", () => {
    const fm = "FM"; // only the FM channels appear to have this problem. 
    const repeaterCallSign = "Repeater Call Sign";
    const repeaterCallCounts = {};

    // First pass: count duplicates
    data.forEach((row) => {
      if (row.mode !== fm) return;
      const repeaterCall = row[repeaterCallSign];
      if (!repeaterCall) return; // ignore any rows without a callsign
      repeaterCallCounts[repeaterCall] = (repeaterCallCounts[repeaterCall] || 0) + 1;
    });

    // Second pass: update duplicates
    const repeaterCallIndices = {}; // Track indices for appending /1, /2, .../10, etc.

    data.forEach((row) => {
      if (row.Mode !== fm) return;
      const repeaterCall = row[repeaterCallSign];
      if (!repeaterCall) return; // ignore any rows without a callsign
      if (repeaterCall === 1) return;
      // Only update if duplicates exist
      if (!repeaterCallIndices[repeaterCall]) {
        repeaterCallIndices[repeaterCall] = 1;
      }
      row[repeaterCallSign] = `${repeaterCall}/${String(repeaterCallIndices[repeaterCall])}`;
      repeaterCallIndices[repeaterCall]++;
    });

    // Write to the output CSV
    const headers = Object.keys(data[0]).map((header) => ({ id: header, title: header })); // Get headers dynamically

    const csvWriter = createCsvWriter({
      path: outputFilename,
      header: headers,
    });

    csvWriter
      .writeRecords(data)
      .then(() => console.log(`CSV written to ${outputFilename}`));
  });