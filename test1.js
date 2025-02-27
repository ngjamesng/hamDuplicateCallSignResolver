const fs = require("fs");
const assert = require("assert");
const { execSync } = require("child_process");
const csv = require("csv-parser");

// Assuming your script is saved as "update_csv.js"

describe("CSV Update Script Tests", () => {
  const inputFilename = "test_input.csv";
  const outputFilename = "test_output.csv";

  beforeEach(() => {
    // Create a test input CSV file
    const inputCsvContent = `Mode,Repeater Call Sign,Other Column
FM,N6AAA,Data1
FM,N6AAA,Data2
FM,N6BBB,Data3
FM,N6AAA,Data4
FM,,Data5
FM,N6BBB,Data6
FM,W7CCC,Data7
FM,W7CCC,Data8
FM,W7CCC,Data9
DV,K9DDD,Data10
FM,,Data11`;

    fs.writeFileSync(inputFilename, inputCsvContent);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(inputFilename)) {
      fs.unlinkSync(inputFilename);
    }
    if (fs.existsSync(outputFilename)) {
      fs.unlinkSync(outputFilename);
    }
  });

  it("should update duplicate call signs with /1, /2, etc. for FM mode", (done) => {
    // Execute the script
    execSync(`node update_csv.js ${inputFilename} ${outputFilename}`);

    // Read the output CSV and verify the results
    const results = [];
    fs.createReadStream(outputFilename)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        assert.strictEqual(results[0]["Repeater Call Sign"], "N6AAA/1");
        assert.strictEqual(results[1]["Repeater Call Sign"], "N6AAA/2");
        assert.strictEqual(results[2]["Repeater Call Sign"], "N6BBB/1");
        assert.strictEqual(results[3]["Repeater Call Sign"], "N6AAA/3");
        assert.strictEqual(results[5]["Repeater Call Sign"], "N6BBB/2");
        assert.strictEqual(results[6]["Repeater Call Sign"], "W7CCC/1");
        assert.strictEqual(results[7]["Repeater Call Sign"], "W7CCC/2");
        assert.strictEqual(results[8]["Repeater Call Sign"], "W7CCC/3");
        assert.strictEqual(results[9]["Repeater Call Sign"], "K9DDD");
        assert.strictEqual(results[4]["Repeater Call Sign"], "");
        assert.strictEqual(results[10]["Repeater Call Sign"], "");

        done();
      });
  });

  it("should ignore call signs with no data", (done) => {
    execSync(`node update_csv.js ${inputFilename} ${outputFilename}`);

    const results = [];
    fs.createReadStream(outputFilename)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        const emptyCallSigns = results.filter(row => row["Repeater Call Sign"] === "");
        assert.strictEqual(emptyCallSigns.length, 2); // check that the empty rows were not altered.
        done();
      });
  });

  it("Should not modify DV mode rows", (done) => {
    execSync(`node update_csv.js ${inputFilename} ${outputFilename}`);

    const results = [];
    fs.createReadStream(outputFilename)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => {
        const amRow = results.find(row => row.Mode === "DV");
        assert.strictEqual(amRow["Repeater Call Sign"], "K9DDD");
        done();
      });
  });
});