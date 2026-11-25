(() => {
  const USER = "0xpraet0rian";
  const $ = (s) => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();

  /* ---------- typed tagline ---------- */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typed = $("#typed");
  if (typed && !reduce) {
    const full = typed.dataset.text; let i = 0;
    typed.textContent = ""; typed.classList.add("typing");
    const t = setInterval(() => {
      typed.textContent = full.slice(0, ++i);
      if (i >= full.length) { clearInterval(t); setTimeout(() => typed.classList.remove("typing"), 1800); }
    }, 24);
  }

  /* ---------- Background: a survey grid with a slow scan sweep ----------
     A trench grid with coordinate ticks; a scan line drifts down and lights up
     cells with hex readings as it passes — part dig, part terminal. */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  const CELL = 56;
  let W, H, cols, rows, scan = 0, marks = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
    if (reduce) frame(0);
  }
  function frame(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(159,176,195,.07)";
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) { ctx.moveTo(x * CELL + .5, 0); ctx.lineTo(x * CELL + .5, H); }
    for (let y = 0; y <= rows; y++) { ctx.moveTo(0, y * CELL + .5); ctx.lineTo(W, y * CELL + .5); }
    ctx.stroke();
    /* intersection ticks + edge coordinates */
    ctx.fillStyle = "rgba(159,176,195,.22)";
    ctx.font = "10px ui-monospace,Consolas,monospace";
    for (let x = 0; x <= cols; x++) for (let y = 0; y <= rows; y++) ctx.fillRect(x * CELL - 1, y * CELL - 1, 3, 3);
    for (let x = 1; x < cols; x += 2) ctx.fillText("E" + String(x).padStart(2, "0"), x * CELL + 4, 12);
    for (let y = 1; y < rows; y += 2) ctx.fillText("N" + String(y).padStart(2, "0"), 4, y * CELL - 4);
    if (reduce) return;
    /* scan sweep */
    scan += dt * 0.035;
    if (scan > H + 120) scan = -120;
    const g = ctx.createLinearGradient(0, scan - 90, 0, scan);
    g.addColorStop(0, "rgba(255,102,0,0)"); g.addColorStop(1, "rgba(255,102,0,.10)");
    ctx.fillStyle = g; ctx.fillRect(0, scan - 90, W, 90);
    ctx.fillStyle = "rgba(255,102,0,.35)"; ctx.fillRect(0, scan, W, 1);
    /* readings revealed under the scan line */
    if (Math.random() < 0.5) {
      const cx = (Math.random() * cols) | 0, cy = Math.floor(scan / CELL);
      if (cy >= 0 && cy < rows) marks.push({ x: cx * CELL + 6, y: cy * CELL + 20, t: 1, s: ((Math.random() * 256) | 0).toString(16).padStart(2, "0").toUpperCase() });
    }
    marks = marks.filter((m) => m.t > 0.02);
    for (const m of marks) {
      ctx.fillStyle = `rgba(255,140,60,${m.t * 0.55})`;
      ctx.fillText(m.s, m.x, m.y);
      m.t *= 0.985;
    }
  }
  let last = performance.now();
  function loop(now) { frame(Math.min(now - last, 60)); last = now; requestAnimationFrame(loop); }
  resize();
  addEventListener("resize", resize);
  if (!reduce) requestAnimationFrame(loop);

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Private work ----------
     Add entries as { name, blurb, tech } — the code stays locked, the work is described. */
  const PRIVATE = [
    { name: "AFR — Archaeological Field Recorder",
      blurb: "An extensive web and mobile app for recording archaeological field data, built with Svelte so the same tool follows the team from the desk to the trench.",
      tech: "Svelte · web + mobile", langs: ["Svelte", "JavaScript"], url: "https://afrapp.uk", urlLabel: "afrapp.uk" },
    { name: "colorsplit",
      blurb: "A browser-based colour splitting tool for 3D printing. It runs in the browser, so there is nothing to install, and it is live for anyone to use.",
      tech: "JavaScript", langs: ["JavaScript"], url: "https://colorsplit.afrapp.uk", urlLabel: "colorsplit.afrapp.uk" },
    { name: "stratafab",
      blurb: "Modular, support-free 3D-printable scale bars, drawing-board frames and a two-colour north arrow for field photography. Parts slide together on blind dovetails and print flat, with nothing to glue.",
      tech: "Python · build123d · CAD", langs: ["Python"],
      images: [["hero_scale_1m", "1 m scale bar"], ["hero_board_40x30", "Drawing frame"], ["hero_joint_exploded", "Dovetail joint"], ["hero_north_arrow", "North arrow"]] },
    { name: "AutoAWC",
      blurb: "An automated water change system for aquariums, built on AquaPi. In practice it is an aquarium computer that takes over the routine water changes.",
      tech: "AquaPi", langs: ["Python"] },
    { name: "DroneMissionPlanner",
      blurb: "A basic mission planner for DJI drones: plan the flight on the ground, then fly it.",
      tech: "Python", langs: ["Python"] },
  ];

  /* Public repos whose GitHub description is empty or rough */
  const OVERRIDE = {
    "Archaeological-survey-photo-organizer": "Organize and classify archaeological field photos with a few clicks, so survey images end up sorted instead of buried in a camera roll.",
    "dotfiles": "My terminal setup: shell configuration and tooling, kept in one repository.",
  };
  const lock = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  $("#private-repos").innerHTML = PRIVATE.length
    ? PRIVATE.map((p) => `<article class="card featured${p.images ? " expandable" : ""}"><span class="tag">${lock} private</span><h3>${esc(p.name)}</h3>${p.blurb ? `<p>${esc(p.blurb)}</p>` : ""}${p.tech || p.url ? `<div class="row">${p.tech ? `<span>${esc(p.tech)}</span>` : ""}${p.url ? `<a href="${esc(p.url)}" rel="noopener">&#8599; ${esc(p.urlLabel || p.url)}</a>` : ""}</div>` : ""}${p.images ? `<details class="renders"><summary>./renders</summary><div class="gallery">${p.images.map(([f, c]) => `<figure><img src="assets/stratafab/${f}.png" alt="${esc(c)}" loading="lazy"><figcaption>${esc(c)}</figcaption></figure>`).join("")}</div></details>` : ""}</article>`).join("")
    : `<article class="card featured"><span class="tag">${lock} private</span><h3>Closed-source projects</h3><p>Several of my repositories are private. Happy to talk about what they do and how they're built. Get in touch.</p></article>`;

  /* clicking anywhere on the stratafab card reveals its renders */
  document.querySelectorAll(".card.expandable").forEach((card) => {
    const d = card.querySelector("details");
    card.addEventListener("click", (e) => { if (e.target.closest("a, summary")) return; d.open = !d.open; });
  });

  /* ---------- Live GitHub data ---------- */
  const colors = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", C: "#a0a0a0", "C++": "#f34b7d", Rust: "#dea584", Go: "#00ADD8", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c", Assembly: "#6E4C13", Java: "#b07219", PHP: "#4F5D95", Ruby: "#701516", Svelte: "#ff3e00" };

  function renderStack(repos) {
    const counts = {};
    repos.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    PRIVATE.forEach((p) => (p.langs || []).forEach((l) => { counts[l] = (counts[l] || 0) + 1; }));
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    $("#langs").innerHTML = langs.map(([l, n]) => `<span class="chip"><span class="dot" style="background:${colors[l] || "#ff6600"}"></span>${esc(l)}<i>${n}</i></span>`).join("");
  }

  fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((all) => {
      const repos = all.filter((r) => !r.fork && r.name !== "0x").sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at));

      const box = $("#repos");
      if (!repos.length) {
        box.innerHTML = `<p class="empty">No public original repositories yet. Watch <a href="https://github.com/${USER}">github.com/${USER}</a>.</p>`;
      } else {
        box.innerHTML = repos.map((r) => `
          <article class="card">
            <h3><a href="${esc(r.html_url)}" rel="noopener">${esc(r.name)}</a></h3>
            <p>${esc(OVERRIDE[r.name] || (r.description || "").replace(/[*_`]/g, "")) || "No description yet."}</p>
            <div class="row">
              ${r.language ? `<span><span class="dot" style="background:${colors[r.language] || "#ff6600"}"></span>${esc(r.language)}</span>` : ""}
              <span>&#9733; ${r.stargazers_count}</span>
              <span>&#9095; ${r.forks_count}</span>
              <span>updated ${new Date(r.pushed_at).toLocaleDateString(undefined, { year: "numeric", month: "short" })}</span>
            </div>
          </article>`).join("");
      }

      renderStack(repos);
    })
    .catch(() => {
      $("#repos").innerHTML = `<p class="empty">Couldn't reach the GitHub API right now. Browse <a href="https://github.com/${USER}?tab=repositories">my repositories on GitHub</a>.</p>`;
      renderStack([]);
    });
})();
