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
      if (row.Mode !== fm) return;
      const callsign = row[repeaterCallSign];
      if (!callsign) return; // ignore any rows with a blank callsign
      repeaterCallCounts[callsign] = (repeaterCallCounts[callsign] || 0) + 1;
    });

    // Second pass: update duplicates
    const repeaterCallIndices = {}; // Track indices for appending /1, /2, .../10, etc.

    data.forEach((row) => {
      if (row.Mode !== fm) return;
      const callsign = row[repeaterCallSign];
      if (!callsign) return; // ignore any rows with a blank callsign
      if (repeaterCallCounts[callsign] === 1) return; // leave unique callsigns intact

      // Otherwise, Only update if duplicates exist
      if (!(callsign in repeaterCallIndices)) {
        repeaterCallIndices[callsign] = 1;
      }
      const callsignWIthIdx = `${callsign}/${repeaterCallIndices[callsign]}`; // AAAAA/1, AAAAA/2, etc
      row[repeaterCallSign] = callsignWIthIdx;
      repeaterCallIndices[callsign]++;
    });

    // Write to the output CSV
    const headers = Object.keys(data[0]).map((header) => ({ id: header, title: header }));

    const csvWriter = createCsvWriter({
      path: outputFilename,
      header: headers,
    });

    csvWriter
      .writeRecords(data)
      .then(() => console.log(`CSV written to ${outputFilename}`));
  });