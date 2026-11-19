/* Chennai chapter — past events archive renderer (styles: css/hyderabad-archive.css) */
(function () {
  var L = "https://www.linkedin.com/in/";
  var E = [
    { id: "october-2026", k: "oct", m: "October 2026", mon: "OCT", host: "SQ1",
      speakers: [["Dhinakaran Thangaraj","Security in the Age of Agentic AI: The Day the Attacker Stopped Being Human",L+"dhinakaran-thangaraj-a2a05a230/",1],["Navya Sri Velicheti","Security in the Age of Agentic AI: The Day the Attacker Stopped Being Human",L+"velicheti-navya-sri-siva-sai-tulasi/",1],["Nirjhar Roy","From Autonomous Hacking to Controlled Execution: Architecting Safe AI Pentest Agents","#",2],["Balaji Govindaraj","Design of a Modular LLM-Based Security Automation Framework for Windows, Linux, and Android","#",3]],
      panel: { t: "AI Security in Practice: From Demo to Defensible Production — Secure-by-design engineering and assurance", p: [["Ezekiel Jebaraj",L+"ezekieljebaraj/"],["Sivaramakrishnan N",L+"sivaramakrishnann/"],["Suresh Vijayaraghavan",L+"sureshvijayaraghavan/"],["Nelson Kulandairaj",L+"nkulandairaj/"]] },
      flash: [["Ezekiel Jebaraj","Choosing Your Cybersecurity Path",L+"ezekieljebaraj/"],["Sivaramakrishnan N","Aspiring CISO ( Path to become CISO)",L+"sivaramakrishnann/"],["Nirjhar Roy","Careers in Defensive Security","#"]] },
    { id: "september-2026", k: "sep", m: "September 2026", mon: "SEP", host: "Comcast",
      speakers: [["Lokesh Kannaiyan","AI Firewalls - Securing the new AI attack surface",L+"lokeshkannaiyan/",1],["SathiyaNarayanan S","Breaking the AI Stack: A Red Teamer’s Journey from LLM to Cloud",L+"sathiyanarayana-s-95b704196/",2]],
      panel: { t: "BEHIND THE DECISION - AI, Risk & the Leadership Room", p: [["Natarajan Dhiraviam",L+"natarajandhiraviam/"],["Bhargav Bhikkaji",L+"bhargav-bhikkaji/"],["Ramaswamy P V",L+"ramaswamy-p-v-54b11710/"],["Karthik Venkatachalam",L+"karthik-venkatachalam-shanmugasundaram-91941228/"]] },
      flash: [["Karthik Venkatachalam","Path to CISO",L+"karthik-venkatachalam-shanmugasundaram-91941228/"]] },
    { id: "august-2026", k: "aug", m: "August 2026", mon: "AUG", host: "Comcast",
      speakers: [["Dr. Ramkumar Dilli","AI Under Attack – Emerging AI Security Threats and Defense",L+"ramkumar-dilli/",1],["Sathish Ashwin","How AI Is Transforming the Traditional SOC into a Modern SOC",L+"satzzz/",2],["Sudharsan Mohan","Beyond Automation: The superpower & limits of AI in red teaming",L+"sudharsan-mohan-126b55b0/",3]],
      panel: { t: "From Prompt to Production: Security Challenges in AI Development", p: [["Gopikrishna T",L+"gopikrishna-togarcheti-20996b4/"],["Keerthana Rajendran",L+"keerthana-rajendran-cism-428555179/"],["Balaji Seshan",L+"balaji-seshan-a4a44537/"],["Rajalakshmi Balasundaram",L+"rajalakshmi-balasundaram-992246142/"],["Dr. Kannan Srinivasan",L+"dr-kannan-srinivasan/"]] },
      flash: [["Dr. Ramkumar Dilli","Aspiring CISO",L+"ramkumar-dilli/"],["Sathish Ashwin","AI in Defensive Security",L+"satzzz/"]] }
  ];
  var BASE = "assets/chennai/";
  var slug = function (n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var ini = function (n) { return n.replace(/^Dr\.\s*/, "").split(" ").slice(0, 2).map(function (w) { return w[0]; }).join(""); };
  var esc = function (s) { return s.replace(/&/g, "&amp;"); };
  var li = function (u) { return u && u !== "#" ? '<a class="hyd-li" href="' + u + '" target="_blank" rel="noopener"><b>in</b>LinkedIn</a>' : '<span class="hyd-li"><b>in</b>LinkedIn</span>'; };
  var card = function (n, role, talk, q, u) {
    return '<div class="hyd-card"><div class="hyd-av"><span>' + ini(n) + '</span><img src="' + BASE + 'avatars/' + slug(n) + '.jpg" alt="' + n + '" onerror="this.remove()"></div>' +
      '<h4>' + n + '</h4><span class="hyd-role' + (q ? ' hyd-role--q' : '') + '">' + role + '</span>' + li(u) +
      (talk ? '<p class="hyd-talk">' + esc(talk) + '</p>' : '') + '</div>';
  };
  var photo = function (k, i, label) {
    return '<figure><div class="hyd-box"><img loading="lazy" src="' + BASE + k + '-' + i + '.jpg" alt="' + label + '" onerror="this.closest(\'figure\').remove()"></div><figcaption>Highlight ' + i + '</figcaption></figure>';
  };
  var cols = function (n) { return n === 4 ? "hyd-grid--four" : "hyd-grid--three"; };

  var root = document.getElementById("chn-events");
  if (!root) return;
  root.innerHTML = E.map(function (e) {
    return '<section class="hyd-event" id="' + e.id + '"><span class="hyd-mark" aria-hidden="true">' + e.mon + '</span>' +
      '<div class="container hyd-wrap"><span class="hyd-tag hyd-tag--a">Past Event</span><span class="hyd-tag hyd-tag--b">Chennai</span>' +
      '<h2>AI-SEC Community — ' + e.m + '</h2><p class="hyd-sub">Monthly meetup hosted at ' + e.host + '.</p>' +
      '<div class="hyd-cover"><img src="' + BASE + e.k + '-group.jpg" alt="' + e.m + ' group photo" onerror="this.closest(\'.hyd-cover\').remove()"></div>' +
      '<h3 class="hyd-h3">Session Speakers</h3><div class="hyd-grid ' + cols(e.speakers.length) + '">' +
      e.speakers.map(function (s) { return card(s[0], "Session Speaker " + s[3], "Talk - “" + s[1] + "”", 0, s[2]); }).join("") + '</div>' +
      '<h3 class="hyd-h3">Panel Discussion - “' + esc(e.panel.t) + '”</h3><div class="hyd-grid ' + cols(e.panel.p.length) + '">' +
      e.panel.p.map(function (p, i) { return card(p[0], i ? "Panel Speaker " + i : "Moderator", "", 1, p[1]); }).join("") + '</div>' +
      '<h3 class="hyd-h3">Flash Mentoring</h3><div class="hyd-grid hyd-grid--cap">' +
      e.flash.map(function (f, i) { return card(f[0], "Flash Mentor " + (i + 1), "Mentoring Topic: “" + f[1] + "”", 1, f[2]); }).join("") + '</div>' +
      '<h3 class="hyd-h3">📸 Photo Highlights</h3><div class="hyd-photos">' +
      [1, 2, 3, 4].map(function (i) { return photo(e.k, i, ["Group photo", "Session speakers", "Panel discussion", "Flash mentoring"][i - 1]); }).join("") + '</div></div></section>';
  }).join("");

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = root.querySelectorAll(".hyd-card,.hyd-photos figure");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .08 });
    els.forEach(function (el, i) { el.classList.add("hyd-reveal"); el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  }
  if (!reduce) root.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(".hyd-card"); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--rx", ((e.clientY - r.top) / r.height - .5) * -8 + "deg");
    c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 8 + "deg");
  });
  root.addEventListener("pointerleave", function () { root.querySelectorAll(".hyd-card").forEach(function (c) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }); });
  var lb = document.createElement("div"); lb.id = "hyd-lb"; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
  document.addEventListener("click", function (e) {
    var im = e.target.closest && e.target.closest(".hyd-cover img,.hyd-photos img");
    if (im) { lb.querySelector("img").src = im.src; lb.classList.add("on"); }
    else if (e.target.closest && e.target.closest("#hyd-lb")) lb.classList.remove("on");
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("on"); });
})();
