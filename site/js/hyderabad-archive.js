/* Hyderabad chapter — past events archive renderer */
(function () {
  var E = [
    { id: "october-2026", k: "oct", m: "October 2026", mon: "OCT", host: "Sonatype",
      speakers: [["Jaya Kumar Kondapalli","AI Jailbreaking"],["Gouthami Purohit","Recon Never Retired: OSINT for the AI Attack Surface"],["Manindra Simhadri","Exploiting agentic MCPs"]],
      panel: { t: "When AI Agents Go Rogue: Who Is Responsible When an AI Takes an Action?", p: ["Akshay J","Dr. Lalit Mohan Sanagavarapu","Subhankar Dey","Bhramara Malleswar Bollapinni"] },
      flash: [["Bhupal Singh Rathod","Cybersecurity Career & Leadership"]],
      rec: "Panel Discussion Topic – “When AI Agents Go Rogue: Who Is Responsible When an AI Takes an Action?”" },
    { id: "september-2026", k: "sep", m: "September 2026", mon: "SEP", host: "Garmin",
      speakers: [["Siva","Context vs Harness Engineering"],["Krishna Sai Blita","Security Automation using AI (10X pentester)"],["Manoj Kumar","The New Colleague: The Autonomous Teammate for the Modern SOC"],["Meghana Muddu","The New Colleague: The Autonomous Teammate for the Modern SOC"],["Ramesh Karamsetty","The New Colleague: The Autonomous Teammate for the Modern SOC"]],
      flash: [["Subhankar Dey","AI Career Ladder"]] },
    { id: "august-2026", k: "aug", m: "August 2026", mon: "AUG", host: "Draper Startup House",
      speakers: [["Bharani Boddupally","Pentest and ASM with Local Ollama"],["Venkateshwaru Madala","AI Agent Frameworks in 2026. Open Sources vs Commercial Platforms"],["Rajesh Pakalapati","Securing the Model Context Protocol ( MCP )"]],
      flash: [["Bhargavi M","Career Guidance"]] }
  ];
  var BASE = "assets/hyderabad/";
  var slug = function (n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var ini = function (n) { return n.replace(/^Dr\.\s*/, "").split(" ").slice(0, 2).map(function (w) { return w[0]; }).join(""); };
  var li = '<span class="hyd-li"><b>in</b>LinkedIn</span>';
  var card = function (n, role, talk, q) {
    return '<div class="hyd-card"><div class="hyd-av"><span>' + ini(n) + '</span><img src="' + BASE + 'avatars/' + slug(n) + '.jpg" alt="' + n + '" onerror="this.remove()"></div>' +
      '<h4>' + n + '</h4><span class="hyd-role' + (q ? ' hyd-role--q' : '') + '">' + role + '</span>' + li +
      (talk ? '<p class="hyd-talk">' + talk + '</p>' : '') + '</div>';
  };
  var photo = function (k, i, label) {
    return '<figure><div class="hyd-box"><img loading="lazy" src="' + BASE + k + '-' + i + '.jpg" alt="' + label + '" onerror="this.closest(\'figure\').remove()"></div><figcaption>Highlight ' + i + '</figcaption></figure>';
  };

  var root = document.getElementById("hyd-events");
  if (!root) return;
  root.innerHTML = E.map(function (e) {
    var h = '<section class="hyd-event" id="' + e.id + '"><span class="hyd-mark" aria-hidden="true">' + e.mon + '</span>' +
      '<div class="container hyd-wrap"><span class="hyd-tag hyd-tag--a">Past Event</span><span class="hyd-tag hyd-tag--b">Hyderabad</span>' +
      '<h2>AI-SEC Community — ' + e.m + '</h2><p class="hyd-sub">Monthly meetup hosted at ' + e.host + '.</p>' +
      '<div class="hyd-cover"><img src="' + BASE + e.k + '-group.jpg" alt="' + e.m + ' group photo" onerror="this.closest(\'.hyd-cover\').remove()"></div>' +
      '<h3 class="hyd-h3">Session Speakers</h3><div class="hyd-grid hyd-grid--three">' +
      e.speakers.map(function (s, i) { return card(s[0], "Session Speaker " + (i + 1), "Talk - “" + s[1] + "”"); }).join("") + '</div>';
    if (e.panel) h += '<h3 class="hyd-h3">Panel Discussion - “' + e.panel.t + '”</h3><div class="hyd-grid">' +
      e.panel.p.map(function (n, i) { return card(n, i ? "Panel Speaker " + i : "Moderator", "", 1); }).join("") + '</div>';
    h += '<h3 class="hyd-h3">Flash Mentoring</h3><div class="hyd-grid hyd-grid--cap">' +
      e.flash.map(function (f, i) { return card(f[0], "Flash Mentor " + (i + 1), "Mentoring Track : “" + f[1] + "”", 1); }).join("") + '</div>';
    if (e.rec) h += '<h3 class="hyd-h3">' + e.m + ' Recordings</h3><div class="hyd-vid"><a href="#"><img src="' + BASE + 'oct-video.jpg" alt="Panel discussion recording" onerror="this.closest(\'.hyd-vid\').remove()"></a>' +
      '<p>AI-SEC Community - ' + e.m + ' Summit<br><small>' + e.rec + '</small></p></div>';
    h += '<h3 class="hyd-h3">📸 Photo Highlights</h3><div class="hyd-photos">' +
      [1, 2, 3, 4].map(function (i) { return photo(e.k, i, ["Group photo", "Session speakers", "Panel / mentoring", "Networking"][i - 1]); }).join("") + '</div></div></section>';
    return h;
  }).join("");

  /* reveal on scroll */
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = root.querySelectorAll(".hyd-card,.hyd-photos figure,.hyd-vid");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .08 });
    els.forEach(function (el, i) { el.classList.add("hyd-reveal"); el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  }
  /* card tilt */
  if (!reduce) root.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(".hyd-card"); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--rx", ((e.clientY - r.top) / r.height - .5) * -8 + "deg");
    c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 8 + "deg");
  });
  root.addEventListener("pointerleave", function () { root.querySelectorAll(".hyd-card").forEach(function (c) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }); });
  /* lightbox */
  var lb = document.createElement("div"); lb.id = "hyd-lb"; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
  document.addEventListener("click", function (e) {
    var im = e.target.closest && e.target.closest(".hyd-cover img,.hyd-photos img");
    if (im) { lb.querySelector("img").src = im.src; lb.classList.add("on"); }
    else if (e.target.closest && e.target.closest("#hyd-lb")) lb.classList.remove("on");
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("on"); });
})();
