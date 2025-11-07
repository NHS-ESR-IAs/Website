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

  document.getElementById("generateBtn").onclick = () => {
    const values = {};
    config.fields.forEach((f) => {
      const el = document.getElementById(f.id);
      values[f.id] = el ? el.value : "";
    });

    let code = "";
    try {
      code = templates[config.template](values) || "";
    } catch (err) {
      console.error("Template generation failed:", err);
    }

    // Update output box if we have code
    const outputEl = document.getElementById("output");
    if (outputEl) outputEl.textContent = code.trim();

    // Update preview if we have code
    const previewEl = document.getElementById("previewArea");
    if (previewEl && code) {
      previewEl.innerHTML = code;
    }
  };
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
     width: 200px;
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
     padding: 12px 0;
     position: relative;
     top: 0;
     bottom: 0;
     left: 0;
     right: 0;
 }

 #countdown:before {
     content: "";
     width: 8px;
     height: 60px;
     background: #444;
     background-image: -webkit-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -moz-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -ms-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -o-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     border: 1px solid #111;
     border-top-left-radius: 6px;
     border-bottom-left-radius: 6px;
     display: block;
     position: absolute;
     top: 20px;
     left: -8px;
 }

 #countdown:after {
     content: "";
     width: 8px;
     height: 60px;
     background: #444;
     background-image: -webkit-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -moz-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -ms-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     background-image: -o-linear-gradient(top, #555, #41B6E6, #41B6E6, #555);
     border: 1px solid #111;
     border-top-right-radius: 6px;
     border-bottom-right-radius: 6px;
     display: block;
     position: absolute;
     top: 20px;
     right: -8px;
 }

 #countdown #tiles {
     position: relative;
     z-index: 1;
 }

 #countdown #tiles>span {
     width: 35px;
     max-width: 35px;
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
     margin: 0 7px;
     padding: 4px 0;
     display: inline-block;
     position: relative;
 }

 #countdown #tiles>span:before {
     content: "";
     width: 10%;
     height: 13px;
     background: #111;
     display: block;
     padding: 0 3px;
     position: absolute;
     top: 41%;
     left: -3px;
     z-index: -1;
 }

 #countdown #tiles>span:after {
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

 #countdown .CDlabels {
     width: 120%;
     height: 25px;
     text-align: left;
     position: absolute;
     bottom: 28px;
     left: -36px;
 }

 #countdown .CDlabels li {
     width: 44px;
     font: 12px 'Droid Sans', Arial, sans-serif;
     color: #FAE100;
     text-shadow: 1px 1px 0px #000;
     text-align: center;
     text-transform: uppercase;
     display: inline-block;
     left: -40;
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
        <div id="countdown">Countdown
          <div id="tiles"></div>
          <div class="CDlabels">
            <ul>
              <li class="Custom_Text">Days</li>
              <li class="Custom_Text">Hours</li>
              <li class="Custom_Text">Mins</li>
              <li class="Custom_Text">Secs</li>
            </ul>
          </div>
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
    const target_date_flu = new Date(fluConfig.countdownDate);
    const countdown_tiles = document.querySelector("#tiles");

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function getCountdown(target_date, target_html) {
      const current_date = new Date().getTime();
      let seconds_left = (target_date - current_date) / 1000;
      const days = pad(parseInt(seconds_left / 86400)); seconds_left %= 86400;
      const hours = pad(parseInt(seconds_left / 3600)); seconds_left %= 3600;
      const minutes = pad(parseInt(seconds_left / 60));
      const seconds = pad(parseInt(seconds_left % 60));
      target_html.innerHTML = \`<span>\${days}</span><span>\${hours}</span><span>\${minutes}</span><span>\${seconds}</span>\`;
    }
    getCountdown(target_date_flu, countdown_tiles);
    setInterval(() => getCountdown(target_date_flu, countdown_tiles), 1000);

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
  console.log("IIFE ran")
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
</div>`;
