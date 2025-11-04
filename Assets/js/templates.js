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
    config.fields.forEach(
      (f) => (values[f.id] = document.getElementById(f.id).value)
    );
    const code = templates[config.template](values);
    document.getElementById("output").textContent = code.trim();
    document.getElementById("previewArea").innerHTML = code;
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
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
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
  const indicators = slides
    .map(
      (s, i) => `
      <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" 
        ${
          i === 0 ? 'class="active" aria-current="true"' : ""
        } aria-label="Slide ${i + 1}"></button>`
    )
    .join("");

  const items = slides
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

  return `
<div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-indicators">${indicators}</div>
  <div class="carousel-inner">${items}</div>
  <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>`;
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
templates.imageBlock = ({ src, alt, caption }) => `
<div class="text-center">
  <img src="${src}"
       alt="${alt}"
       class="img-fluid rounded shadow-sm"
       style="max-width: 100%; height: auto;">
  ${
    caption ? `<small class="d-block mt-2 text-muted">“${caption}”</small>` : ""
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
  const navItems = tabs
    .map(
      (t, i) => `
    <li class="nav-item" role="presentation">
      <button class="nav-link ${i === 0 ? "active" : ""}" 
              id="tabBtn${id}${i}" 
              data-bs-toggle="tab" 
              data-bs-target="#tabPane${id}${i}" 
              type="button" role="tab" 
              aria-controls="tabPane${id}${i}" 
              aria-selected="${i === 0 ? "true" : "false"}">
        ${t.label}
      </button>
    </li>`
    )
    .join("");

  const tabPanes = tabs
    .map(
      (t, i) => `
    <div class="tab-pane fade ${i === 0 ? "show active" : ""}" 
         id="tabPane${id}${i}" 
         role="tabpanel" 
         aria-labelledby="tabBtn${id}${i}">
      <p>${t.content}</p>
    </div>`
    )
    .join("");

  return `
<ul class="nav nav-tabs" id="tabNav${id}" role="tablist">
  ${navItems}
</ul>

<div class="tab-content" id="tabContent${id}">
  ${tabPanes}
</div>`;
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
templates.collapseSection = ({ id, label, content }) => `
<button class="btn btn-primary w-100 text-start mb-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#${id}"
        aria-expanded="false"
        aria-controls="${id}">
  ${label}
</button>

<div class="collapse mt-3" id="${id}">
  <div class="card card-body">
    ${content}
  </div>
</div>`;

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
