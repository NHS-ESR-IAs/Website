//================================//
// Copy Code from Playground Core //
//================================//

function sanitizeSmartCharacters(str) {
  return str
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // single quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // double quotes
    .replace(/[\u2013]/g, "-") // en dash
    .replace(/[\u2014]/g, "--") // em dash
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u200B/g, "") // zero-width space
    .replace(/\uFEFF/g, ""); // BOM
}

function copyCode() {
  const rawText = document.getElementById("output").textContent;
  const cleanText = sanitizeSmartCharacters(rawText);
  navigator.clipboard.writeText(cleanText);
  alert("Code copied (smart characters cleaned)!");
}
