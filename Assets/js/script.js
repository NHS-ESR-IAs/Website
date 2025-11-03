// ===============================
// Shared Utilities
// ===============================

// Load a partial HTML file into a container
async function loadPartial(id, filePath, wrapper = null) {
  const res = await fetch(filePath);
  if (!res.ok) throw new Error(`Failed to load ${filePath}`);
  const html = await res.text();
  const container = document.getElementById(id);
  if (container) {
    container.innerHTML = wrapper
      ? `${wrapper.start}${html}${wrapper.end}`
      : html;
  }
}

// ===============================
// Menu Building
// ===============================

function createMenuItems(items, isDropdown = false) {
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.children ? "nav-item dropdown" : "nav-item";

    const a = document.createElement("a");
    a.textContent = item.label;
    a.href = item.href || "#";

    if (item.children) {
      a.className = isDropdown
        ? "dropdown-item submenu-toggle"
        : "nav-link dropdown-toggle";
      if (!isDropdown) a.setAttribute("data-bs-toggle", "dropdown");
      li.appendChild(a);

      const childUl = document.createElement("ul");
      childUl.className = "dropdown-menu";

      item.children.forEach((child) => {
        if (child.children) {
          // Nested submenu
          const subLi = document.createElement("li");
          subLi.className = "dropdown-submenu";

          const subA = document.createElement("a");
          subA.className = "dropdown-item submenu-toggle";
          subA.href = "#";
          subA.textContent = child.label;
          subLi.appendChild(subA);

          const subMenu = document.createElement("ul");
          subMenu.className = "dropdown-menu";

          child.children.forEach((leaf) => {
            const leafLi = document.createElement("li");
            const leafA = document.createElement("a");
            leafA.className = "dropdown-item";
            leafA.href = leaf.href || "#";
            leafA.textContent = leaf.label;
            leafLi.appendChild(leafA);
            subMenu.appendChild(leafLi);
          });

          subLi.appendChild(subMenu);
          childUl.appendChild(subLi);
        } else {
          const childLi = document.createElement("li");
          const childA = document.createElement("a");
          childA.className = "dropdown-item";
          childA.href = child.href || "#";
          childA.textContent = child.label;
          childLi.appendChild(childA);
          childUl.appendChild(childLi);
        }
      });

      li.appendChild(childUl);
    } else {
      a.className = "nav-link";
      li.appendChild(a);
    }

    fragment.appendChild(li);
  });

  return fragment;
}

async function buildMenusFromJson(jsonPath) {
  const res = await fetch(jsonPath);
  if (!res.ok) throw new Error(`Failed to load JSON: ${jsonPath}`);
  const menuData = await res.json();

  const headerUl = document.querySelector("#desktop-nav-toolbar .navbar-nav");
  const sidebarUl = document.querySelector(
    "#sidebarMenu .navbar-nav.flex-column"
  );

  if (headerUl) {
    headerUl.innerHTML = "";
    headerUl.appendChild(createMenuItems(menuData));
  }
  if (sidebarUl) {
    sidebarUl.innerHTML = "";
    sidebarUl.appendChild(createMenuItems(menuData));
  }

  markActiveLinks();
}

async function buildMenusWithFallback() {
  try {
    await buildMenusFromJson("data/Menu Manifest.json");
  } catch (e) {
    console.warn("Menu JSON failed, falling back to partials/menu.html", e);
    const headerUl = document.querySelector("#desktop-nav-toolbar .navbar-nav");
    const sidebarUl = document.querySelector(
      "#sidebarMenu .navbar-nav.flex-column"
    );

    if (headerUl) {
      const res = await fetch("partials/menu.html");
      if (res.ok) headerUl.innerHTML = await res.text();
    }
    if (sidebarUl) {
      const res2 = await fetch("partials/menu.html");
      if (res2.ok) sidebarUl.innerHTML = await res2.text();
    }
  }
}

function markActiveLinks() {
  const current = window.location.pathname.split("/").pop().toLowerCase();
  const allLinks = document.querySelectorAll(
    "#desktop-nav-toolbar a.nav-link, #sidebarMenu a"
  );

  allLinks.forEach((a) => {
    const hrefFile = (a.getAttribute("href") || "")
      .split("/")
      .pop()
      .split("#")[0]
      .split("?")[0]
      .toLowerCase();
    if (hrefFile && current && hrefFile === current) {
      a.classList.add("active");
      const parentDropdown = a.closest(".dropdown");
      if (parentDropdown) {
        const trigger = parentDropdown.querySelector(".dropdown-toggle");
        if (trigger) trigger.classList.add("active");
      }
    } else {
      a.classList.remove("active");
    }
  });
}

// ===============================
// Search (Fuse.js) – works for header + sidebar
// ===============================

function initSearchBox(inputId, resultsId, fuse) {
  const input = document.getElementById(inputId);
  const resultsList = document.getElementById(resultsId);
  if (!input || !resultsList) return;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    resultsList.innerHTML = "";
    resultsList.classList.remove("show");

    if (query.length > 1) {
      const results = fuse.search(query).slice(0, 7);
      results.forEach((r) => {
        const li = document.createElement("li");
        li.className = "search-result";
        li.innerHTML = `
  <a href="${r.item.url}" class="btn btn-primary w-100 text-start mb-2">
    <div class="fw-bold">${r.item.title}</div>
    <div class="small opacity-75">${r.item.description}</div>
    <div class="small text-muted">${r.item.category}</div>
  </a>
`;
        resultsList.appendChild(li);
      });
      if (results.length) resultsList.classList.add("show");
    }
  });

  // Hide results when clicking outside this search form
  document.addEventListener("click", (e) => {
    const form = input.closest("form,[role='search']");
    if (form && !form.contains(e.target)) {
      resultsList.classList.remove("show");
    }
  });
}

async function initSearch() {
  try {
    const res = await fetch("data/pages.json");
    if (!res.ok) throw new Error("pages.json not found");
    const pages = await res.json();

    const fuse = new Fuse(pages, {
      keys: ["title", "description", "category"],
      threshold: 0.3,
    });

    // Initialise both header and sidebar searches
    initSearchBox("headerSearch", "headerSearchResults", fuse);
    initSearchBox("sidebarSearch", "sidebarSearchResults", fuse);
  } catch (err) {
    console.error("Search init failed:", err);
  }
}

function openSearchPage(inputId = "headerSearch") {
  const input = document.getElementById(inputId);
  if (!input) return;
  const q = input.value.trim();
  if (q) window.location.href = `SiteMap.html?q=${encodeURIComponent(q)}`;
}

// ===============================
// Initialise everything on DOM ready
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  buildMenusWithFallback();
  initSearch();
});

// ===============================
// Theme & Dark Mode
// ===============================

function initThemeControls() {
  const themeSelectors = document.querySelectorAll(".theme-selector");
  themeSelectors.forEach((selector) => {
    selector.addEventListener("change", function () {
      const selectedTheme = this.value;
      document.body.className = document.body.className
        .split(" ")
        .filter((cls) => !cls.startsWith("theme-"))
        .join(" ")
        .trim();
      if (selectedTheme) document.body.classList.add("theme-" + selectedTheme);
      if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
      }
      localStorage.setItem("theme", selectedTheme);
      applyMermaidTheme();
    });
  });

  const toggleButtons = document.querySelectorAll(".toggle-dark");
  function updateDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    toggleButtons.forEach((btn) => {
      btn.textContent = isDark ? "Dark Mode" : "Light Mode";
    });
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    applyMermaidTheme();
  }
  toggleButtons.forEach((btn) => btn.addEventListener("click", updateDarkMode));

  // Initial load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.body.classList.add("theme-" + savedTheme);
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
  applyMermaidTheme();
}

function applyMermaidTheme() {
  if (window.mermaid) {
    const isDark = document.body.classList.contains("dark-mode");
    const theme = isDark ? "dark" : "default";
    mermaid.initialize({ startOnLoad: true, theme });
    mermaid.init(undefined, document.querySelectorAll(".mermaid"));
  }
}

// ===============================
// Scroll Behaviour
// ===============================

function initScrollCollapse() {
  const banner = document.querySelector(".banner-wrapper");
  const toolbar = document.getElementById("desktop-nav-toolbar");
  const header = document.querySelector(".nhs-header");
  let isCollapsed = false;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY > 1 && !isCollapsed) {
      banner?.classList.add("shrink");
      header?.classList.add("shrink");
      toolbar?.classList.add("hide-on-scroll");
      isCollapsed = true;
    } else if (scrollY < 1 && isCollapsed) {
      banner?.classList.remove("shrink");
      header?.classList.remove("shrink");
      toolbar?.classList.remove("hide-on-scroll");
      isCollapsed = false;
    }
  });
}
function setTextSize(scaleClass) {
  document.body.classList.remove(
    "scale-small",
    "scale-medium",
    "scale-large",
    "scale-xlarge"
  );
  document.body.classList.add(scaleClass);
}
// ===============================
// Boot Sequence
// ===============================

// === Boot sequence
document.addEventListener("DOMContentLoaded", () => {
  loadPartial("shared-header", "partials/header.html").then(() => {
    initSearch(); // now the input exists
    buildMenusWithFallback();
    initThemeControls();
    initScrollCollapse();
  });

  loadPartial("shared-footer", "partials/footer.html");
});

// ===============================
// Dynamic Breadcrumbs
// ===============================

async function buildBreadcrumb() {
  try {
    const res = await fetch("data/pages.json");
    const pages = await res.json();

    const currentFile = decodeURIComponent(location.pathname.split("/").pop());
    console.log("Looking for:", currentFile);

    const page = pages.find((p) => p.url === currentFile);
    console.log("Found page:", page);

    if (!page) return;

    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) return;

    breadcrumb.innerHTML = `
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item">
        <a href="SiteMap.html?category=${encodeURIComponent(page.category)}">${
      page.category
    }</a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">${page.title}</li>
    `;
  } catch (err) {
    console.error("Breadcrumb build failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", buildBreadcrumb);

// ===============================
// Site Map Filtering
// ===============================

async function renderSiteMap() {
  try {
    const res = await fetch("data/pages.json");
    if (!res.ok) throw new Error("pages.json not found");
    const pages = await res.json();

    const params = new URLSearchParams(window.location.search);
    const categoryFilter = params.get("category");

    let filtered = pages;
    if (categoryFilter && categoryFilter !== "All Pages") {
      filtered = pages.filter((p) => p.category === categoryFilter);
    }

    const pageList = document.getElementById("pageList");
    pageList.innerHTML = "";

    // --- Case 1: All Pages or no filter → group by category ---
    if (!categoryFilter || categoryFilter === "All Pages") {
      const categories = [...new Set(pages.map((p) => p.category))];
      categories.forEach((cat) => {
        const catHeader = document.createElement("h4");
        catHeader.className = "mt-4 mb-3 gradient-text";
        catHeader.textContent = cat;
        pageList.appendChild(catHeader);

        const catRow = document.createElement("div");
        catRow.className = "row";
        pages
          .filter((p) => p.category === cat)
          .forEach((p) => {
            const col = document.createElement("div");
            col.className = "col-md-6 mb-3";
            col.innerHTML = `
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h5 class="mt-2 mb-3">📣 ${p.title}</h5>
                <p class="small opacity-75">${p.description}</p>
                <a href="${p.url}" class="btn btn-primary w-100 d-block mx-auto mt-3">Open Page</a>
              </div>
            </div>
          `;
            catRow.appendChild(col);
          });
        pageList.appendChild(catRow);
      });
    }

    // --- Case 2: Specific category filter ---
    else {
      const catHeader = document.createElement("h4");
      catHeader.className = "mt-4 mb-3 gradient-text";
      catHeader.textContent = categoryFilter;
      pageList.appendChild(catHeader);

      const catRow = document.createElement("div");
      catRow.className = "row";
      filtered.forEach((p) => {
        const col = document.createElement("div");
        col.className = "col-md-6 mb-3";
        col.innerHTML = `
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="mt-2 mb-3">📣 ${p.title}</h5>
              <p class="small opacity-75">${p.description}</p>
              <a href="${p.url}" class="btn btn-primary w-100 d-block mx-auto mt-3">Open Page</a>
            </div>
          </div>
        `;
        catRow.appendChild(col);
      });
      pageList.appendChild(catRow);
    }
  } catch (err) {
    console.error("Site Map render failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", renderSiteMap);
