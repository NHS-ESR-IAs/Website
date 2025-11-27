// ===============================
// Copy Code
// ===============================

function renderPlayground(config) {
  const form = document.getElementById("playgroundForm");
  form.innerHTML = config.fields
    .map((f) => {
      if (f.type === "textarea") {
        return `
      <div class="col-12">
        <label class="form-label" for="${f.id}">${f.label}</label>
        <textarea class="form-control" id="${f.id}" rows="3">${f.default}</textarea>
      </div>`;
      } else if (f.type === "select") {
        return `
      <div class="col-12">
        <label class="form-label" for="${f.id}">${f.label}</label>
        <select class="form-select" id="${f.id}">
          ${f.options
            .map(
              (o) =>
                `<option value="${o.value}" ${
                  o.value === f.default ? "selected" : ""
                }>${o.label}</option>`
            )
            .join("")}
        </select>
      </div>`;
      } else {
        return `
      <div class="col-12">
        <label class="form-label" for="${f.id}">${f.label}</label>
        <input class="form-control" type="${f.type}" id="${f.id}" value="${f.default}">
      </div>`;
      }
    })
    .join("");

  // 1. Load the manifest JSON at startup
  fetch("data/emoji_manifest.json")
    .then((res) => res.json())
    .then((emojiManifest) => {
      // 2. Build lookup: emoji character → htmlEntity
      const emojiLookup = {};
      Object.values(emojiManifest.emojis).forEach((category) => {
        category.forEach((e) => {
          const codePoints = e.unicode
            .split(" ")
            .map((cp) => parseInt(cp.replace("U+", ""), 16));
          const emojiChar = String.fromCodePoint(...codePoints);
          emojiLookup[emojiChar] = e.htmlEntity;
        });
      });

      // 3. Hook up your generate button
      document.getElementById("generateBtn").onclick = () => {
        const values = {};

        // Collect values from configured fields
        config.fields.forEach((f) => {
          const el = document.getElementById(f.id);
          if (!el) return;
          values[f.id] = el.value;
        });

        // Collect manual checkboxes separately
        values.toggleDays = document.getElementById("toggleDays").checked;
        values.toggleHours = document.getElementById("toggleHours").checked;
        values.toggleMinutes = document.getElementById("toggleMinutes").checked;
        values.toggleSeconds = document.getElementById("toggleSeconds").checked;

        let code = "";
        try {
          code = templates[config.template](values) || "";
        } catch (err) {
          console.error("Template generation failed:", err);
        }

        // 🔑 Replace emojis with ESR-safe HTML entities
        Object.keys(emojiLookup).forEach((char) => {
          code = code.split(char).join(emojiLookup[char]);
        });

        // Update output box
        const outputEl = document.getElementById("output");
        if (outputEl) outputEl.textContent = code.trim();

        // Update preview
        const previewEl = document.getElementById("previewArea");
        if (previewEl && code) {
          previewEl.innerHTML = code;
        }
      };
    })
    .catch((err) => console.error("Failed to load emoji manifest:", err));
}

// ===============================
// Modal Template
// ===============================

const templates = {
  modal: ({ modalId, buttonText, modalTitle, modalContent }) => `
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${modalId}">
      ${buttonText}
    </button>
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header btn btn-primary">
            <h5 class="modal-title mb-0" id="${modalId}Label">${modalTitle}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="card-body">${modalContent}</div>
        </div>
      </div>
    </div>`,
};

// ===============================
// Accessibility Flag Template
// ===============================
templates.accessibilityFlag = ({ flagText }) => `
  <div class="accessibility-flag border border-success rounded p-2">
    <strong>♿ Accessibility:</strong> ${flagText}
  </div>`;

// ===============================
// Alert Template
// ===============================
templates.alert = ({ alertType, alertTitle, alertMessage }) => `
  <div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
    <strong>${alertTitle}</strong> ${alertMessage}
  </div>`;

// ===============================
// Breadcrumb Template (repeatable form)
// ===============================
templates.breadcrumb = ({ items }) => {
  const listItems = items
    .map((i, idx) => {
      if (idx === items.length - 1) {
        return `<li class="breadcrumb-item active" aria-current="page">${i.label}</li>`;
      }
      return `<li class="breadcrumb-item"><a onclick="showPage('${i.url}')">${i.label}</a></li>`;
    })
    .join("\n");

  return `
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    ${listItems}
  </ol>
</nav>`;
};

// ===============================
// C4 Context Diagram Template
// ===============================
templates.c4context = ({ title, people, systems, externals, rels }) => {
  const peopleLines = people
    .map((p) => `Person(${p.id}, "${p.label}", "${p.desc}")`)
    .join("\n");

  const systemLines = systems
    .map((s) => `System(${s.id}, "${s.label}", "${s.desc}")`)
    .join("\n");

  const externalLines = externals
    .map((e) => `System_Ext(${e.id}, "${e.label}", "${e.desc}")`)
    .join("\n");

  const relLines = rels
    .map((r) => `${r.type}(${r.from}, ${r.to}, "${r.label}")`)
    .join("\n");

  return `
<pre class="mermaid snippet">
C4Context
  title ${title}
  ${peopleLines}
  ${systemLines}
  ${externalLines}

  ${relLines}
</pre>`;
};

// ===============================
// Mermaid Class Diagram Template
// ===============================
templates.classDiagram = ({ classes, rels }) => {
  const classDefs = classes
    .map((c) => {
      const attrs = c.attrs.filter((a) => a).join("\n    ");
      const methods = c.methods.filter((m) => m).join("\n    ");
      return `class ${c.name} {
    ${attrs}
    ${methods}
  }`;
    })
    .join("\n\n");

  const relDefs = rels
    .map((r) => `${r.from} ${r.type} ${r.to}${r.label ? " : " + r.label : ""}`)
    .join("\n");

  return `
<div class="mermaid snippet">
classDiagram
  ${classDefs}

  ${relDefs}
</div>`;
};

// ===============================
// Carousel Template (repeatable form)
// ===============================
templates.carousel = ({ carouselId, slides }) => {
  // Indicators
  const indicatorsBS5 = slides
    .map(
      (s, i) => `
    <button type="button" data-bs-target="#${carouselId}BS5" data-bs-slide-to="${i}"
      ${i === 0 ? 'class="active" aria-current="true"' : ""}
      aria-label="Slide ${i + 1}"></button>`
    )
    .join("");

  const indicatorsBS4 = slides
    .map(
      (s, i) => `
    <li data-target="#${carouselId}BS4" data-slide-to="${i}" ${
        i === 0 ? 'class="active"' : ""
      }></li>`
    )
    .join("");

  // Items
  const itemsBS5 = slides
    .map(
      (s, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${s.img}" class="d-block w-100" alt="${s.alt}">
      <div class="carousel-caption d-none d-md-block">
        <h5>${s.title}</h5>
        <p>${s.caption}</p>
      </div>
    </div>`
    )
    .join("");

  const itemsBS4 = slides
    .map(
      (s, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <img src="${s.img}" class="d-block w-100" alt="${s.alt}">
      <div class="carousel-caption d-none d-md-block">
        <h5>${s.title}</h5>
        <p>${s.caption}</p>
      </div>
    </div>`
    )
    .join("");

  return {
    bs5: `
<!-- ============================= -->
<!-- Website (Bootstrap 5) version -->
<!-- ============================= -->
<div id="${carouselId}BS5" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-indicators">${indicatorsBS5}</div>
  <div class="carousel-inner">${itemsBS5}</div>
  <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}BS5" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}BS5" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>`,

    bs4: `
<!-- ============================= -->
<!-- ESR (Bootstrap 4) version     -->
<!-- ============================= -->
<div id="${carouselId}BS4" class="carousel slide" data-ride="carousel">
  <ol class="carousel-indicators">${indicatorsBS4}</ol>
  <div class="carousel-inner">${itemsBS4}</div>
  <a class="carousel-control-prev" href="#${carouselId}BS4" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#${carouselId}BS4" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>
</div>`,
  };
};

// ===============================
// Did You Know Template
// ===============================
templates.didYouKnow = ({ summaryText, bodyText }) => `
<details class="did-you-know">
  <summary>${summaryText}</summary>
  <p>${bodyText}</p>
</details>`;

// ===============================
// Dohicky Grid Template
// ===============================
templates.dohickyGrid = ({ rows }) => {
  // rows is an array of arrays: [[cell1, cell2], [cell1, cell2, cell3], ...]
  const gridHtml = rows
    .map(
      (row) => `
      <div class="dohicky-grid">
        ${row.map((cell) => `<div class="dohicky-item">${cell}</div>`).join("")}
      </div>`
    )
    .join("\n");

  return gridHtml;
};

// ===============================
// Mermaid ER Diagram Template
// ===============================
templates.erDiagram = ({ entities, relations }) => {
  const entityBlocks = entities
    .map((e) => {
      const attrs = e.attrs
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) => `  ${a}`)
        .join("\n");
      return `${e.name} {\n${attrs}\n}`;
    })
    .join("\n\n");

  const relLines = relations
    .map((r) => `${r.left} ${r.cardinality} ${r.right} : ${r.label}`)
    .join("\n");

  return `
<pre class="mermaid snippet">
erDiagram
  ${relLines}

  ${entityBlocks}
</pre>`;
};

// ===============================
// Fact Box Template
// ===============================
templates.factBox = ({ label, body }) => `
<div class="factbox">
  <strong>${label}</strong> ${body}
</div>`;

// ===============================
// Footer Template
// ===============================
templates.footer = ({ orgName, siteTitle, year, supportEmail }) => `
<footer class="text-center py-4 mt-5 border-top">
  <p>&copy; ${year} ${orgName}. ${siteTitle}.</p>
  <p><a href="mailto:${supportEmail}">${supportEmail}</a></p>
</footer>`;

// ===============================
// Mermaid Gantt Chart Template
// ===============================
templates.gantt = ({ title, dateFormat, axisFormat, sections }) => {
  const sectionBlocks = sections
    .map((sec) => {
      const tasks = sec.tasks
        .map(
          (t) =>
            `${t.label} :${t.status ? t.status + "," : ""} ${t.id}, ${
              t.start
            }, ${t.duration}`
        )
        .join("\n  ");
      return `section ${sec.name}\n  ${tasks}`;
    })
    .join("\n\n");

  return `
<pre class="mermaid snippet">
gantt
  title ${title}
  dateFormat  ${dateFormat}
  axisFormat  ${axisFormat}

  ${sectionBlocks}
</pre>`;
};

// ===============================
// Mermaid Git Graph Template
// ===============================
templates.gitGraph = ({ steps }) => {
  const lines = steps
    .map((s) => {
      switch (s.type) {
        case "commit":
          return `commit${s.id ? ` id: "${s.id}"` : ""}${
            s.tag ? ` tag: "${s.tag}"` : ""
          }`;
        case "branch":
          return `branch ${s.branch}`;
        case "checkout":
          return `checkout ${s.branch}`;
        case "merge":
          return `merge ${s.branch}${s.tag ? ` tag: "${s.tag}"` : ""}`;
        default:
          return "";
      }
    })
    .join("\n  ");

  return `
<pre class="mermaid snippet">
gitGraph
  ${lines}
</pre>`;
};

// ===============================
// Mermaid Mindmap Template (fixed indentation/whitespace)
// ===============================
templates.mindmap = ({ root, branches }) => {
  const indent = (n) => "  ".repeat(n);

  // Only keep branches with labels; only keep children with labels
  const cleanBranches = (branches || [])
    .map((b) => ({
      label: (b.label || "").trim(),
      children: (b.children || [])
        .map((c) => ({ label: (c.label || "").trim() }))
        .filter((c) => c.label),
    }))
    .filter((b) => b.label);

  const branchLines = cleanBranches
    .map((b) => {
      const children = b.children
        .map((c) => `${indent(3)}${c.label}`)
        .join("\n");
      return `${indent(2)}${b.label}${children ? `\n${children}` : ""}`;
    })
    .join("\n");

  return `
<pre class="mermaid snippet">
mindmap
${indent(1)}root((${root.trim()}))
${branchLines ? branchLines : ""}
</pre>`.trim();
};

// ===============================
// Simple Button Template
// ===============================
templates.simpleButton = ({ label, href, style }) => `
<a class="btn ${style} w-100 text-start mb-2" href="${href}">${label}</a>`;

// ===============================
// Mermaid Pie Chart Template
// ===============================
templates.pieChart = ({ title, slices }) => {
  const sliceLines = slices
    .filter((s) => s.label && s.value)
    .map((s) => `  "${s.label}" : ${s.value}`)
    .join("\n");

  return `
<pre class="mermaid snippet">
pie showData
  title ${title}
${sliceLines}
</pre>`;
};

// ===============================
// Simple Link Button Template
// ===============================
templates.simpleLinkButton = ({ label, href, style, newTab }) => `
<a class="btn ${style} w-100 text-start mb-2" href="${href}"${
  newTab === "yes" ? ' target="_blank"' : ""
}>${label}</a>`;

// ===============================
// Simple Flowchart Template with node shapes + edge labels
// ===============================
templates.simpleFlowchart = ({ direction, nodes, edges }) => {
  const wrapLabel = (text, shape) => {
    const label = (text || "").trim();
    switch (shape) {
      case "square":
        return `[${label}]`; // square box
      case "rounded":
        return `(${label})`; // rounded box
      case "stadium":
        return `([${label}])`; // stadium
      case "subroutine":
        return `[[${label}]]`; // subroutine
      case "cylinder":
        return `[(${label})]`; // cylinder
      case "circle":
        return `((${label}))`; // circle
      case "decision":
        return `{${label}}`; // diamond
      default:
        return `[${label}]`; // fallback
    }
  };

  const nodeLines = nodes
    .filter((n) => n.id && n.label)
    .map((n) => `${n.id}${wrapLabel(n.label, n.shape)}`)
    .join("\n");

  const edgeLines = edges
    .filter((e) => e.from && e.to)
    .map((e) => {
      const hasLabel =
        e.label && e.label !== "undefined" && e.label.trim() !== "";
      return `${e.from}${hasLabel ? ` -- ${e.label} --> ` : ` --> `}${e.to}`;
    })
    .join("\n");

  return `
<pre class="mermaid snippet">
flowchart ${direction}
${nodeLines}
${edgeLines}
</pre>`.trim();
};

// ===============================
// Quote Box Template
// ===============================
templates.quoteBox = ({ quote, author }) => `
<blockquote class="quote-box">
  <p>“${quote}”</p>
  <footer>— ${author}</footer>
</blockquote>`;

// ===============================
// Image Template
// ===============================
templates.imageBlock = ({
  src,
  alt,
  caption,
  shape,
  alignment,
  shadow,
  border,
  maxWidth,
  lazy,
  captionStyle,
}) => `
<div class="text-center">
  <img src="${src}"
       alt="${alt}"
       class="img-fluid ${shape} ${alignment} ${shadow} ${border}"
       style="max-width: ${maxWidth}%; height: auto;"
       ${lazy ? `loading="${lazy}"` : ""}>
  ${
    caption
      ? `<small class="d-block mt-2 ${captionStyle}">“${caption}”</small>`
      : ""
  }
</div>`;

// ===============================
// Role Card Template
// ===============================
templates.roleCard = ({ icon, title, description }) => `
<div class="role-card">
  <h3>${icon} ${title}</h3>
  <p>${description}</p>
</div>`;

// ===============================
// Mermaid Sequence Diagram Template
// ===============================
templates.sequenceDiagram = ({ participants, messages }) => {
  const participantLines = participants
    .filter((p) => p.name)
    .map((p) => `  participant ${p.name}`)
    .join("\n");

  const messageLines = messages
    .filter((m) => m.from && m.to && m.text)
    .map((m) => `  ${m.from}${m.arrow || "->>"}${m.to}: ${m.text}`)
    .join("\n");

  return `
<pre class="mermaid snippet">
sequenceDiagram
${participantLines}
${messageLines}
</pre>`.trim();
};

// ===============================
// Shout-out Card Template
// ===============================
templates.shoutCard = ({ icon, name, message }) => `
<div class="shout-card">
  <strong>${icon} Shout-out:</strong> Thanks to <em>${name}</em> ${message}
</div>`;

// ===============================
// Mermaid State Diagram Template
// ===============================
templates.stateDiagram = ({ states, transitions }) => {
  const stateLines = states
    .filter((s) => s.name)
    .map((s) => `  ${s.name}`)
    .join("\n");

  const transitionLines = transitions
    .filter((t) => t.from && t.to)
    .map((t) => `  ${t.from} --> ${t.to}${t.label ? ` : ${t.label}` : ""}`)
    .join("\n");

  return `
<pre class="mermaid snippet">
stateDiagram-v2
${stateLines}
${transitionLines}
</pre>`.trim();
};

// ===============================
// Tabs Template
// ===============================
templates.tabs = ({ id, tabs }) => {
  // Build nav items for BS5 (buttons)
  const navItemsBS5 = tabs
    .map(
      (t, i) => `
    <li class="nav-item" role="presentation">
      <button class="nav-link ${i === 0 ? "active" : ""}" 
              id="tabBtn${id}BS5${i}" 
              data-bs-toggle="tab" 
              data-bs-target="#tabPane${id}BS5${i}" 
              type="button" role="tab" 
              aria-controls="tabPane${id}BS5${i}" 
              aria-selected="${i === 0 ? "true" : "false"}">
        ${t.label}
      </button>
    </li>`
    )
    .join("");

  const tabPanesBS5 = tabs
    .map(
      (t, i) => `
    <div class="tab-pane fade ${i === 0 ? "show active" : ""}" 
         id="tabPane${id}BS5${i}" 
         role="tabpanel" 
         aria-labelledby="tabBtn${id}BS5${i}">
      <p>${t.content}</p>
    </div>`
    )
    .join("");

  // Build nav items for BS4 (anchors)
  const navItemsBS4 = tabs
    .map(
      (t, i) => `
    <li class="nav-item">
      <a class="nav-link ${i === 0 ? "active" : ""}" 
         id="tabBtn${id}BS4${i}" 
         data-toggle="tab" 
         href="#tabPane${id}BS4${i}" 
         role="tab" 
         aria-controls="tabPane${id}BS4${i}" 
         aria-selected="${i === 0 ? "true" : "false"}">
        ${t.label}
      </a>
    </li>`
    )
    .join("");

  const tabPanesBS4 = tabs
    .map(
      (t, i) => `
    <div class="tab-pane fade ${i === 0 ? "show active" : ""}" 
         id="tabPane${id}BS4${i}" 
         role="tabpanel" 
         aria-labelledby="tabBtn${id}BS4${i}">
      <p>${t.content}</p>
    </div>`
    )
    .join("");

  return {
    bs5: `
<!-- ============================= -->
<!-- Website (Bootstrap 5) version -->
<!-- ============================= -->
<ul class="nav nav-tabs" id="tabNav${id}BS5" role="tablist">
  ${navItemsBS5}
</ul>
<div class="tab-content" id="tabContent${id}BS5">
  ${tabPanesBS5}
</div>`,

    bs4: `
<!-- ============================= -->
<!-- ESR (Bootstrap 4) version     -->
<!-- ============================= -->
<ul class="nav nav-tabs" id="tabNav${id}BS4" role="tablist">
  ${navItemsBS4}
</ul>
<div class="tab-content" id="tabContent${id}BS4">
  ${tabPanesBS4}
</div>`,
  };
};

// ===============================
// Mermaid Timeline Template
// ===============================
templates.timelineDiagram = ({ title, events }) => {
  const eventLines = events
    .filter((e) => e.date && e.text)
    .map((e) => `  ${e.date} : ${e.text}`)
    .join("\n");

  return `
<pre class="mermaid snippet">
timeline
  title ${title}
${eventLines}
</pre>`.trim();
};

// ===============================
// Tip Box Template
// ===============================
templates.tipBox = ({ title, body }) => `
<details class="tip-box">
  <summary>${title}</summary>
  <p>${body}</p>
</details>`;

// ===============================
// Bootstrap Collapse Template
// ===============================
templates.collapseSection = ({ id, label, content }) => ({
  bs5: `
  <!-- ============================================= -->
<!-- Website (Bootstrap 5) version -->
<!-- ============================================= -->
<button class="btn btn-primary w-100 text-start mb-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#${id}-bs5"
        aria-expanded="false"
        aria-controls="${id}-bs5">
  ${label}
</button>
<div class="collapse mt-3" id="${id}-bs5">
  <div class="card card-body">${content}</div>
</div>`,
  bs4: `
  <!-- ============================================= -->
<!-- ESR (Bootstrap 4) version  (For use in ESR)   -->
<!-- ============================================= -->
<button class="btn btn-primary w-100 text-left mb-2"
        type="button"
        data-toggle="collapse"
        data-target="#${id}-bs4"
        aria-expanded="false"
        aria-controls="${id}-bs4">
  ${label}
</button>
<div class="collapse mt-3" id="${id}-bs4">
  <div class="card card-body">${content}</div>
</div>`,
});

// ===============================
// Update Banner Template
// ===============================
templates.updateBanner = ({ text }) => `
<div class="update-banner">
  <strong>🔄 Update:</strong> ${text}
</div>`;

// ===============================
// Mermaid Journey Template
// ===============================
templates.journeyDiagram = ({ title, sections }) => {
  const sectionBlocks = sections
    .map((sec) => {
      const steps = sec.steps
        .filter((s) => s.text && s.score && s.actor)
        .map((s) => `    ${s.text}: ${s.score}: ${s.actor}`)
        .join("\n");
      return `  section ${sec.name}\n${steps}`;
    })
    .join("\n\n");

  return `
<pre class="mermaid snippet">
journey
  title ${title}
${sectionBlocks}
</pre>`.trim();
};

// ===============================
// Mermaid XY Chart Template (safe)
// ===============================
templates.xyChart = ({
  title,
  xLabels,
  yLabel,
  yMin,
  yMax,
  barValues,
  lineValues,
}) => {
  const parts = [
    "xychart-beta",
    `  title "${title}"`,
    `  x-axis [${xLabels.join(", ")}]`,
    `  y-axis "${yLabel}" ${yMin} --> ${yMax}`,
  ];

  if (barValues && barValues.length && barValues.some((v) => v !== "")) {
    parts.push(`  bar [${barValues.join(", ")}]`);
  }

  if (lineValues && lineValues.length && lineValues.some((v) => v !== "")) {
    parts.push(`  line [${lineValues.join(", ")}]`);
  }

  return `
<pre class="mermaid snippet">
${parts.join("\n")}
</pre>`.trim();
};

// ===============================
// Navigation JSON Template
// ===============================
templates.navJson = ({ items }) => {
  return JSON.stringify(items, null, 2);
};

// ===============================
// Page Code Template
// ===============================
templates.pageCode = ({
  siteTitle,
  gradientTitle,
  welcomeTitle,
  leadText,
  introText,
  micrositeText,
  kitItems,
  fullWidthContent,
}) => {
  const listItems = kitItems
    .filter((i) => i.trim() !== "")
    .map((i) => `            <li>${i}</li>`)
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${siteTitle}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="Assets/css/style.css" rel="stylesheet" />
</head>
<body class="glass">
  <div id="shared-header"></div>
  <div id="main-nav"></div>
  <div id="sidebar-nav"></div>

  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb" id="breadcrumb"></ol>
    </nav>

    

    <div class="row">
      <div class="col-md-4 gradient-col d-flex align-items-center justify-content-center">
        <h3 class="gradient-text">${gradientTitle}</h3>
      </div>
      <div class="col-md-8">
        <div class="homepage-intro text-center py-4 px-3">
          <h1 class="gradient-text mb-3">${welcomeTitle}</h1>
          <p class="lead">${leadText}</p>
          <p>${introText}</p>
          <h5 class="mt-4">🧭 What’s a Microsite?</h5>
          <p>${micrositeText}</p>
          <h5 class="mt-4">🎨 What’s in the Kit?</h5>
          <ul class="text-start d-inline-block">
${listItems}
          </ul>
        </div>
      </div>
      <!-- Page full width content -->
    <div class="row mt-4">
      <div class="col-md">
${fullWidthContent}
      </div>
    </div>
    </div>
  </div>

  <div id="shared-footer"></div>
</body>
</html>`.trim();
};

// ===============================
// Flu Campaign Template (full match)
// ===============================
templates.fluPortlet = ({
  campaignTitle,
  introText,
  startDate,
  endDate,
  infoLinkText,
  infoLink,
  countdownDate,
  piePercentage,
  pieColor,
  barChart,
  bookingLinkText,
  bookingLink,
}) => {
  const barItems = barChart
    .map(
      (group) => `
        { label: "${group.label}", value: ${group.value}, color: "${group.color}", delay: "${group.delay}" }
      `
    )
    .join(",");

  return `
<div>

<style type="text/css">

 /* Do not edit the css */
 .Flu_body {
     margin: 0;
     font-family: 'Droid Sans', Arial, sans-serif;
     background: radial-gradient(circle at top left, #005EB8 0%, #003087 100%);
     color: white;
 }

 .container {
     max-width: 960px;
     margin: auto;
     padding: 2rem;
 }

 .Custom_Headings {
     text-align: center;
     color: #FAE100;
     text-shadow: 1px 1px 3px #000;
 }

 .Custom_Text {
     font-size: 1rem;
     line-height: 1.6;
 }

 .Custom_Link {
     color: #FAE100;
     text-decoration: underline;
 }

 .glass-card {
     background: rgba(255, 255, 255, 0.1);
     border-radius: 12px;
     padding: 1.5rem;
     box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
     backdrop-filter: blur(10px);
     margin-bottom: 2rem;
 }

 #countdown {
     font: 24px 'Droid Sans', Arial, sans-serif;
     color: white;
     height: 120px;
     text-align: center;
     background: #005EB8;
     background-image: -webkit-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
     background-image: -moz-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
     background-image: -ms-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
     background-image: -o-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
     border: 1px solid #111;
     border-radius: 5px;
     box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.6);
     margin: auto;
     position: relative;
     top: 0;
     bottom: 0;
     left: 0;
     right: 0;
 }

 @property --p {
     syntax: '<number>';
     inherits: true;
     initial-value: 0;
 }

 .piecontainer {
     margin-left: auto;
     margin-right: auto;
     width: 8em
 }

 .pie {
     --p: 0;
     --b: 22px;
     --c: darkred;
     --w: 150px;

     width: var(--w);
     aspect-ratio: 1;
     position: relative;
     display: inline-grid;
     margin: 5px;
     place-content: center;
     font-size: 25px;
     font-weight: bold;
     font-family: sans-serif;

 }

 .pie:before,
 .pie:after {
     content: "";
     position: absolute;
     border-radius: 50%;
 }

 .pie:before {
     inset: 0;
     background:
         radial-gradient(farthest-side, var(--c) 98%, #0000) top/var(--b) var(--b) no-repeat,
         conic-gradient(var(--c) calc(var(--p)*1%), #0000 0);
     -webkit-mask: radial-gradient(farthest-side, #0000 calc(99% - var(--b)), #000 calc(100% - var(--b)));
     mask: radial-gradient(farthest-side, #0000 calc(99% - var(--b)), #000 calc(100% - var(--b)));
 }

 .pie:after {
     inset: calc(50% - var(--b)/2);
     background: var(--c);
     transform: rotate(calc(var(--p)*3.6deg)) translateY(calc(50% - var(--w)/2));
 }

 .animate {
     animation: p 1s .5s both;
 }



 @keyframes p {
     from {
         --p: 0
     }
 }

 .BarChart {
     animation-name: BarChart;
 }

 section article.BarChart {
     width: auto;
     height: auto;
 }

 section article.BarChart p {
     z-index: 2;
     color: black;
     mix-blend-mode: difference;
     padding: 2px;
     position: relative;
     box-sizing: content-box;
     overflow: hidden;
 }

 section article.BarChart div span:nth-child(2) {
     z-index: -1;
     position: absolute;
     top: 0;
     bottom: 0;
     left: 0;
     right: 0;
     background: #5E95E8;
     height: 100%;
 }


 .BarChart {
     animation: BarChart 1.25s cubic-bezier(0.17, 0.67, 0, 1);
 }

 @keyframes BarChart {
     0% {
         left: -500px;
         opacity: 0;
     }

     100% {
         left: 0;
         opacity: 1;
     }
 }
                       
#countdown {
    font: 24px 'Droid Sans', Arial, sans-serif;
    color: white;
    min-width: 220px;
    height: 120px;
    text-align: center;
    background: #005EB8;
    background-image: -webkit-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
    background-image: -moz-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
    background-image: -ms-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
    background-image: -o-linear-gradient(top, #005EB8, #003087, #003087, #005EB8);
    border: 1px solid #111;
    border-radius: 5px;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.6);
    margin: auto;
    padding: 12px 20px;
    position: relative;

    /* NEW: flexbox centering */
    display: flex;
    justify-content: center;   /* center horizontally */
    align-items: center;       /* center vertically */
}

#tiles {
    display: flex;
    justify-content: space-around;
    align-items: center;       /* center tile contents vertically */
    gap: 10px;
    width: 100%;
}

.tile {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tile span {
    font: bold 20px 'Droid Sans', Arial, sans-serif;
    text-align: center;
    color: #111;
    background-color: #ddd;
    background-image: -webkit-linear-gradient(top, #bbb, #eee);
    background-image: -moz-linear-gradient(top, #bbb, #eee);
    background-image: -ms-linear-gradient(top, #bbb, #eee);
    background-image: -o-linear-gradient(top, #bbb, #eee);
    border-top: 1px solid #fff;
    border-radius: 3px;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.7);
    padding: 4px 0;
    width: 100%;
    max-width: 60px;
    position: relative;
    margin-bottom: 4px;        /* space between number and label */
}

.tile span:before {
    content: "";
    width: 10%;
    height: 13px;
    background: #111;
    display: block;
    position: absolute;
    top: 41%;
    left: -3px;
    z-index: -1;
}

.tile span:after {
    content: "";
    width: 100%;
    height: 1px;
    background: #eee;
    border-top: 1px solid #333;
    display: block;
    position: absolute;
    top: 48%;
    left: 0;
}

.tile .label {
    font: 12px 'Droid Sans', Arial, sans-serif;
    color: #FAE100;
    text-shadow: 1px 1px 0px #000;
    text-align: center;
    text-transform: uppercase;
}
</style>

<div class="Flu_body">
  <div class="container py-5">
    <div class="glass-card">

      <h1 class="text-center mb-4 Custom_Headings">${campaignTitle}</h1>

      <p class="Custom_Text">
        ${introText}
      </p>

      <!-- Info Link  -->
${
  infoLink && infoLinkText
    ? `
<p class="Custom_Text">
  <a class="Custom_Link" href="${infoLink}" target="_blank">
    <span class="Custom_Link">${infoLinkText}</span>
  </a>
</p>
`
    : ""
}

      <p class="Custom_Text">
        This year’s Flu campaign will be running from
        <strong>${startDate}</strong> to <strong>${endDate}</strong>.
      </p>

<!-- Countdown -->
<div class="card-body">
  <div id="countdown">
    <div id="tiles"></div>
  </div>
</div>
      <!-- Pie Chart -->
      <h2 class="mt-5 Custom_Headings">Current Progress for Flu Vaccinations</h2>
      <p class="Custom_Text">The current uptake is as follows:</p>
      <div id="pieChartContainer" class="piecontainer text-center"></div>

      <!-- Bar Chart -->
      <section id="BarChart" class="toad-fullscreen">
        <article class="BarChart" id="barChartContainer"></article>
      </section>

      <!-- Booking Button (only if both text + URL provided) -->
      ${
        bookingLink && bookingLinkText
          ? `
        <h2 class="mt-5 Custom_Headings">Arranging your vaccination</h2>
        <p class="Custom_Text">
          <a class="btn btn-primary btn-block Custom_Link" href="${bookingLink}" target="_blank">
            ${bookingLinkText}
          </a>
        </p>
      `
          : ""
      }

    </div>
  </div>
</div>

<!-- Central Config Object -->
<script>
  (() => {
    const fluConfig = {
      countdownDate: "${countdownDate}",
      pieChart: { percentage: ${piePercentage}, color: "${pieColor}" },
      barChart: [${barItems}]
    };

  // Countdown
const targetDate = new Date(fluConfig.countdownDate);

// helper to read checkbox state
function getCountdownConfig() {
  return {
    showDays:    document.getElementById("toggleDays").checked,
    showHours:   document.getElementById("toggleHours").checked,
    showMinutes: document.getElementById("toggleMinutes").checked,
    showSeconds: document.getElementById("toggleSeconds").checked
  };
}

function calculateCountdown(targetDate, config) {
  const now = new Date();
  let diff = Math.max(0, targetDate - now);
  let totalSeconds = Math.floor(diff / 1000);

  let days = Math.floor(totalSeconds / (3600 * 24));
  let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  if (!config.showDays) { hours += days * 24; days = 0; }
  if (!config.showHours) { minutes += hours * 60; hours = 0; }
  if (!config.showMinutes) { seconds += minutes * 60; minutes = 0; }

  return { days, hours, minutes, seconds };
}

function renderCountdown(targetDate, config, tilesId) {
  const tiles = document.getElementById(tilesId);
  if (!tiles) return;

  function update() {
    const { days, hours, minutes, seconds } = calculateCountdown(targetDate, config);
    let html = "";
    if (config.showDays)    html += '<div class="tile"><span>' + days    + '</span><div class="label">Days</div></div>';
    if (config.showHours)   html += '<div class="tile"><span>' + hours   + '</span><div class="label">Hours</div></div>';
    if (config.showMinutes) html += '<div class="tile"><span>' + minutes + '</span><div class="label">Mins</div></div>';
    if (config.showSeconds) html += '<div class="tile"><span>' + seconds + '</span><div class="label">Secs</div></div>';
    tiles.innerHTML = html;
  }

  update();
  setInterval(update, 1000);
}

// initialise once
renderCountdown(targetDate, getCountdownConfig(), "tiles");

// re‑render whenever a checkbox changes
["toggleDays","toggleHours","toggleMinutes","toggleSeconds"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    renderCountdown(targetDate, getCountdownConfig(), "tiles");
  });
});

    // Pie Chart
    const pie = document.createElement("div");
    pie.className = "pie animate";
    pie.style = \`--p:\${fluConfig.pieChart.percentage};--c:\${fluConfig.pieChart.color}\`;
    pie.textContent = \`\${fluConfig.pieChart.percentage}%\`;
    document.getElementById("pieChartContainer").appendChild(pie);

    // Bar Chart
    const barContainer = document.getElementById("barChartContainer");
    fluConfig.barChart.forEach(group => {
      const div = document.createElement("div");
      div.innerHTML = \`
        <p class="Custom_Text" style="margin:0;">\${group.label} - \${group.value}%<span></span>
        <span class="BarChart" style="width:\${group.value}%;animation-delay:\${group.delay};background-color:\${group.color};"></span></p>
      \`;
      barContainer.appendChild(div);
    });
  })();

  </script>
</div>
  `.trim();
};

// Assets/js/templates.js
window.templates = {};

// Define this once, alongside templates.basicPage
templates.launcher = ({ image, title, intro, button, target }) => `
<div class="vetContainer">
  <div class="vetItem">
    <img src="${image}" alt="${title}" class="responsive vetImage">
  </div>
  <div class="alert alert-primary">
    <h4 style="text-align:center;">${title}</h4>
    <p>${intro}</p>
  </div>
  <div>
    <a href="#" onclick="showElementsByID('${target}');"
       class="btn btn-primary btn-block" role="button">${button}</a>
  </div>
</div>
`;

templates.navbar = (pages) => {
  // Build a lookup of parent -> children
  const tree = {};
  pages.forEach((p) => {
    const parent = p.parentId || "root";
    if (!tree[parent]) tree[parent] = [];
    tree[parent].push(p);
  });

  // Recursive renderer
  const renderItems = (parent) => {
    if (!tree[parent]) return "";
    return tree[parent]
      .map((p) => {
        const children = renderItems(p.id);
        if (children) {
          // Dropdown for pages with children
          return `
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="nav-${p.id}" role="button"
                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${p.bannerTitle}
              </a>
              <div class="dropdown-menu" aria-labelledby="nav-${p.id}">
                ${children}
              </div>
            </li>
          `;
        } else {
          // Simple link
          return `
            <a class="dropdown-item" href="#" onclick="showElementsByID('${p.id}')">${p.bannerTitle}</a>
          `;
        }
      })
      .join("");
  };

  // Top-level navbar (BS4)
  return `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">${pages[0]?.bannerTitle || "Home"}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarPages"
                aria-controls="navbarPages" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarPages">
          <ul class="navbar-nav mr-auto">
            ${renderItems("root")}
          </ul>
        </div>
      </div>
    </nav>
  `;
};

// basicPage now accepts two arguments: the page values AND allPages
templates.basicPage = (
  { id, parentId, bannerTitle, bannerLogo, section1, col40, col60, section2 },
  allPages
) => `
<div class="sidenav" id="${id}">
  <a class="closebtn" href="#"
     onclick="hideElementsByClass('sidenav');${
       parentId ? `showElementsByID('${parentId}')` : ""
     }">×</a>

  <div class="container LayoutParent">
    <!-- Header / Banner -->
    <div class="row">
      <div class="col-12 Layout1" style="background-color:#005EB8; color:white; padding:1rem; border-radius:4px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        ${
          bannerLogo
            ? `<img class="Logo" src="${bannerLogo}" alt="${bannerTitle}">`
            : ""
        }
        <h3>${bannerTitle}</h3>
        ${templates.navbar(allPages)}
      </div>
    </div>

    <!-- Navigation / Intro -->
    <div class="row">
      <div class="col-12 Layout2">
        ${section1}
      </div>
    </div>

    <!-- Main content columns -->
    <div class="row">
      <div class="col-md-4 Layout3" style="border:3px solid #005EB8; padding:1rem; border-radius:8px; background-color:#f0f8ff; text-align:center; box-shadow:0 4px 10px rgba(0,94,184,0.3);">
        ${col40}
      </div>
      <div class="col-md-8 Layout4">
        ${col60}
      </div>
    </div>

    <!-- Final section -->
    <div class="row">
      <div class="col-12 Layout5">
        ${section2}
      </div>
    </div>
  </div>
</div>
`;

// ===============================
// Full Portlet Template
// ===============================

templates.portlet = ({
  title,
  intro,
  alertStyle,
  carousel,
  imageBlock,
  belowText,
  toggleBlocks,
  standaloneButtons,
  esrLinks,
}) => {
  // 📝 Alert wrapper
  const hasStyle = alertStyle && alertStyle !== "none";
  const alertClass = hasStyle
    ? `class="alert alert-${alertStyle}" role="alert"`
    : "";
  const header = `
  <div ${alertClass}>
    ${title ? `<h4>${title}</h4>` : ""}
    ${intro ? `<p>${intro}</p>` : ""}
  </div>
`;

  // 🎠 Carousel
  let carouselHtml = "";
  if (carousel && carousel.slides?.length) {
    carouselHtml = templates.carousel({
      carouselId: carousel.id,
      slides: carousel.slides,
    }).bs4;
  }

  // 🖼️ Image block
  let imageHtml = "";
  if (imageBlock && imageBlock.src) {
    const imgClass = [
      imageBlock.shape,
      imageBlock.alignment,
      imageBlock.shadow,
      imageBlock.border,
    ]
      .filter(Boolean)
      .join(" ");
    const imgStyle = `max-width:${imageBlock.maxWidth || 100}%;`;
    imageHtml = `
    <img src="${imageBlock.src}" alt="${
      imageBlock.alt
    }" class="${imgClass}" style="${imgStyle}" loading="${imageBlock.lazy}">
    ${
      imageBlock.caption
        ? `<p class="${imageBlock.captionStyle}">${imageBlock.caption}</p>`
        : ""
    }
  `;
  }

  // 🧾 Additional text
  const extraText = belowText ? `<p>${belowText}</p>` : "";

  // 🔄 Toggle blocks
  const togglesHtml = toggleBlocks
    .map((t) => {
      const buttons = t.buttons
        .map(
          (b) =>
            `<a href="${b.url}" class="btn btn-primary btn-sm me-2" ${
              b.newTab ? 'target="_blank"' : ""
            }>${b.label}</a>`
        )
        .join("");
      return `
      <button class="btn btn-outline-secondary mb-2" type="button" data-toggle="collapse" data-target="#${
        t.id
      }" aria-expanded="false" aria-controls="${t.id}">
        ${t.label}
      </button>
      <div class="collapse mb-3" id="${t.id}">
        <div class="card card-body">
          ${t.content ? `<p>${t.content}</p>` : ""}
          ${
            t.image
              ? `<img src="${t.image}" alt="${t.alt}" class="img-fluid mb-2">`
              : ""
          }
          ${buttons}
        </div>
      </div>
    `;
    })
    .join("");

  // 🔘 Standalone buttons
  const standaloneHtml = standaloneButtons
    .map(
      (b) =>
        `<a href="${b.url}" class="btn btn-outline-primary me-2" ${
          b.newTab ? 'target="_blank"' : ""
        }>${b.label}</a>`
    )
    .join("");

  // 🧭 ESR Quick Links
  const esrHtml = esrLinks ? `<div class="mt-3">${esrLinks}</div>` : "";

  // 🧱 Final output
  return `
  <div><div>
    ${header}
    ${carouselHtml}
    ${imageHtml}
    ${extraText}
    ${togglesHtml}
    ${standaloneHtml}
    ${esrHtml}
  </div></div>
`;
};

// ===============================
// Christmas Countdown
// ===============================

templates.countdown = (data) => {
  const snowflakes = Array.from({ length: data.snowflakes }, (_, i) => {
    const left = 2 + i * (96 / data.snowflakes);
    const size = (1.2 + Math.random() * 0.8).toFixed(1);
    const duration = (6 + Math.random() * 4).toFixed(1);
    return `<div class="snowflake" style="left:${left}%; font-size:${size}em; animation-duration:${duration}s;">❄️</div>`;
  }).join("");

  return `
<div id="${data.countdownId}" class="countdown-container">
  <h2 class="countdown-header">${data.title}</h2>
  <div id="tiles" class="countdown-timer"></div>
  <div class="emoji-row">${data.emojiRow}</div>
  ${snowflakes}
</div>

<script>
 (function(){
    const payday = new Date("${data.payday}T00:00:00");
    const tiles = document.getElementById("tiles");

    function calculateCountdown(targetDate, config) {
      const now = new Date();
      let diff = Math.max(0, targetDate - now);
      let totalSeconds = Math.floor(diff / 1000);

      let days = Math.floor(totalSeconds / (3600 * 24));
      let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = totalSeconds % 60;

      if (!config.showDays) { hours += days * 24; days = 0; }
      if (!config.showHours) { minutes += hours * 60; hours = 0; }
      if (!config.showMinutes) { seconds += minutes * 60; minutes = 0; }

      return { days, hours, minutes, seconds };
    }

    function renderCountdown(targetDate, config) {
      function update() {
        const { days, hours, minutes, seconds } = calculateCountdown(targetDate, config);
        let html = "";
        if (config.showDays)    html += '<div class="tile"><span>' + days    + '</span><div class="label">Days</div></div>';
        if (config.showHours)   html += '<div class="tile"><span>' + hours   + '</span><div class="label">Hours</div></div>';
        if (config.showMinutes) html += '<div class="tile"><span>' + minutes + '</span><div class="label">Mins</div></div>';
        if (config.showSeconds) html += '<div class="tile"><span>' + seconds + '</span><div class="label">Secs</div></div>';
        tiles.innerHTML = html;
      }
      update();
      setInterval(update, 1000);
    }

    // Build config from template data (booleans already captured)
const countdownConfig = {
  showDays: ${data.toggleDays},
  showHours: ${data.toggleHours},
  showMinutes: ${data.toggleMinutes},
  showSeconds: ${data.toggleSeconds}
};

    renderCountdown(payday, countdownConfig);

    // Re-render when toggles change
    ["toggleDays","toggleHours","toggleMinutes","toggleSeconds"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", () => {
        renderCountdown(payday, countdownConfig);
      });
    });
  })();
</script>

<style>
  .countdown-container {
    text-align: center;
    padding: 20px;
    background: #001f3f;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    font-family: 'Segoe UI', sans-serif;
    position: relative;
    overflow: hidden;
    color: white;
  }

  .countdown-header {
    color: #ffcccb;
    font-size: 2em;
  }

  .countdown-timer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tile {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tile span {
  font: bold 20px 'Segoe UI', sans-serif;
  color: #111;
  background-color: #ddd;
  border-radius: 3px;
  padding: 4px 0;
  width: 60px;
  margin-bottom: 4px;
}

.tile .label {
  font: 12px 'Segoe UI', sans-serif;
  color: #FAE100;
  text-shadow: 1px 1px 0px #000;
  text-transform: uppercase;
}

  .emoji-row {
    font-size: 2em;
  }

  .snowflake {
    position: absolute;
    top: -30px;
    animation-name: fall-zigzag;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    pointer-events: none;
  }

  @keyframes fall-zigzag {
    0%   { transform: translateX(0) rotate(0deg); top: -30px; opacity: 1; }
    25%  { transform: translateX(-20px) rotate(90deg); }
    50%  { transform: translateX(20px) rotate(180deg); }
    75%  { transform: translateX(-20px) rotate(270deg); }
    100% { transform: translateX(0) rotate(360deg); top: 100%; opacity: 0; }
  }
</style>
`;
};

// ===============================
// Staff Survey Countdown (toggleable)
// ===============================
templates.survey = (data) => {
  return `
<div class="rainbow-background" style="padding:30px; border-radius:15px; box-shadow:0 0 15px rgba(0,0,0,0.4); font-family:'Segoe UI', sans-serif; position:relative; overflow:hidden;">
  <div style="background:white; color:#002244; padding:20px; border-radius:10px; max-width:600px; margin:auto; box-shadow:0 0 10px rgba(0,0,0,0.2); text-align:center;">
    <h2 class="animated-heading" style="font-size:2em; margin-bottom:10px;">${
      data.title
    }</h2>
    <div id="survey-tiles" class="glow-text" style="font-size:1.6em; font-weight:bold; margin-bottom:10px; display:flex; justify-content:center; gap:10px;"></div>
    <div style="font-size:1.2em;">Make your voice heard before <strong>${new Date(
      data.deadline
    ).toLocaleDateString()}</strong>!</div>
    <div class="emoji-bounce" style="font-size:2em; margin-top:15px;">${
      data.emojiRow
    }</div>
  </div>
</div>

<script>
(function(){
  const deadline = new Date("${data.deadline}T23:59:59");
  const tiles = document.getElementById("survey-tiles");

  function calculateCountdown(targetDate, config) {
    const now = new Date();
    let diff = Math.max(0, targetDate - now);
    let totalSeconds = Math.floor(diff / 1000);

    let days = Math.floor(totalSeconds / (3600 * 24));
    let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    if (!config.showDays) { hours += days * 24; days = 0; }
    if (!config.showHours) { minutes += hours * 60; hours = 0; }
    if (!config.showMinutes) { seconds += minutes * 60; minutes = 0; }

    return { days, hours, minutes, seconds };
  }

  function renderCountdown(targetDate, config) {
    function update() {
      const { days, hours, minutes, seconds } = calculateCountdown(targetDate, config);
      let html = "";
      if (config.showDays)    html += '<div class="tile"><span>' + days    + '</span><div class="label">Days</div></div>';
      if (config.showHours)   html += '<div class="tile"><span>' + hours   + '</span><div class="label">Hours</div></div>';
      if (config.showMinutes) html += '<div class="tile"><span>' + minutes + '</span><div class="label">Mins</div></div>';
      if (config.showSeconds) html += '<div class="tile"><span>' + seconds + '</span><div class="label">Secs</div></div>';
      tiles.innerHTML = html;
    }
    update();
    setInterval(update, 1000);
  }

  // Flags baked in from playground checkboxes
  const countdownConfig = {
    showDays: ${data.toggleDays},
    showHours: ${data.toggleHours},
    showMinutes: ${data.toggleMinutes},
    showSeconds: ${data.toggleSeconds}
  };

  renderCountdown(deadline, countdownConfig);
})();
</script>

<style>
.rainbow-background {
  background: linear-gradient(270deg, #ff4d4d, #ffcc00, #33cc33, #3399ff, #cc33ff);
  background-size: 1000% 1000%;
  animation: rainbowShift 20s ease infinite;
}
@keyframes rainbowShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animated-heading {
  background: linear-gradient(to right, #ff4d4d, #ffcc00, #33cc33, #3399ff, #cc33ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textShift 5s ease infinite;
}
@keyframes textShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.glow-text { color: #002244; text-shadow: 0 0 5px #00ccff, 0 0 10px #00ccff, 0 0 20px #00ccff; }
.tile { flex: 1; display:flex; flex-direction:column; align-items:center; }
.tile span { font:bold 20px 'Segoe UI', sans-serif; color:#111; background:#ddd; border-radius:3px; padding:4px 0; width:60px; margin-bottom:4px; }
.tile .label { font:12px 'Segoe UI', sans-serif; color:#FAE100; text-shadow:1px 1px 0px #000; text-transform:uppercase; }
.emoji-bounce { animation: bounce 2s infinite; }
@keyframes bounce {
  0%,20%,50%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
}
</style>
`;
};

// ===============================
// Multiple Paydays Template
// ===============================
templates.payday = (config) => {
  const { countdowns = [], imageUrl = "" } = config;

  const imageHTML =
    imageUrl && imageUrl.trim()
      ? `<div style="text-align: center;"><img src="${imageUrl}" style="max-width:500px;" alt="Pay Day Banner" /></div>`
      : "";

  const countdownHTML = countdowns
    .map((entry, index) => {
      const id = index + 1;
      return `
      <div id="PDcountdown${id}" class="alert-primary">
        <div id="PDtimer${id}" class="PDtimer"></div>
        <div id="PDmessage${id}" class="PDmessage alert-danger">⏰ Pay day has passed!</div>
      </div>
    `;
    })
    .join("");

  const countdownScript = `
<script>
(function(){
  const countdowns = ${JSON.stringify(countdowns)};
  countdowns.forEach((entry, index) => {
    const id = index + 1;
    const targetDate = new Date(entry.PDpayDate).getTime();
    const visibleFrom = new Date(entry.PDvisibleFrom);
    const visibleTo = new Date(entry.PDvisibleTo);
    const now = new Date();
    const wrapper = document.getElementById("PDcountdown" + id);
    wrapper.style.display = (now >= visibleFrom && now <= visibleTo) ? "block" : "none";

    const timer = document.getElementById("PDtimer" + id);
    const message = document.getElementById("PDmessage" + id);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(interval);
        timer.style.display = "none";
        message.style.display = "block";
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      timer.innerHTML = \`
        <h4>The next pay day is \${entry.PDpayDateLabel}:</h4>
        <h5>\${days} days \${hours} hours \${minutes} minutes \${seconds} seconds</h5>
      \`;
    }, 1000);
  });
})();
</script>
`;

  const styles = `
<style>
  .PDtimer {
    font-size: 1.5rem;
    margin: 20px auto;
    background-color: navy;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 50px;
    padding: 20px;
    border: 3px solid #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    max-width: 90%;
    width: 700px;
    animation: fadeIn 1s ease-in-out;
  }

  .PDmessage {
    display: none;
    font-size: 1.5rem;
    color: red;
    margin-top: 20px;
    text-align: center;
    animation: fadeIn 1s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .PDtimer h5 {
    animation: pulse 1s infinite alternate;
  }

  @keyframes pulse {
    from { transform: scale(1); color: #ffffff; }
    to { transform: scale(1.05); color: #ffd700; }
  }

  @media (max-width: 600px) {
    .PDtimer, .PDmessage {
      font-size: 1.2rem;
      padding: 15px;
    }
    .PDtimer h5 {
      font-size: 1rem;
    }
  }
</style>
`;

  return `
${imageHTML}
<div id="PDcountdowns">${countdownHTML}</div>
${styles}
${countdownScript}
`;
};
