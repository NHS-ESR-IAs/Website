const fs = require("fs");
const path = require("path");
const csv = require("csv-parse/sync");

// Paths
const svgDir = path.join(__dirname, "../openmoji-svg-color");
const csvFile = path.join(__dirname, "../openmoji.csv");

// Load metadata CSV
const csvData = fs.readFileSync(csvFile, "utf8");
const records = csv.parse(csvData, { columns: true });

// Build a lookup: hex code → name
const nameLookup = {};
records.forEach((row) => {
  // OpenMoji CSV has a "hexcode" column like "1F600"
  nameLookup[row.hexcode.toUpperCase()] = row.annotation; // e.g. "grinning face"
});

// Build manifest (store file paths, not SVG markup)
const manifest = { emojis: { all: [] } };

fs.readdirSync(svgDir).forEach((file) => {
  if (file.endsWith(".svg")) {
    const hex = file.replace(".svg", "").toUpperCase();
    const unicode = "U+" + hex;

    manifest.emojis.all.push({
      unicode,
      name: nameLookup[hex] || hex, // fallback to hex if name missing
      file: `Assets/openmoji-svg-color/${file}`, // correct relative path
    });
  }
});

// Save manifest
fs.writeFileSync(
  "emoji_manifest.json",
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log("Manifest built with", manifest.emojis.all.length, "entries");
