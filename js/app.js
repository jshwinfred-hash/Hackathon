/* Centsible — app shell, pages, charts and animations. */
(() => {
  const D = window.CENTSIBLE_DATA, ML = window.CentsibleML;

  /* ================= utilities ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const catIcon = (cat) => icon("c-" + String(cat).toLowerCase());
  const money = (v, dp = 2) => (v < 0 ? "−" : "") + "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => iso(new Date());
  const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return iso(d); };
  const addMonths = (s, n) => { const d = ML.parseDate(s); d.setMonth(d.getMonth() + n); return iso(d); };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const fmtDate = (s, opts = { month: "short", day: "numeric" }) => ML.parseDate(s).toLocaleDateString("en-US", opts);
  const daysUntil = (s) => Math.round((ML.parseDate(s) - ML.parseDate(todayISO())) / 86400000);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const monthName = () => new Date().toLocaleDateString("en-US", { month: "long" });

  const CAT_COLORS = {
    Food: "#f5b83d", Shopping: "#60a5fa", Entertainment: "#a78bfa", Transportation: "#22d3ee",
    Education: "#34d399", Health: "#fb7185", Gifts: "#f97316", Housing: "#94a3b8",
    Utilities: "#facc15", Savings: "#38bdf8", Income: "#4ade80", Other: "#cbd5e1"
  };
  const color = (cat) => CAT_COLORS[cat] || "#cbd5e1";

  /* ================= storage ================= */
  const KEY = "centsible.v3.";
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); if (v != null) return JSON.parse(v); } catch {} return k in mem ? mem[k] : d; },
    set(k, v) { mem[k] = v; try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch {} },
    clear() { for (const k of Object.keys(mem)) delete mem[k]; try { Object.keys(localStorage).filter((k) => k.startsWith(KEY)).forEach((k) => localStorage.removeItem(k)); } catch {} }
  };

  function seedTransactions() {
    const rows = [
      [-44, "Weekend earnings", "Income", 180, "Income", "Deposit"],
      [-41, "Lunch with friends", "Food", 14.5, "Expense", "Cash"],
      [-38, "Bus pass", "Transportation", 25, "Expense", "Card"],
      [-35, "Movie night", "Entertainment", 16, "Expense", "Cash"],
      [-33, "Savings contribution", "Savings", 30, "Saving", "Transfer"],
      [-30, "Hoodie", "Shopping", 32, "Expense", "Card"],
      [-27, "Groceries for the week", "Food", 21, "Expense", "Card"],
      [-24, "Babysitting", "Income", 60, "Income", "Cash"],
      [-20, "Coffee before school", "Food", 5.25, "Expense", "Card"],
      [-17, "Notebook and supplies", "Education", 18.75, "Expense", "Centsible demo card"],
      [-14, "Weekend earnings", "Income", 180, "Income", "Deposit"],
      [-13, "Lunch", "Food", 13.5, "Expense", "Centsible demo card"],
      [-12, "Bus pass", "Transportation", 25, "Expense", "Card"],
      [-11, "Coffee", "Food", 4.75, "Expense", "Card"],
      [-10, "Savings contribution", "Savings", 25, "Saving", "Transfer"],
      [-9, "Movie tickets", "Entertainment", 16, "Expense", "Cash"],
      [-8, "Pizza with friends", "Food", 12, "Expense", "Cash"],
      [-7, "Phone case", "Shopping", 18, "Expense", "Card"],
      [-6, "Tutoring income", "Income", 50, "Income", "Cash"],
      [-6, "Bubble tea", "Food", 6.5, "Expense", "Card"],
      [-5, "Birthday gift for friend", "Gifts", 20, "Expense", "Card"],
      [-4, "Lunch", "Food", 11.25, "Expense", "Card"],
      [-3, "Concert tickets", "Entertainment", 58, "Expense", "Card"],
      [-2, "Dinner out", "Food", 46, "Expense", "Card"],
      [-1, "Dog walking", "Income", 40, "Income", "Cash"],
      [0, "Snacks after practice", "Food", 4.5, "Expense", "Card"]
    ];
    return rows.map(([off, description, category, amount, type, method]) => ({
      id: uid(), date: addDays(off), description, category, amount, type, method,
      card: method === "Centsible demo card" ? D.DEMO_CARD_CODE : ""
    }));
  }
  const DEFAULTS = () => ({
    tx: seedTransactions(),
    budgets: { Food: 120, Shopping: 60, Entertainment: 60, Transportation: 50, Education: 40, Gifts: 30, Other: 30 },
    goals: [
      { id: uid(), name: "New laptop", target: 600, saved: 180, deadline: addDays(150), created: todayISO() },
      { id: uid(), name: "Winter coat", target: 90, saved: 54, deadline: addDays(40), created: todayISO() }
    ],
    payments: [
      { id: uid(), name: "Club dues", amount: 15, due: addDays(2), frequency: "One-time", paid: false },
      { id: uid(), name: "Music subscription", amount: 5.99, due: addDays(4), frequency: "Monthly", paid: false },
      { id: uid(), name: "Phone contribution", amount: 25, due: addDays(9), frequency: "Monthly", paid: false }
    ],
    wishlist: [
      { id: uid(), name: "Wireless earbuds", price: 60 },
      { id: uid(), name: "Concert ticket", price: 45 },
      { id: uid(), name: "Sneakers", price: 120 }
    ],
    learning: { completed: [], streak: 0, lastDay: "", xp: 0, history: [], best: {}, mastery: {}, badges: [], missed: [] },
    settings: { name: "", theme: "dark" },
    userExamples: [],
    taught: 0
  });

  const S = {};
  function load() {
    const d = DEFAULTS();
    for (const k of Object.keys(d)) S[k] = store.get(k, d[k]);
    S.learning = { ...d.learning, ...S.learning };
  }
  const save = (...keys) => keys.forEach((k) => store.set(k, S[k]));

  /* Gemini settings live outside S so backups and exports never include the key. */
  const DEFAULT_MODEL = "gemini-flash-latest";
  const CONFIG = window.CENTSIBLE_CONFIG || {};
  const AI = { key: "", model: CONFIG.model || DEFAULT_MODEL, ...store.get("ai", {}) };
  const saveAI = () => store.set("ai", { key: AI.key, model: AI.model });
  // A key the visitor saved in Settings wins; otherwise the site's shared key from js/config.js.
  const sharedKey = () => { const k = (CONFIG.geminiKey || "").trim(); return k.startsWith("PASTE_") ? "" : k; };
  const activeKey = () => (AI.key || sharedKey()).trim();
  const usingSharedKey = () => !AI.key && !!sharedKey();
  const geminiReady = () => !!activeKey();

  /* ================= AI model ================= */
  let model = null, cv = null;
  function buildModel() {
    model = new ML.NaiveBayes(0.5).train([...D.TRAINING, ...S.userExamples.map((e) => ({ ...e, weight: 3 }))]);
  }
  const getCV = () => (cv ||= ML.crossValidate(D.TRAINING));
  function teach(text, category, predicted) {
    if (!text.trim()) return;
    S.userExamples.push({ text: text.trim().toLowerCase(), category });
    if (S.userExamples.length > 400) S.userExamples.shift();
    if (predicted && predicted !== category) { S.taught++; if (S.taught >= 5) award("trainer"); }
    save("userExamples", "taught");
    model.add(text, category, 3);
  }

  /* ================= analytics ================= */
  const isThisMonth = (s) => { const d = ML.parseDate(s), n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); };
  const monthTx = () => S.tx.filter((t) => isThisMonth(t.date));
  const expensesOf = (list) => list.filter((t) => t.type === "Expense");
  function totals(list) {
    const income = sum(list.filter((t) => t.type === "Income").map((t) => t.amount));
    const expenses = sum(list.filter((t) => t.type === "Expense").map((t) => t.amount));
    const savings = sum(list.filter((t) => t.type === "Saving").map((t) => t.amount));
    return { income, expenses, savings, cashflow: income - expenses, remaining: income - expenses - savings };
  }
  function byCategory(list) {
    const m = {};
    for (const t of expensesOf(list)) m[t.category] = (m[t.category] || 0) + t.amount;
    return Object.entries(m).map(([cat, amt]) => ({ cat, amt })).sort((a, b) => b.amt - a.amt);
  }
  function dailySeries(type, days = 14) {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = addDays(-i);
      out.push(sum(S.tx.filter((t) => t.type === type && t.date === day).map((t) => t.amount)));
    }
    return out;
  }
  const forecast = () => ML.forecastMonth(expensesOf(S.tx));
  function catForecast() {
    const f = forecast();
    const res = {};
    for (const { cat, amt } of byCategory(monthTx())) res[cat] = { spent: amt, projected: f.day ? amt + (amt / f.day) * f.daysLeft : amt };
    return res;
  }
  const anomalies = () => ML.findAnomalies(expensesOf(S.tx));
  function savingRate60() {
    const since = addDays(-60);
    return sum(S.tx.filter((t) => t.type === "Saving" && t.date >= since).map((t) => t.amount)) / 2;
  }

  /* ---------- money position & the decision check ---------- */
  // Money not yet spent or set aside: all income minus all spending and savings transfers.
  const available = () => { const t = totals(S.tx); return t.income - t.expenses - t.savings; };
  const billsWithin = (days) => sum(S.payments.filter((p) => !p.paid && daysUntil(p.due) <= days).map((p) => p.amount));
  // Average weekly leftover over the last 8 weeks (income − spending − saving).
  function weeklyLeftover() {
    const since = addDays(-56);
    const t = totals(S.tx.filter((x) => x.date >= since && x.date <= todayISO()));
    return t.remaining / 8;
  }
  function parseAmount(text) {
    const m = String(text).replace(/,/g, "").match(/\$\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks|usd)\b/i);
    return m ? parseFloat(m[1] || m[2]) : null;
  }
  /* Rule-based affordability check. Its numbers are handed to Centy as facts, so the
     language model explains a calculation instead of doing arithmetic itself. */
  function affordCheck(price, itemName = "") {
    const avail = available();
    const bills = billsWithin(14);
    const free = avail - bills;
    const weekly = weeklyLeftover();
    const lines = [];
    let kind, label;
    if (price <= free * 0.5) { kind = "good"; label = "Comfortable"; }
    else if (price <= free) { kind = "tip"; label = "Affordable, but tight"; }
    else { kind = "warn"; label = "Not yet"; }
    lines.push(`Available money: ${money(avail)}; bills due in the next 14 days: ${money(bills)}; free after bills: ${money(free)}.`);
    if (free > 0) lines.push(`This costs ${Math.round((price / free) * 100)}% of your free money.`);
    let summary = "";
    if (price > free) {
      const gap = price - Math.max(0, free);
      summary = weekly > 0 ? `You'd need ${money(gap)} more. At your recent leftover of ${money(weekly)}/week, that's about ${Math.ceil(gap / weekly)} week${Math.ceil(gap / weekly) === 1 ? "" : "s"}.` : `You'd need ${money(gap)} more, and you haven't had money left over in recent weeks.`;
      lines.push(summary);
    }
    if (itemName) {
      const p = model.predict(itemName);
      const cat = p.label && p.confidence >= 0.35 ? p.label : null;
      if (cat && S.budgets[cat] != null) {
        const spent = (catForecast()[cat] || { spent: 0 }).spent;
        const room = Number(S.budgets[cat]) - spent;
        if (room >= price) lines.push(`It fits your ${cat} budget (${money(room)} left this month).`);
        else {
          const over = `It would push ${cat} over budget (only ${money(Math.max(0, room))} left this month).`;
          lines.push(over);
          // A purchase that breaks a budget is never "comfortable".
          if (kind === "good") { kind = "tip"; label = `Affordable, but over your ${cat} budget`; }
          if (!summary) summary = over;
        }
      }
    }
    const open = S.goals.filter((g) => g.saved < g.target);
    if (open.length && price > free * 0.5) lines.push(`Buying it now would slow your savings goals (${open.map((g) => g.name).join(", ")}).`);
    if (!summary) summary = free > 0 ? `Uses ${Math.round((price / free) * 100)}% of your ${money(free)} free after bills.` : lines[0];
    return { price, kind, label, lines, summary, avail, free, weekly };
  }

  function coachInsights() {
    const out = [];
    const f = forecast();
    const budgetTotal = sum(Object.values(S.budgets).map(Number));
    const mt = totals(monthTx());
    if (f.spent > 0 && budgetTotal > 0) {
      if (f.projected > budgetTotal) {
        out.push({ kind: "warn", ico: "i-trend", title: `On pace to spend ${money(f.projected, 0)} this month`,
          text: `That's ${money(f.projected - budgetTotal, 0)} over your ${money(budgetTotal, 0)} plan. Your current pace is ${money(f.rate)} a day with ${f.daysLeft} days left.` });
      } else {
        out.push({ kind: "good", ico: "i-check", title: `On pace for ${money(f.projected, 0)}, inside your plan`,
          text: `You have about ${money(budgetTotal - f.projected, 0)} of room left in your ${money(budgetTotal, 0)} budget if this pace holds.` });
      }
    }
    const cf = catForecast();
    const risky = Object.entries(S.budgets)
      .map(([cat, lim]) => ({ cat, lim: Number(lim), ...(cf[cat] || { spent: 0, projected: 0 }) }))
      .filter((c) => c.lim > 0 && c.projected > c.lim)
      .sort((a, b) => b.projected / b.lim - a.projected / a.lim);
    if (risky[0]) {
      const c = risky[0];
      out.push({ kind: "warn", ico: "i-alert", title: c.spent > c.lim ? `${c.cat} is already over budget` : `${c.cat} is trending over budget`,
        text: `Spent ${money(c.spent)} of ${money(c.lim, 0)}. At this pace it reaches ${money(c.projected, 0)} by month-end.` });
    }
    const flags = anomalies();
    const recentFlag = S.tx.filter((t) => flags[t.id] && daysUntil(t.date) >= -14).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (recentFlag) {
      const fl = flags[recentFlag.id];
      out.push({ kind: "warn", ico: "i-zap", title: `Unusual purchase: ${recentFlag.description} (${money(recentFlag.amount)})`,
        text: `That's ${fl.ratio.toFixed(1)}× your typical ${recentFlag.category} purchase of ${money(fl.typical)}. Planned splurges are fine; just make sure it was one.` });
    }
    if (mt.income > 0) {
      const rate = mt.savings / mt.income;
      if (rate < 0.1) out.push({ kind: "tip", ico: "i-bulb", title: `You've saved ${Math.round(rate * 100)}% of this month's income`,
        text: `Moving ${money(mt.income * 0.1, 0)} (10%) to savings right when money comes in is the easiest way to build the habit.` });
      else out.push({ kind: "good", ico: "i-shield", title: `You're saving ${Math.round(rate * 100)}% of your income`,
        text: `That beats the common 10% starting target. Keep the transfer automatic so it never depends on willpower.` });
    }
    const soon = S.payments.filter((p) => !p.paid && daysUntil(p.due) <= 3).sort((a, b) => a.due.localeCompare(b.due))[0];
    if (soon) {
      const d = daysUntil(soon.due);
      out.push({ kind: "tip", ico: "i-calendar", title: `${soon.name} is ${d < 0 ? "overdue" : d === 0 ? "due today" : `due in ${d} day${d === 1 ? "" : "s"}`}`,
        text: `Set aside ${money(soon.amount)} now so it doesn't surprise your budget.` });
    }
    const weak = Object.entries(S.learning.mastery).sort((a, b) => a[1] - b[1])[0];
    if (weak && weak[1] < 70) out.push({ kind: "tip", ico: "i-book", title: `Sharpen your ${weak[0]} skills`,
      text: `Your mastery is ${Math.round(weak[1])}%. An adaptive session in the Learn tab will target it.` });
    const order = { warn: 0, tip: 1, good: 2 };
    return out.sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 4);
  }

  /* ================= feedback: toasts, confetti, badges ================= */
  function toast(msg, opts = {}) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="ico">${icon(opts.icon || "i-check")}</span><span>${esc(msg)}</span>`;
    if (opts.undo) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "Undo";
      b.onclick = () => { opts.undo(); close(); };
      el.append(b);
    }
    $("#toasts").append(el);
    let gone = false;
    function close() { if (gone) return; gone = true; el.classList.add("out"); setTimeout(() => el.remove(), 280); }
    setTimeout(close, opts.undo ? 6000 : 3200);
  }
  function confetti(n = 90) {
    if (reduced()) return;
    const layer = document.createElement("div");
    layer.className = "confetti";
    const cols = ["#f5b83d", "#ffd27a", "#34d399", "#60a5fa", "#fb7185", "#a78bfa"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = cols[i % cols.length];
      p.style.setProperty("--dx", (Math.random() * 200 - 100).toFixed(0) + "px");
      p.style.setProperty("--r", (Math.random() * 900 - 450).toFixed(0) + "deg");
      p.style.setProperty("--d", (1300 + Math.random() * 1200).toFixed(0) + "ms");
      p.style.animationDelay = (Math.random() * 300).toFixed(0) + "ms";
      layer.append(p);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 3000);
  }
  function award(id) {
    if (S.learning.badges.includes(id)) return;
    S.learning.badges.push(id);
    save("learning");
    const b = D.BADGES[id];
    if (b) setTimeout(() => toast(`Badge unlocked: ${b.name}`, { icon: "i-trophy" }), 400);
  }
  function addXP(n) { S.learning.xp += n; recordDay(); save("learning"); }
  function recordDay() {
    const L = S.learning, t = todayISO();
    if (L.lastDay === t) return;
    const gap = L.lastDay ? Math.round((ML.parseDate(t) - ML.parseDate(L.lastDay)) / 86400000) : 999;
    L.streak = gap === 1 ? L.streak + 1 : 1;
    L.lastDay = t;
  }

  async function saveFile(name, text, type) {
    // Inside a Claude artifact viewer, plain download links are blocked; use its downloads API there.
    if (window.claude && window.claude.use) {
      let dl = null;
      try { dl = await window.claude.use("downloads"); } catch {}
      if (dl) { try { await dl.save({ filename: name, data: new Blob([text], { type }) }); } catch {} return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ================= animation helpers ================= */
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function fmtVal(v, el) {
    const f = el.dataset.fmt, dp = el.dataset.dp != null ? +el.dataset.dp : 2;
    if (f === "money") return money(v, dp);
    if (f === "pct") return Math.round(v) + "%";
    return Math.round(v).toLocaleString("en-US");
  }
  function countUps(animate) {
    for (const el of $$("[data-count]")) {
      const to = +el.dataset.count;
      if (!animate || reduced()) { el.textContent = fmtVal(to, el); continue; }
      const t0 = performance.now(), dur = 1000;
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = fmtVal(to * ease(p), el);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }
  function settle(animate) {
    const reveals = $$(".reveal");
    if (!animate || reduced()) reveals.forEach((el) => el.classList.add("in"));
    else reveals.forEach((el, i) => setTimeout(() => el.classList.add("in"), 70 * i));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$("[data-w]").forEach((el) => (el.style.width = el.dataset.w + "%"));
      $$("circle[data-off]").forEach((el) => (el.style.strokeDashoffset = el.dataset.off));
    }));
    countUps(animate);
    if (animate && !reduced()) {
      $$("path[data-draw]").forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = p.classList.contains("proj") ? "" : len;
        if (p.classList.contains("proj")) { p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 900, fill: "backwards" }); return; }
        p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1200, delay: 150 + i * 100, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
      });
      $$("[data-fade]").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: +el.dataset.fade, fill: "backwards" }));
    }
  }

  /* ================= charts ================= */
  function sparkline(values, col) {
    const w = 86, h = 32, max = Math.max(...values, 1);
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - (v / max) * (h - 4) - 2]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path data-draw d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function donut(cats) {
    const total = sum(cats.map((c) => c.amt));
    const r = 80, C = 2 * Math.PI * r;
    let acc = 0;
    const segs = cats.map((c) => {
      const len = (c.amt / total) * C;
      const gap = cats.length > 1 ? Math.min(3, len * 0.3) : 0;
      const rot = (acc / C) * 360 - 90;
      acc += len;
      return `<circle class="seg" data-cat="${esc(c.cat)}" cx="100" cy="100" r="${r}" stroke="${color(c.cat)}"
        stroke-dasharray="${(len - gap).toFixed(2)} ${C.toFixed(2)}" style="stroke-dashoffset:${(len - gap).toFixed(2)}" data-off="0"
        transform="rotate(${rot.toFixed(2)} 100 100)"><title>${esc(c.cat)}: ${money(c.amt)}</title></circle>`;
    }).join("");
    const legend = cats.map((c) => `<li data-cat="${esc(c.cat)}" style="--c:${color(c.cat)}"><span class="sw"></span><span>${esc(c.cat)}</span><span class="pct">${Math.round((c.amt / total) * 100)}%</span><span class="amt">${money(c.amt)}</span></li>`).join("");
    return `<div class="donut-wrap">
      <svg class="donut" viewBox="0 0 200 200" role="img" aria-label="Spending by category, ${money(total)} total">
        <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--line)" stroke-width="22"/>
        ${segs}
        <text class="center-num" x="100" y="102" text-anchor="middle" data-count="${total.toFixed(2)}" data-fmt="money" data-dp="0">${money(total, 0)}</text>
        <text class="center-lbl" x="100" y="122" text-anchor="middle">spent</text>
      </svg>
      <ul class="legend">${legend}</ul></div>`;
  }

  function cashChart() {
    const f = forecast();
    const budget = sum(Object.values(S.budgets).map(Number));
    const W = 600, H = 220, L = 46, R = 14, T = 14, B = 26;
    const top = Math.max(f.projected, budget, 10) * 1.12;
    const x = (day) => L + ((day - 1) / Math.max(1, f.daysInMonth - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / top) * (H - T - B);
    const pts = f.cumulative.map((v, i) => [x(i + 1), y(v)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = pts.length ? `${line} L${pts[pts.length - 1][0].toFixed(1)} ${y(0)} L${pts[0][0].toFixed(1)} ${y(0)} Z` : "";
    const last = pts[pts.length - 1] || [x(1), y(0)];
    const endX = x(f.daysInMonth), endY = y(f.projected);
    const ticks = [0, top / 2, top].map((v) => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis-t" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${money(v, 0)}</text>`).join("");
    const days = [1, 8, 15, 22, f.daysInMonth].map((d) => `<text class="axis-t" x="${x(d)}" y="${H - 6}" text-anchor="middle">${d}</text>`).join("");
    return `<svg class="line-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending so far ${money(f.spent)}, projected ${money(f.projected)} by month end">
      <defs><linearGradient id="goldFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--gold)" stop-opacity=".32"/><stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/></linearGradient></defs>
      ${ticks}${days}
      ${budget ? `<line class="budget-l" x1="${L}" x2="${W - R}" y1="${y(budget)}" y2="${y(budget)}"/><text class="budget-t" x="${L + 8}" y="${y(budget) - 7}" text-anchor="start">Budget ${money(budget, 0)}</text>` : ""}
      <path class="area" d="${area}" data-fade="300"/>
      <path class="actual" data-draw d="${line}"/>
      <path class="proj" data-draw d="M${last[0].toFixed(1)} ${last[1].toFixed(1)} L${endX.toFixed(1)} ${endY.toFixed(1)}"/>
      <circle class="end-dot" cx="${endX}" cy="${endY}" r="6" data-fade="1200"/>
      <circle class="now-dot" cx="${last[0]}" cy="${last[1]}" r="6" data-fade="1100"/>
    </svg>
    <div class="chart-legend"><span><i></i>Spent so far</span><span><i class="proj"></i>AI forecast</span>${budget ? `<span><i class="bud"></i>Monthly budget</span>` : ""}</div>
    ${forecastStats(f, budget)}`;
  }
  function forecastStats(f, budget) {
    const top = byCategory(monthTx())[0];
    const left = budget - f.spent;
    const safeDaily = f.daysLeft > 0 ? Math.max(0, left) / f.daysLeft : 0;
    return `<div class="mini-stats">
      <div><small>Daily pace</small><b>${money(f.rate)}</b><span>average per day</span></div>
      <div><small>To stay on plan</small><b>${budget ? money(safeDaily) : "—"}</b><span>${budget ? `a day for ${f.daysLeft} days` : "set a budget"}</span></div>
      <div><small>Biggest category</small><b>${top ? esc(top.cat) : "—"}</b><span>${top ? `${money(top.amt)} · ${Math.round((top.amt / f.spent) * 100)}%` : ""}</span></div>
    </div>`;
  }

  function ring(pct, col = "var(--gold)", label) {
    const r = 30, C = 2 * Math.PI * r;
    const p = clamp(pct, 0, 1);
    return `<svg class="ring" viewBox="0 0 76 76" style="--c:${col}" aria-hidden="true">
      <circle class="trk" cx="38" cy="38" r="${r}"/>
      <circle class="val" cx="38" cy="38" r="${r}" stroke-dasharray="${C.toFixed(2)}" style="stroke-dashoffset:${C.toFixed(2)}" data-off="${(C * (1 - p)).toFixed(2)}"/>
      <text x="38" y="44" text-anchor="middle">${label ?? Math.round(p * 100) + "%"}</text></svg>`;
  }

  /* ================= shared fragments ================= */
  function txRow(t, flags = {}) {
    const sign = t.type === "Income" ? "+" : t.type === "Expense" ? "−" : "";
    const cls = t.type === "Income" ? "in" : t.type === "Expense" ? "out" : "save";
    const fl = flags[t.id];
    return `<li class="tx reveal" style="--c:${color(t.category)}">
      <span class="cat-ico">${catIcon(t.category)}</span>
      <div><div class="title">${esc(t.description)}${fl ? `<span class="flag" title="Typical ${esc(t.category)} purchase: ${money(fl.typical)}">${icon("i-zap")}${fl.ratio.toFixed(1)}× usual</span>` : ""}${t.card ? `<span class="pill gold">Demo card</span>` : ""}</div>
      <div class="meta">${esc(t.category)} · ${fmtDate(t.date)}${t.type === "Saving" ? " · Saved" : ""}</div></div>
      <div><div class="amt ${cls}">${sign}${money(t.amount)}</div>
      ${flags.__deletable ? `<div class="actions"><button type="button" class="del" data-action="del-tx" data-id="${t.id}" aria-label="Delete ${esc(t.description)}">${icon("i-trash")}</button></div>` : ""}</div>
    </li>`;
  }
  const pageHead = (eyebrow, title, sub, right = "") =>
    `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div>${right}</div>`;
  const empty = (title, msg) => `<div class="empty"><b>${title}</b>${msg}</div>`;
  const catOptions = (sel) => D.CATEGORIES.map((c) => `<option ${c === sel ? "selected" : ""}>${c}</option>`).join("");

  /* ================= pages ================= */
  const ui = { txFilter: "All", txSearch: "", learnTab: "challenges", quiz: null, scenario: 0, scenarioPick: null, scenarioDone: false, lessonPick: {}, calcWeekly: 15, calcWeeks: 26, evalRunning: false };

  function pageOverview() {
    const mt = totals(monthTx());
    const f = forecast();
    const budget = sum(Object.values(S.budgets).map(Number));
    const name = S.settings.name ? `, ${esc(S.settings.name)}` : "";
    const ahead = mt.cashflow >= 0;
    const cats = byCategory(monthTx());
    const upcoming = S.payments.filter((p) => !p.paid).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
    const recent = S.tx.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    const flags = anomalies();
    const status = budget ? (f.projected > budget ? `<span class="pill coral">${icon("i-alert")}Over plan</span>` : `<span class="pill mint">${icon("i-check")}On track</span>`) : "";
    const avail = available();
    return `
    <section class="hero reveal">
      <div>
        <div class="eyebrow">Your money · ${monthName()}</div>
        <h1>Hey${name}, you're <em>${money(Math.abs(mt.cashflow), 0)} ${ahead ? "ahead" : "behind"}</em> this month.</h1>
        <p>${ahead ? "Income is beating spending so far. Here's what your AI coach sees, and where your money is going." : "Spending is outpacing income so far. Your AI coach has a few ideas below."}</p>
        <div class="row">
          <button type="button" class="btn primary" data-go="centy">${icon("i-chat")}Ask Centy</button>
          <button type="button" class="btn" data-go="activity">${icon("i-plus")}Add transaction</button>
          <button type="button" class="btn" data-go="learn">${icon("i-book")}Practice a money skill</button>
        </div>
      </div>
      <div class="stat-block">
        <span class="ai-badge">${icon("i-spark")}AI month-end forecast</span>
        <div class="big" data-count="${f.projected.toFixed(2)}" data-fmt="money" data-dp="0">${money(f.projected, 0)}</div>
        <div class="muted small">Spent ${money(f.spent)} so far · ${money(f.rate)}/day · ${f.daysLeft} days left</div>
        <div>${status}</div>
      </div>
    </section>

    <section class="grid g-4 mt">
      ${kpi("Income", mt.income, "var(--mint)", "Recorded this month", sparkline(dailySeries("Income"), "var(--mint)"))}
      ${kpi("Spending", mt.expenses, "var(--coral)", "Recorded this month", sparkline(dailySeries("Expense"), "var(--coral)"))}
      ${kpi("Saved", mt.savings, "var(--sky)", "Contributions this month", sparkline(dailySeries("Saving"), "var(--sky)"))}
      ${kpi("Available money", avail, "var(--gold)", "Not yet spent or saved", "")}
    </section>

    <section class="grid g-main mt">
      <div class="card reveal">
        <div class="section-title"><h2>Spending this month</h2><span class="ai-badge">${icon("i-spark")}Forecast</span></div>
        ${f.spent > 0 ? cashChart() : empty("No spending yet this month", "Add an expense and the forecast appears here.")}
      </div>
      <div class="card coach reveal">
        <div class="section-title"><h2>AI coach</h2><span class="ai-badge">${icon("i-brain")}On-device</span></div>
        <p class="muted small" style="margin:0;position:relative;z-index:1">Reads your ledger, budgets, payments and quiz results. Nothing leaves this browser.</p>
        <ul class="insights" id="coachList"><li class="skeleton" style="height:58px"></li><li class="skeleton" style="height:58px"></li><li class="skeleton" style="height:58px"></li></ul>
      </div>
    </section>

    <section class="grid g-main mt">
      <div class="card reveal">
        <div class="section-title"><h2>Where it went</h2><span class="muted small">${monthName()}</span></div>
        ${cats.length ? donut(cats) : empty("Your chart is ready", "Add expenses to see where your money goes.")}
      </div>
      <div class="card reveal">
        <div class="section-title"><h2>Upcoming</h2><button type="button" class="link-btn" data-go="payments">Manage ${icon("i-arrow")}</button></div>
        ${upcoming.length ? `<ul class="tx-list">${upcoming.map(payMini).join("")}</ul>` : empty("All clear", "No upcoming payments.")}
      </div>
    </section>

    <section class="card mt reveal">
      <div class="section-title"><h2>Recent activity</h2><button type="button" class="link-btn" data-go="activity">See all ${icon("i-arrow")}</button></div>
      ${recent.length ? `<ul class="tx-list">${recent.map((t) => txRow(t, flags)).join("")}</ul>` : empty("No activity yet", "Add a transaction to see it here.")}
    </section>`;
  }
  function kpi(label, value, col, note, spark) {
    return `<div class="card kpi hover reveal" style="--c:${col}">
      <div class="label"><span class="dot"></span>${label}</div>${spark}
      <div class="value" data-count="${value.toFixed(2)}" data-fmt="money">${money(value)}</div>
      <div class="note">${note}</div></div>`;
  }
  function payMini(p) {
    const d = daysUntil(p.due);
    const st = d < 0 ? `<span class="pill coral">${-d}d overdue</span>` : d <= 3 ? `<span class="pill gold">${d === 0 ? "Today" : "In " + d + "d"}</span>` : `<span class="muted small">${fmtDate(p.due)}</span>`;
    return `<li class="tx reveal" style="--c:var(--gold)"><span class="cat-ico">${icon("i-calendar")}</span>
      <div><div class="title">${esc(p.name)}</div><div class="meta">${esc(p.frequency)}</div></div>
      <div style="text-align:right"><div class="amt out">${money(p.amount)}</div>${st}</div></li>`;
  }
  function fillCoach() {
    const list = $("#coachList");
    if (!list) return;
    const items = coachInsights();
    const html = items.length ? items.map((it) => `<li class="insight ${it.kind} reveal in"><span class="ico">${icon(it.ico)}</span><div><b>${esc(it.title)}</b><span>${esc(it.text)}</span></div></li>`).join("")
      : `<li class="insight good"><span class="ico">${icon("i-check")}</span><div><b>Nothing to flag</b><span>Add more activity and the coach will start spotting patterns.</span></div></li>`;
    const delay = reduced() ? 0 : 650;
    setTimeout(() => {
      list.innerHTML = html;
      if (!reduced()) $$(".insight", list).forEach((el, i) => el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: i * 110, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
    }, delay);
  }

  /* ---------- Activity ---------- */
  const form = { desc: "", cat: null, catTouched: false, type: "Expense", pred: null };
  function pageActivity() {
    const flags = { ...anomalies(), __deletable: true };
    const q = ui.txSearch.trim().toLowerCase();
    let list = S.tx.slice().sort((a, b) => b.date.localeCompare(a.date) || 0);
    if (ui.txFilter !== "All") list = list.filter((t) => t.type === ui.txFilter);
    if (q) list = list.filter((t) => (t.description + " " + t.category).toLowerCase().includes(q));
    const c = getCV();
    return `
    ${pageHead("Activity ledger", "Transactions", "Type a description and the AI suggests a category. Every save teaches it a little more about how you spend.")}
    <section class="grid g-main">
      <div class="card reveal">
        <div class="section-title"><h2>Add a transaction</h2><span class="ai-badge">${icon("i-spark")}Smart categorize</span></div>
        <form data-form="tx" novalidate>
          <div class="form-grid">
            <div class="field full"><label for="txDesc">Description</label>
              <input class="input" id="txDesc" name="desc" autocomplete="off" placeholder="e.g. Bubble tea with friends" maxlength="80" value="${esc(form.desc)}"></div>
            <div class="full suggest" id="suggest" aria-live="polite">${suggestHTML()}</div>
            <div class="field"><label for="txAmt">Amount ($)</label><input class="input num" id="txAmt" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="12.00"></div>
            <div class="field"><label for="txDate">Date</label><input class="input" id="txDate" name="date" type="date" value="${todayISO()}"></div>
            <div class="field"><span class="label-sm" id="typeLbl">Type</span>
              <div class="seg" role="group" aria-labelledby="typeLbl" id="typeSeg">${["Expense", "Income", "Saving"].map((t) => `<button type="button" data-action="tx-type" data-v="${t}" aria-pressed="${form.type === t}">${t}</button>`).join("")}</div></div>
            <div class="field"><label for="txCat">Category</label><select class="select" id="txCat" name="category">${catOptions(form.cat || "Food")}</select></div>
            <div class="field"><label for="txMethod">Payment method</label><select class="select" id="txMethod" name="method"><option>Card</option><option>Cash</option><option>Transfer</option><option>Centsible demo card</option></select></div>
            <div class="field" id="codeField" hidden><label for="txCode">Demo card code</label><input class="input num" id="txCode" name="code" placeholder="${D.DEMO_CARD_CODE}" autocomplete="off"></div>
          </div>
          <p class="error" id="txErr"></p>
          <button class="btn primary block" type="submit">${icon("i-plus")}Save transaction</button>
        </form>
      </div>
      <div class="grid" style="align-content:start">
        <div class="card reveal">
          <div class="section-title"><h2>Import & export</h2></div>
          <p class="muted small" style="margin-top:0">CSV columns: Date, Description, Category, Amount, Type. Missing or unknown categories are filled in by the AI.</p>
          <div class="grid g-2" style="gap:10px">
            <label class="btn">${icon("i-upload")}Upload CSV<input type="file" accept=".csv,text/csv" id="csvFile" class="sr-only"></label>
            <button type="button" class="btn" data-action="load-sample">${icon("i-list")}Load sample</button>
            <button type="button" class="btn" data-action="export-csv" style="grid-column:1/-1">${icon("i-download")}Export CSV</button>
          </div>
        </div>
        <div class="card reveal">
          <div class="section-title"><h2>The model</h2><span class="ai-badge">${icon("i-brain")}Naive Bayes</span></div>
          <dl class="kv">
            <dt>Held-out accuracy</dt><dd><span data-count="${(c.accuracy * 100).toFixed(1)}" data-fmt="pct">${Math.round(c.accuracy * 100)}%</span> <span class="muted small">(${c.k}-fold CV)</span></dd>
            <dt>Baseline</dt><dd>${Math.round(c.baseline * 100)}% <span class="muted small">(always “most common”)</span></dd>
            <dt>Training examples</dt><dd>${D.TRAINING.length.toLocaleString()} + ${S.userExamples.length} from you</dd>
            <dt>Corrections taught</dt><dd>${S.taught}</dd>
          </dl>
        </div>
      </div>
    </section>

    <section class="card mt-l reveal">
      <div class="section-title"><h2>History</h2><span class="muted small">${list.length} of ${S.tx.length}</span></div>
      <div class="toolbar">
        <input class="input" id="txSearch" type="search" placeholder="Search description or category" value="${esc(ui.txSearch)}" aria-label="Search transactions">
        <div class="seg" role="group" aria-label="Filter by type">${["All", "Expense", "Income", "Saving"].map((t) => `<button type="button" data-action="tx-filter" data-v="${t}" aria-pressed="${ui.txFilter === t}">${t}</button>`).join("")}</div>
      </div>
      ${list.length ? `<ul class="tx-list">${list.map((t) => txRow(t, flags)).join("")}</ul>` : empty("Nothing matches", "Try another search or filter.")}
      <p class="hint" style="margin:14px 0 0">${icon("i-zap")} <b>×usual</b> flags come from the anomaly detector: a purchase far above your typical amount in that category.</p>
    </section>`;
  }
  function suggestHTML() {
    const p = form.pred;
    if (!form.desc.trim()) return `<div class="why">${icon("i-spark")} Start typing and the AI will suggest a category, with its confidence and the words that drove the guess.</div>`;
    if (!p || !p.label) return `<div class="why">${icon("i-spark")} Not sure yet. Pick a category below and the AI will learn this one.</div>`;
    const conf = Math.round(p.confidence * 100);
    const chips = (p.confidence >= 0.6 ? p.ranked.slice(0, 1) : p.ranked.slice(0, 3)).map((r) =>
      `<button type="button" class="cat-chip" data-action="pick-cat" data-v="${esc(r.label)}" aria-pressed="${(form.cat || "") === r.label}" style="--c:${color(r.label)}">${catIcon(r.label)}${esc(r.label)} <span class="num muted">${Math.round(r.p * 100)}%</span></button>`).join("");
    return `<div class="row"><span class="label-sm">${p.confidence >= 0.6 ? "AI suggests" : "AI isn't sure. Top guesses"}</span><div class="conf" title="Confidence ${conf}%"><i data-w="${conf}"></i></div><span class="num small">${conf}%</span></div>
      <div class="row">${chips}</div>
      ${p.reasons.length ? `<div class="why">Because of ${p.reasons.map((r) => `<mark>${esc(r)}</mark>`).join(" ")}</div>` : ""}`;
  }
  function updateSuggest() {
    form.pred = form.desc.trim() ? model.predict(form.desc) : null;
    if (form.pred && form.pred.label && form.pred.confidence >= 0.6 && !form.catTouched) {
      form.cat = form.pred.label;
      const sel = $("#txCat"); if (sel) sel.value = form.cat;
      if (form.cat === "Income") setType("Income");
      else if (form.cat === "Savings") setType("Saving");
    }
    const box = $("#suggest");
    if (!box) return;
    box.innerHTML = suggestHTML();
    requestAnimationFrame(() => requestAnimationFrame(() => $$("[data-w]", box).forEach((el) => (el.style.width = el.dataset.w + "%"))));
  }
  function setType(t) {
    form.type = t;
    $$("#typeSeg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === t)));
  }

  function parseCSV(text) {
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const cells = []; let cur = "", q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
        else if (ch === '"') q = true; else if (ch === ",") { cells.push(cur); cur = ""; } else cur += ch;
      }
      cells.push(cur);
      rows.push(cells.map((c) => c.trim()));
    }
    return rows;
  }
  const CAT_SYNONYMS = { gift: "Gifts", gifts: "Gifts", saving: "Savings", savings: "Savings", transport: "Transportation", transit: "Transportation", travel: "Transportation", school: "Education", groceries: "Food", dining: "Food", fun: "Entertainment", bills: "Utilities", rent: "Housing", salary: "Income", wages: "Income" };
  function importCSV(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) { toast("That file has no rows to import.", { icon: "i-alert" }); return; }
    const head = rows[0].map((h) => h.toLowerCase());
    const col = (name) => head.indexOf(name);
    const iDate = col("date"), iDesc = col("description"), iCat = col("category"), iAmt = col("amount"), iType = col("type");
    if (iDesc < 0 || iAmt < 0) { toast("The CSV needs at least Description and Amount columns.", { icon: "i-alert" }); return; }
    let added = 0, aiFilled = 0, skipped = 0;
    const seen = new Set(S.tx.map((t) => `${t.date}|${t.description.toLowerCase()}|${t.amount}`));
    for (const r of rows.slice(1)) {
      const description = (r[iDesc] || "").slice(0, 80);
      const amount = Math.abs(parseFloat(String(r[iAmt]).replace(/[$,]/g, "")));
      if (!description || !isFinite(amount) || amount <= 0) { skipped++; continue; }
      const dRaw = iDate >= 0 ? r[iDate] : "";
      const date = /^\d{4}-\d{2}-\d{2}$/.test(dRaw) ? dRaw : todayISO();
      let category = iCat >= 0 ? r[iCat] : "";
      const norm = D.CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase()) || CAT_SYNONYMS[category.toLowerCase()];
      if (norm) category = norm;
      else { const p = model.predict(description); category = p.label || "Other"; aiFilled++; }
      let type = iType >= 0 ? r[iType].toLowerCase() : "";
      type = type.startsWith("inc") ? "Income" : type.startsWith("sav") ? "Saving" : type.startsWith("exp") ? "Expense" : category === "Income" ? "Income" : category === "Savings" ? "Saving" : "Expense";
      const key = `${date}|${description.toLowerCase()}|${amount}`;
      if (seen.has(key)) { skipped++; continue; }
      seen.add(key);
      S.tx.push({ id: uid(), date, description, category, amount, type, method: "Imported", card: "" });
      added++;
    }
    save("tx");
    if (added) award("first-steps");
    toast(`Imported ${added} transaction${added === 1 ? "" : "s"}${aiFilled ? ` · AI categorized ${aiFilled}` : ""}${skipped ? ` · skipped ${skipped}` : ""}`, { icon: added ? "i-check" : "i-alert" });
    render({ soft: true });
  }
  const SAMPLE_CSV = "Date,Description,Category,Amount,Type\n2026-11-01,Part-time job,Income,250,Income\n2026-11-02,Lunch,Food,14,Expense\n2026-11-03,Movie,Entertainment,18,Expense\n2026-11-04,Bus pass,Transportation,25,Expense\n2026-11-05,Birthday money,Gift,50,Income\n2026-11-06,Clothes,Shopping,35,Expense\n2026-11-07,Savings deposit,Savings,40,Saving\n";
  const toCSV = (list) => ["Date,Description,Category,Amount,Type,Payment method"].concat(list.map((t) =>
    [t.date, t.description, t.category, t.amount.toFixed(2), t.type, t.method].map((v) => /[",]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(","))).join("\n");

  /* ---------- Budget ---------- */
  function pageBudget() {
    const cf = catForecast();
    const entries = Object.entries(S.budgets).map(([cat, lim]) => ({ cat, lim: Number(lim), ...(cf[cat] || { spent: 0, projected: 0 }) }));
    const planned = sum(entries.map((e) => e.lim));
    const spent = sum(entries.map((e) => e.spent));
    const f = forecast();
    const unplanned = byCategory(monthTx()).filter((c) => !(c.cat in S.budgets));
    const addable = D.CATEGORIES.filter((c) => !(c in S.budgets) && c !== "Income" && c !== "Savings");
    return `
    ${pageHead("Plan with intention", "Budget studio", "Set a limit for each category. The AI projects where each one will land at month-end, so you can adjust before it's too late, not after.")}
    <section class="grid g-3">
      ${kpi("Planned limits", planned, "var(--gold)", `${entries.length} categories`, "")}
      ${kpi("Spent this month", spent, "var(--coral)", `${Math.round(planned ? (spent / planned) * 100 : 0)}% of plan used`, "")}
      ${kpi("Projected month-end", f.projected, "var(--sky)", `${f.daysLeft} days left in ${monthName()}`, "")}
    </section>
    <section class="grid g-3 mt-l">
      ${entries.map((e) => {
        const pct = e.lim ? (e.spent / e.lim) * 100 : 0;
        const projPct = e.lim ? (e.projected / e.lim) * 100 : 0;
        const st = e.spent > e.lim ? `<span class="pill coral">Over limit</span>` : projPct > 100 ? `<span class="pill gold">At risk</span>` : `<span class="pill mint">On track</span>`;
        const fillCol = e.spent > e.lim ? "var(--coral)" : projPct > 100 ? "var(--gold)" : "var(--mint)";
        return `<div class="card budget-card hover reveal" style="--c:${color(e.cat)}">
          <div class="top"><span class="cat-ico">${catIcon(e.cat)}</span><div style="flex:1;min-width:0"><h3>${esc(e.cat)}</h3>${st}</div>
            <button type="button" class="del btn ghost sm" data-action="del-budget" data-cat="${esc(e.cat)}" aria-label="Remove ${esc(e.cat)} budget">${icon("i-x")}</button></div>
          <div class="bar-track" title="Projected ${money(e.projected)}"><i data-w="${Math.min(100, pct).toFixed(1)}" style="--c:${fillCol}"></i>${e.projected > e.spent ? `<b style="left:${Math.min(99, projPct).toFixed(1)}%"></b>` : ""}</div>
          <div class="nums"><span>Spent <b>${money(e.spent)}</b></span><span>AI projects <b>${money(e.projected, 0)}</b></span></div>
          <div class="limit-edit"><label class="label-sm" for="lim-${esc(e.cat)}">Limit $</label><input class="input" id="lim-${esc(e.cat)}" data-limit="${esc(e.cat)}" type="number" min="0" step="5" value="${e.lim}"></div>
        </div>`;
      }).join("")}
      <div class="card reveal" style="display:flex;flex-direction:column;gap:10px;justify-content:center">
        <h3>Add a category</h3>
        ${addable.length ? `<form data-form="add-budget" class="grid" style="gap:10px">
          <select class="select" name="cat" aria-label="Category">${addable.map((c) => `<option>${c}</option>`).join("")}</select>
          <input class="input num" name="lim" type="number" min="0" step="5" value="40" aria-label="Limit in dollars">
          <button class="btn primary" type="submit">${icon("i-plus")}Add budget</button></form>` : `<p class="muted small">Every category has a budget.</p>`}
      </div>
    </section>
    ${unplanned.length ? `<div class="notice-box mt">${icon("i-bulb")} <b>Unbudgeted spending:</b> ${unplanned.map((u) => `${esc(u.cat)} ${money(u.amt)}`).join(", ")}. Give it a limit so the AI can track its pace.</div>` : ""}
    <p class="hint mt">The white tick on each bar marks the AI's projected month-end spending at your current daily pace.</p>`;
  }

  /* ---------- Goals ---------- */
  function pageGoals() {
    const rate = savingRate60();
    return `
    ${pageHead("Future you", "Savings goals", "Give each goal a target and a date. Centsible works out the monthly pace and predicts when you'll actually get there at your recent saving rate.")}
    <section class="grid g-main">
      <div class="grid g-2" style="align-content:start">
        ${S.goals.length ? S.goals.map((g) => goalCard(g, rate)).join("") : `<div style="grid-column:1/-1">${empty("Your next goal starts here", "Create a goal to see your progress and a suggested pace.")}</div>`}
      </div>
      <div class="card reveal" style="align-self:start">
        <div class="section-title"><h2>New goal</h2></div>
        <form data-form="goal" class="grid" style="gap:12px" novalidate>
          <div class="field"><label for="gName">Goal name</label><input class="input" id="gName" name="name" placeholder="e.g. Concert tickets" maxlength="40"></div>
          <div class="field"><label for="gTarget">Target ($)</label><input class="input num" id="gTarget" name="target" type="number" min="1" step="1" value="300"></div>
          <div class="field"><label for="gSaved">Already saved ($)</label><input class="input num" id="gSaved" name="saved" type="number" min="0" step="1" value="0"></div>
          <div class="field"><label for="gDate">Target date</label><input class="input" id="gDate" name="deadline" type="date" value="${addDays(120)}"></div>
          <p class="error" id="goalErr"></p>
          <button class="btn primary" type="submit">${icon("i-target")}Create goal</button>
        </form>
        <p class="hint">Your recent saving rate: <b class="num">${money(rate)}</b>/month (last 60 days).</p>
      </div>
    </section>

    <section class="grid g-main mt-l">
      <div class="card reveal">
        <div class="section-title"><h2>Wishlist</h2><span class="ai-badge">${icon("i-spark")}Affordability check</span></div>
        <p class="muted small" style="margin-top:0">Add things you want. Centsible checks each one against your available money, upcoming bills and budgets. Ask Centy for a second opinion.</p>
        ${S.wishlist.length ? `<ul class="tx-list">${S.wishlist.map((w) => {
          const d = affordCheck(w.price, w.name);
          const pill = d.kind === "good" ? "mint" : d.kind === "tip" ? "gold" : "coral";
          return `<li class="tx wish reveal"><span class="cat-ico">${icon("i-bag")}</span>
            <div style="min-width:0"><div class="title">${esc(w.name)} <span class="pill ${pill}">${esc(d.label)}</span></div><div class="why-line">${esc(d.summary)}</div></div>
            <div style="text-align:right"><div class="amt out">${money(w.price)}</div><div class="acts">
              <button type="button" class="btn sm" data-action="wish-ask" data-id="${w.id}">${icon("i-chat")}Ask Centy</button>
              <button type="button" class="del" data-action="wish-del" data-id="${w.id}" aria-label="Remove ${esc(w.name)}">${icon("i-trash")}</button></div></div></li>`;
        }).join("")}</ul>` : empty("Your wishlist is empty", "Add something you've been wanting.")}
        <form data-form="wish" class="toolbar mt" novalidate>
          <input class="input" name="name" maxlength="40" placeholder="Item, e.g. Headphones" aria-label="Item name">
          <input class="input num" name="price" type="number" min="0.01" step="0.01" placeholder="Price $" aria-label="Price" style="max-width:130px;flex:none">
          <button class="btn primary" type="submit">${icon("i-plus")}Add</button>
        </form>
        <p class="error" id="wishErr"></p>
      </div>
      <div class="card reveal" id="calcCard">
        <div class="section-title"><h2>Future savings calculator</h2><span class="muted">${icon("i-calc")}</span></div>
        ${calcHTML()}
      </div>
    </section>`;
  }
  function calcHTML() {
    const w = ui.calcWeekly, n = ui.calcWeeks;
    const total = w * n;
    const targets = [...S.goals.filter((g) => g.saved < g.target).map((g) => ({ name: g.name, need: g.target - g.saved })), ...S.wishlist.map((x) => ({ name: x.name, need: x.price }))].sort((a, b) => a.need - b.need).slice(0, 5);
    const bars = Array.from({ length: 12 }, (_, i) => ((i + 1) / 12) * 100);
    return `<div class="grid" style="gap:14px">
      <div class="field"><label for="calcW">Save each week: <b class="num" id="calcWOut">${money(w, 0)}</b></label><input class="range" id="calcW" type="range" min="0" max="100" step="5" value="${w}"></div>
      <div class="field"><label for="calcN">For: <b class="num" id="calcNOut">${n} weeks</b></label><input class="range" id="calcN" type="range" min="4" max="104" step="1" value="${n}"></div>
      <div><div class="label-sm">You'd have</div><div class="calc-out" id="calcTotal">${money(total, 0)}</div><div class="hint">${money(w, 0)} × ${n} weeks, before any interest. Real results depend on what you actually save.</div></div>
      <div class="calc-bars" aria-hidden="true">${bars.map((h) => `<i style="height:${h}%"></i>`).join("")}</div>
      ${targets.length ? `<ul class="covers" id="calcCovers">${coversHTML(total, targets)}</ul>` : ""}
    </div>`;
  }
  function coversHTML(total, targets) {
    return targets.map((t) => `<li class="${total >= t.need ? "ok" : "no"}">${icon(total >= t.need ? "i-check" : "i-x")}${esc(t.name)} <span class="num muted">(${money(t.need, 0)} to go)</span></li>`).join("");
  }
  function goalCard(g, rate) {
    const remaining = Math.max(0, g.target - g.saved);
    const pct = g.target ? g.saved / g.target : 0;
    const days = Math.max(0, daysUntil(g.deadline));
    const monthly = remaining / Math.max(days / 30.44, 1 / 30.44);
    const done = remaining <= 0;
    let eta = "";
    if (!done) {
      if (rate > 0) {
        const months = remaining / rate;
        const etaDate = addDays(Math.round(months * 30.44));
        const onTime = etaDate <= g.deadline;
        eta = `<div class="why">${icon("i-spark")} At your recent rate you'd reach it around <b>${fmtDate(etaDate, { month: "short", year: "numeric" })}</b> <span class="pill ${onTime ? "mint" : "gold"}">${onTime ? "on time" : "after the deadline"}</span></div>`;
      } else eta = `<div class="why">${icon("i-spark")} Log a savings contribution and the AI can predict when you'll get there.</div>`;
    }
    return `<div class="card goal hover reveal ${done ? "done" : ""}">
      <div class="top">${ring(pct, done ? "var(--mint)" : "var(--gold)")}
        <div style="min-width:0"><h3>${esc(g.name)}</h3><div class="muted small">${done ? "Fully funded" : `Due ${fmtDate(g.deadline, { month: "short", day: "numeric", year: "numeric" })} · ${days} days left`}</div></div></div>
      <div class="stats"><div><small>Saved</small><b>${money(g.saved, 0)}</b></div><div><small>To go</small><b>${money(remaining, 0)}</b></div><div><small>Per month</small><b>${done ? "—" : money(monthly, 0)}</b></div></div>
      ${eta}
      ${done ? `<button type="button" class="btn sm danger" data-action="del-goal" data-id="${g.id}">${icon("i-trash")}Remove goal</button>` : `
      <form class="contrib" data-form="contrib" data-id="${g.id}">
        <input class="input num" name="amt" type="number" min="0.01" step="0.01" placeholder="Add $" aria-label="Contribution to ${esc(g.name)}">
        <button class="btn sm primary" type="submit">${icon("i-plus")}Add</button>
        <button class="btn sm ghost danger" type="button" data-action="del-goal" data-id="${g.id}" aria-label="Delete ${esc(g.name)}">${icon("i-trash")}</button>
      </form>`}
    </div>`;
  }

  /* ---------- Payments ---------- */
  function pagePayments() {
    const unpaid = S.payments.filter((p) => !p.paid).sort((a, b) => a.due.localeCompare(b.due));
    const paid = S.payments.filter((p) => p.paid).sort((a, b) => (b.paidDate || "").localeCompare(a.paidDate || "")).slice(0, 10);
    const dueSoon = sum(unpaid.filter((p) => daysUntil(p.due) <= 14).map((p) => p.amount));
    return `
    ${pageHead("Stay ahead", "Payments", "Track bills and subscriptions before they're due. Marking one paid logs it as an expense, categorized by the AI, and schedules the next one if it repeats.")}
    <section class="grid g-main">
      <div class="card reveal">
        <div class="section-title"><h2>Upcoming</h2><span class="pill gold">${money(dueSoon)} due in 14 days</span></div>
        ${unpaid.length ? `<ul class="tx-list">${unpaid.map(payRow).join("")}</ul>` : empty("No upcoming payments", "Add one to start tracking.")}
      </div>
      <div class="card reveal" style="align-self:start">
        <div class="section-title"><h2>Add a payment</h2></div>
        <form data-form="payment" class="grid" style="gap:12px" novalidate>
          <div class="field"><label for="pName">Name</label><input class="input" id="pName" name="name" placeholder="e.g. Streaming subscription" maxlength="40"></div>
          <div class="field"><label for="pAmt">Amount ($)</label><input class="input num" id="pAmt" name="amount" type="number" min="0.01" step="0.01" value="10"></div>
          <div class="field"><label for="pDue">Due date</label><input class="input" id="pDue" name="due" type="date" value="${addDays(7)}"></div>
          <div class="field"><label for="pFreq">Repeats</label><select class="select" id="pFreq" name="frequency"><option>One-time</option><option>Weekly</option><option selected>Monthly</option><option>Yearly</option></select></div>
          <p class="error" id="payErr"></p>
          <button class="btn primary" type="submit">${icon("i-plus")}Add payment</button>
        </form>
      </div>
    </section>
    <section class="card mt-l reveal">
      <div class="section-title"><h2>Paid</h2></div>
      ${paid.length ? `<ul class="tx-list">${paid.map((p) => `<li class="tx reveal" style="--c:var(--mint)"><span class="cat-ico">${icon("i-check")}</span><div><div class="title">${esc(p.name)}</div><div class="meta">Paid ${fmtDate(p.paidDate)}</div></div><div class="amt out">${money(p.amount)}</div></li>`).join("")}</ul>` : `<p class="muted small" style="margin:0">Payments you mark as paid appear here.</p>`}
    </section>`;
  }
  function payRow(p) {
    const d = daysUntil(p.due);
    const st = d < 0 ? `<span class="pill coral">${-d} day${d === -1 ? "" : "s"} overdue</span>` : d === 0 ? `<span class="pill gold">Due today</span>` : d <= 3 ? `<span class="pill gold">Due in ${d} day${d === 1 ? "" : "s"}</span>` : `<span class="muted small">Due ${fmtDate(p.due)}</span>`;
    const dt = ML.parseDate(p.due);
    return `<li class="tx pay reveal" style="--c:var(--gold)">
      <div class="date-tile"><small>${dt.toLocaleDateString("en-US", { month: "short" })}</small><b>${dt.getDate()}</b></div>
      <div><div class="title">${esc(p.name)}</div><div class="meta">${esc(p.frequency)} · ${st}</div></div>
      <div class="amt out pay-amt">${money(p.amount)}</div>
      <button type="button" class="check-btn" data-action="pay" data-id="${p.id}" aria-label="Mark ${esc(p.name)} paid">${icon("i-check")}</button>
    </li>`;
  }

  /* ---------- Learn ---------- */
  function pageLearn() {
    const L = S.learning;
    const level = Math.floor(L.xp / 250) + 1;
    const into = L.xp % 250;
    const head = pageHead("Centsible academy", "Learning lab", "Learn a concept, apply it to a decision, and prove you understand it. Adaptive mode uses your results to aim questions at your weakest topics.");
    const stats = `<section class="grid g-4">
      <div class="card kpi reveal" style="--c:var(--gold)"><div class="label"><span class="dot"></span>Level</div><div class="value" data-count="${level}" data-fmt="int">${level}</div>
        <div class="xp-bar mt" title="${into} of 250 XP"><i data-w="${((into / 250) * 100).toFixed(1)}"></i></div><div class="note">${250 - into} XP to level ${level + 1}</div></div>
      <div class="card kpi reveal" style="--c:var(--gold-2)"><div class="label"><span class="dot"></span>Total XP</div><div class="value" data-count="${L.xp}" data-fmt="int">${L.xp}</div><div class="note">10 XP per correct answer</div></div>
      <div class="card kpi reveal" style="--c:var(--coral)"><div class="label"><span class="dot"></span>Streak</div><div class="value">${icon("i-flame")} <span data-count="${L.streak}" data-fmt="int">${L.streak}</span></div><div class="note">day${L.streak === 1 ? "" : "s"} in a row</div></div>
      <div class="card kpi reveal" style="--c:var(--mint)"><div class="label"><span class="dot"></span>Lessons</div><div class="value"><span data-count="${L.completed.length}" data-fmt="int">${L.completed.length}</span><span class="muted" style="font-size:1rem"> / ${D.LESSONS.length}</span></div><div class="note">completed</div></div>
    </section>`;
    if (ui.quiz) return head + `<section class="mt-l">${quizView()}</section>`;
    const tabs = [["challenges", "Challenges"], ["lessons", "Lessons"], ["scenarios", "Scenarios"], ["progress", "Progress"]];
    const body = { challenges: learnChallenges, lessons: learnLessons, scenarios: learnScenarios, progress: learnProgress }[ui.learnTab]();
    return head + stats + `<div class="seg mt-l" role="group" aria-label="Learning sections">${tabs.map(([k, l]) => `<button type="button" data-action="learn-tab" data-v="${k}" aria-pressed="${ui.learnTab === k}">${l}</button>`).join("")}</div><div class="mt">${body}</div>`;
  }
  function learnChallenges() {
    const topics = ["All topics", ...Object.keys(D.TOPICS).sort()];
    return `
    <form data-form="quiz-config" class="card reveal">
      <div class="form-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        <div class="field"><label for="qTopic">Topic</label><select class="select" id="qTopic" name="topic">${topics.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
        <div class="field"><label for="qDiff">Difficulty</label><select class="select" id="qDiff" name="difficulty"><option>Mixed</option><option>Starter</option><option>Core</option><option>Advanced</option></select></div>
        <div class="field"><label for="qCount">Questions</label><select class="select" id="qCount" name="count"><option>5</option><option selected>8</option><option>10</option><option>15</option></select></div>
      </div>
    </form>
    <section class="grid g-3 mt">
      <div class="card mode-card hover reveal"><span class="ico">${icon("i-brain")}</span><h3>Adaptive <span class="ai-badge" style="margin-left:6px">AI</span></h3>
        <p>Picks questions from the topics you're weakest in and brings back ones you missed. Instant feedback after every answer.</p>
        <button type="button" class="btn primary" data-action="start-quiz" data-mode="Adaptive">Start adaptive ${icon("i-arrow")}</button></div>
      <div class="card mode-card sky hover reveal"><span class="ico">${icon("i-zap")}</span><h3>Practice</h3>
        <p>Your chosen topic and difficulty, with the explanation and a takeaway right after each answer.</p>
        <button type="button" class="btn" data-action="start-quiz" data-mode="Practice">Start practice ${icon("i-arrow")}</button></div>
      <div class="card mode-card mint hover reveal"><span class="ico">${icon("i-trophy")}</span><h3>Assessment</h3>
        <p>A scored test. Answers stay hidden until the end, then you get a full question-by-question review.</p>
        <button type="button" class="btn" data-action="start-quiz" data-mode="Assessment">Start assessment ${icon("i-arrow")}</button></div>
    </section>
    <div class="section-title mt-l"><h2>Topic map</h2><span class="muted small">${D.QUESTION_BANK.length} questions</span></div>
    <section class="grid g-3">${Object.entries(D.TOPICS).map(([t, d]) => {
      const m = S.learning.mastery[t];
      return `<div class="card hover reveal"><div class="label-sm" style="color:var(--gold)">${esc(t)}</div><p class="muted small" style="margin:6px 0 10px">${esc(d)}</p>
        <div class="bar-track"><i data-w="${m || 0}" style="--c:var(--gold)"></i></div><div class="hint" style="margin-top:6px">${m == null ? "Not attempted" : `Mastery ${Math.round(m)}%`}</div></div>`;
    }).join("")}</section>`;
  }
  function learnLessons() {
    return D.LESSONS.map((l) => {
      const done = S.learning.completed.includes(l.id);
      const pick = ui.lessonPick[l.id];
      return `<details class="lesson reveal ${done ? "done" : ""}" data-lesson="${l.id}">
        <summary><span class="state">${icon("i-check")}</span><span>${esc(l.title)}<div class="muted small" style="font-weight:500">${esc(l.topic)} · ${l.minutes} min · ${l.level}</div></span>${icon("i-chev", "i chev")}</summary>
        <div class="body">
          ${l.sections.map(([h, b]) => `<div class="step"><b>${esc(h)}</b><span class="muted">${esc(b)}</span></div>`).join("")}
          <div class="feedback mt"><h4>${icon("i-bulb")}Knowledge check</h4><p>${esc(l.check)}</p>
            <ul class="choices">${l.options.map((o, i) => {
              const state = pick == null ? "" : i === l.answer && pick === l.answer ? "right" : i === pick ? "wrong" : "";
              return `<li><button type="button" class="choice ${state}" data-action="lesson-answer" data-lesson="${l.id}" data-i="${i}" ${pick === l.answer ? "disabled" : ""}><span class="k">${String.fromCharCode(65 + i)}</span>${esc(o)}</button></li>`;
            }).join("")}</ul>
            ${pick != null ? (pick === l.answer ? `<p class="mt" style="color:var(--mint);font-weight:700">${done ? "Correct. Lesson complete." : ""}</p>` : `<p class="mt" style="color:var(--coral);font-weight:700">Not quite. Re-read the steps above and try again.</p>`) : ""}
          </div>
        </div></details>`;
    }).join("");
  }
  function learnScenarios() {
    const sc = D.SCENARIOS[ui.scenario];
    const pick = ui.scenarioPick;
    return `<div class="seg reveal" role="group" aria-label="Scenario">${D.SCENARIOS.map((s, i) => `<button type="button" data-action="scenario" data-i="${i}" aria-pressed="${ui.scenario === i}">${esc(s.title)}</button>`).join("")}</div>
    <div class="card mt reveal quiz" style="margin-left:0">
      <div class="eyebrow">Simulated case · no real money</div>
      <div class="q-text">${esc(sc.brief)}</div>
      <p style="font-weight:700;margin:0 0 12px">${esc(sc.question)}</p>
      <ul class="choices">${sc.choices.map((c, i) => {
        const state = pick == null ? "" : i === sc.answer ? "right" : i === pick ? "wrong" : "";
        return `<li><button type="button" class="choice ${state}" data-action="scenario-answer" data-i="${i}" ${pick != null ? "disabled" : ""}><span class="k">${String.fromCharCode(65 + i)}</span>${esc(c)}</button></li>`;
      }).join("")}</ul>
      ${pick != null ? `<div class="feedback ${pick === sc.answer ? "ok" : "no"}"><h4>${icon(pick === sc.answer ? "i-check" : "i-x")}${pick === sc.answer ? "Strong decision. +15 XP" : "Review the reasoning"}</h4><p>${esc(sc.explain)}</p></div>
        <button type="button" class="btn mt" data-action="scenario" data-i="${(ui.scenario + 1) % D.SCENARIOS.length}">Next scenario ${icon("i-arrow")}</button>` : ""}
    </div>`;
  }
  function learnProgress() {
    const L = S.learning;
    const mastery = Object.entries(L.mastery).sort((a, b) => b[1] - a[1]);
    const hist = L.history.slice(-8).reverse();
    return `<section class="grid g-2">
      <div class="card reveal"><div class="section-title"><h2>Topic mastery</h2></div>
        ${mastery.length ? `<div class="mastery">${mastery.map(([t, v]) => `<div class="row"><span>${esc(t)}</span><span class="num" style="text-align:right">${Math.round(v)}%</span><div class="bar-track"><i data-w="${v}" style="--c:${v >= 70 ? "var(--mint)" : v >= 40 ? "var(--gold)" : "var(--coral)"}"></i></div></div>`).join("")}</div>` : empty("No sessions yet", "Finish a challenge to start tracking mastery.")}
      </div>
      <div class="card reveal"><div class="section-title"><h2>Recent sessions</h2></div>
        ${hist.length ? `<ul class="tx-list">${hist.map((h) => `<li class="tx" style="--c:${h.percent >= 80 ? "var(--mint)" : h.percent >= 60 ? "var(--gold)" : "var(--coral)"}"><span class="cat-ico">${icon(h.mode === "Adaptive" ? "i-brain" : h.mode === "Assessment" ? "i-trophy" : "i-zap")}</span><div><div class="title">${esc(h.topic)}</div><div class="meta">${esc(h.mode)} · ${fmtDate(h.date)}</div></div><div class="amt">${h.correct}/${h.total}</div></li>`).join("")}</ul>` : empty("Nothing here yet", "Your sessions will show up here.")}
      </div>
    </section>
    <div class="section-title mt-l"><h2>Achievements</h2><span class="muted small">${L.badges.length} of ${Object.keys(D.BADGES).length}</span></div>
    <div class="badges">${Object.entries(D.BADGES).map(([id, b]) => `<div class="badge reveal ${L.badges.includes(id) ? "got" : ""}"><span class="medal">${icon("i-trophy")}</span><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join("")}</div>`;
  }

  function weightedSample(items, weightFn, n) {
    const pool = items.slice(), out = [];
    while (out.length < n && pool.length) {
      const ws = pool.map(weightFn), tot = sum(ws);
      let r = Math.random() * tot, i = 0;
      while (r > ws[i]) { r -= ws[i]; i++; }
      out.push(pool.splice(Math.min(i, pool.length - 1), 1)[0]);
    }
    return out;
  }
  function startQuiz(mode) {
    const cfg = Object.fromEntries(new FormData($("[data-form='quiz-config']")));
    const count = +cfg.count || 8;
    let pool = D.QUESTION_BANK.slice();
    let topic = cfg.topic;
    if (mode === "Adaptive") {
      topic = "Adaptive mix";
      const missed = new Set(S.learning.missed);
      const w = (q) => {
        const m = S.learning.mastery[q.topic];
        return (m == null ? 70 : 100 - m + 10) * (missed.has(q.id) ? 3 : 1);
      };
      pool = weightedSample(pool, w, count);
    } else {
      if (cfg.topic !== "All topics") pool = pool.filter((q) => q.topic === cfg.topic);
      if (cfg.difficulty !== "Mixed") pool = pool.filter((q) => q.level === cfg.difficulty);
      if (!pool.length) { toast("No questions match that combination, so here's a mixed set.", { icon: "i-alert" }); pool = D.QUESTION_BANK.slice(); }
      pool = pool.sort(() => Math.random() - 0.5).slice(0, count);
    }
    ui.quiz = { mode, topic, qs: pool, i: 0, answers: [], locked: false, done: false, pick: null };
    render({ soft: false });
    window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
  }
  function quizView() {
    const Q = ui.quiz;
    if (Q.done) return quizResults();
    const q = Q.qs[Q.i];
    const instant = Q.mode !== "Assessment";
    const ans = Q.answers[Q.i];
    return `<div class="card quiz reveal" id="quizCard">
      <div class="section-title"><div class="eyebrow">${esc(Q.mode)} · ${esc(Q.topic)}</div><button type="button" class="link-btn" data-action="quit-quiz">${icon("i-x")}Quit</button></div>
      <div class="muted small">Question ${Q.i + 1} of ${Q.qs.length} · ${esc(q.topic)} · ${esc(q.level)}</div>
      <div class="progress"><i style="width:${((Q.i + (Q.locked ? 1 : 0)) / Q.qs.length) * 100}%"></i></div>
      <div class="q-text">${esc(q.q)}</div>
      <ul class="choices">${q.choices.map((c, i) => {
        let cls = "";
        if (instant && Q.locked) cls = i === q.answer ? "right" : i === ans ? "wrong" : "";
        return `<li><button type="button" class="choice ${cls}" data-action="quiz-pick" data-i="${i}" aria-pressed="${Q.pick === i}" ${Q.locked ? "disabled" : ""}><span class="k">${String.fromCharCode(65 + i)}</span>${esc(c)}</button></li>`;
      }).join("")}</ul>
      ${instant && Q.locked ? `<div class="feedback ${ans === q.answer ? "ok" : "no"}"><h4>${icon(ans === q.answer ? "i-check" : "i-x")}${ans === q.answer ? "Correct, +10 XP" : "Not quite"}</h4><p>${esc(q.why)}</p><small>Takeaway: ${esc(q.takeaway)}</small></div>` : ""}
      <div class="row mt" style="display:flex;gap:10px;justify-content:flex-end">
        ${instant
          ? (Q.locked ? `<button type="button" class="btn primary" data-action="quiz-next">${Q.i === Q.qs.length - 1 ? "See results" : "Next question"} ${icon("i-arrow")}</button>`
                      : `<button type="button" class="btn primary" data-action="quiz-lock" ${Q.pick == null ? "disabled" : ""}>Check answer ${icon("i-check")}</button>`)
          : `<button type="button" class="btn primary" data-action="quiz-lock" ${Q.pick == null ? "disabled" : ""}>${Q.i === Q.qs.length - 1 ? "Finish" : "Lock answer"} ${icon("i-arrow")}</button>`}
      </div></div>`;
  }
  function quizResults() {
    const Q = ui.quiz;
    const correct = Q.qs.filter((q, i) => Q.answers[i] === q.answer).length;
    const pct = Math.round((correct / Q.qs.length) * 100);
    const xp = correct * 10 + (pct === 100 ? 20 : 0);
    const msg = pct >= 90 ? "Excellent command of the material." : pct >= 70 ? "Good progress. Review what you missed, then try a new set." : "A solid starting point. Use the explanations below as a study guide.";
    return `<div class="card quiz reveal">
      <div class="eyebrow">Session report · ${esc(Q.mode)}</div>
      <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin:14px 0">
        ${ring(pct / 100, pct >= 80 ? "var(--mint)" : pct >= 60 ? "var(--gold)" : "var(--coral)")}
        <div><div class="q-text" style="margin:0">${correct} of ${Q.qs.length} correct</div><div class="muted">${msg}</div></div>
        <div style="margin-left:auto;text-align:right"><div class="label-sm">XP earned</div><div class="kpi"><div class="value" style="margin:0;color:var(--gold)">+<span data-count="${xp}" data-fmt="int">${xp}</span></div></div></div>
      </div>
      <h3 class="mt">Question review</h3>
      ${Q.qs.map((q, i) => {
        const ok = Q.answers[i] === q.answer;
        return `<details class="lesson ${ok ? "done" : ""}" ${ok ? "" : "open"}><summary><span class="state" style="${ok ? "" : "border-color:var(--coral);color:var(--coral)"}">${icon(ok ? "i-check" : "i-x")}</span><span>${i + 1}. ${esc(q.q)}</span>${icon("i-chev", "i chev")}</summary>
          <div class="body"><p><b>Your answer:</b> ${esc(q.choices[Q.answers[i]] ?? "Not answered")}</p><p><b>Correct answer:</b> ${esc(q.choices[q.answer])}</p><p class="muted">${esc(q.why)}</p><p style="color:var(--gold);font-weight:700;margin:0">${esc(q.takeaway)}</p></div></details>`;
      }).join("")}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button type="button" class="btn primary" data-action="start-again">${icon("i-rotate")}New session</button><button type="button" class="btn" data-action="quit-quiz">Back to the lab</button></div>
    </div>`;
  }
  function finishQuiz() {
    const Q = ui.quiz, L = S.learning;
    const correct = Q.qs.filter((q, i) => Q.answers[i] === q.answer).length;
    const pct = Math.round((correct / Q.qs.length) * 100);
    // Per-topic mastery: exponential moving average of each topic's score in this session.
    const byTopic = {};
    Q.qs.forEach((q, i) => { (byTopic[q.topic] ||= [0, 0]); byTopic[q.topic][1]++; if (Q.answers[i] === q.answer) byTopic[q.topic][0]++; });
    for (const [t, [c, n]] of Object.entries(byTopic)) {
      const score = (c / n) * 100;
      const prior = L.mastery[t];
      L.mastery[t] = Math.round((prior == null ? score : prior * 0.65 + score * 0.35) * 10) / 10;
    }
    const missed = new Set(L.missed);
    Q.qs.forEach((q, i) => (Q.answers[i] === q.answer ? missed.delete(q.id) : missed.add(q.id)));
    L.missed = [...missed];
    L.history.push({ date: todayISO(), topic: Q.topic, mode: Q.mode, correct, total: Q.qs.length, percent: pct });
    L.history = L.history.slice(-60);
    L.best[Q.topic] = Math.max(pct, L.best[Q.topic] || 0);
    addXP(correct * 10 + (pct === 100 ? 20 : 0));
    if (pct >= 80) award("sharp-mind");
    if (pct === 100) award("perfect");
    if (L.history.length >= 5) award("consistent-learner");
    save("learning");
    Q.done = true;
    if (pct >= 80) confetti();
  }

  /* ---------- Demo card ---------- */
  function pageCard() {
    const cardTx = S.tx.filter((t) => t.card === D.DEMO_CARD_CODE).sort((a, b) => b.date.localeCompare(a.date));
    const spent = sum(cardTx.filter((t) => t.type === "Expense").map((t) => t.amount));
    return `
    ${pageHead("Simulated payment experience", "My demo card", "A visual prototype for tagging purchases by hand. It is not a payment card and cannot connect to a card network.")}
    <section class="grid g-main">
      <div class="card reveal">
        <div class="card-stage">
          <div class="demo-card" id="demoCard" role="button" tabindex="0" aria-label="Demo card. Press to flip.">
            <div class="face front"><span class="shine"></span>
              <div class="row"><span class="brand-mark">Centsible</span><span class="pill gold" style="background:rgba(245,184,61,.18)">Demo</span></div>
              <div><span class="chip-ico" style="display:block;margin-bottom:16px"></span><small>Demo identifier</small><div class="code">CENTSIBLE-0001</div></div>
              <div class="row"><div><small>Cardholder</small><b>${esc((S.settings.name || "Demo user").toUpperCase())}</b></div><div style="text-align:right"><small>Status</small><b>SIMULATED</b></div></div>
            </div>
            <div class="face back"><span class="shine"></span><div class="stripe"></div>
              <p style="margin:0;font-size:.85rem;opacity:.85">This identifier is a teaching prop. It cannot pay at stores, authorize payments, or read purchases. Tag purchases by hand on this page.</p>
            </div>
          </div>
        </div>
        <p class="hint" style="text-align:center">${icon("i-rotate")} Move your pointer over the card, or press it to flip.</p>
        <div class="grid g-2 mt">${kpi("Demo-card spending", spent, "var(--gold)", "All time", "")}<div class="card kpi reveal" style="--c:var(--sky)"><div class="label"><span class="dot"></span>Tagged purchases</div><div class="value" data-count="${cardTx.length}" data-fmt="int">${cardTx.length}</div><div class="note">Logged with the demo code</div></div></div>
      </div>
      <div class="card reveal" style="align-self:start">
        <div class="section-title"><h2>Record a purchase</h2></div>
        <form data-form="card" class="grid" style="gap:12px" novalidate>
          <div class="field"><label for="cDesc">Merchant or purchase</label><input class="input" id="cDesc" name="desc" placeholder="e.g. Bookstore" maxlength="80" autocomplete="off"></div>
          <div class="hint" id="cSuggest">${icon("i-spark")} The AI will categorize this for you.</div>
          <div class="field"><label for="cAmt">Amount ($)</label><input class="input num" id="cAmt" name="amount" type="number" min="0.01" step="0.01" value="12"></div>
          <div class="field"><label for="cDate">Date</label><input class="input" id="cDate" name="date" type="date" value="${todayISO()}"></div>
          <div class="field"><label for="cCode">Demo code</label><input class="input num" id="cCode" name="code" placeholder="${D.DEMO_CARD_CODE}" autocomplete="off"></div>
          <p class="error" id="cardErr"></p>
          <button class="btn primary" type="submit">${icon("i-card")}Record demo purchase</button>
        </form>
      </div>
    </section>
    <section class="card mt-l reveal"><div class="section-title"><h2>Demo-card activity</h2></div>
      ${cardTx.length ? `<ul class="tx-list">${cardTx.map((t) => txRow(t)).join("")}</ul>` : empty("No tagged purchases yet", "Record one above.")}</section>`;
  }

  /* ---------- Settings ---------- */
  function pageSettings() {
    const c = getCV();
    return `
    ${pageHead("Control center", "Settings & data", "Your data lives only in this browser. Export it any time, or reset to start fresh.")}
    <section class="grid g-2">
      <div class="card reveal">
        <div class="section-title"><h2>Preferences</h2></div>
        <form data-form="settings" class="grid" style="gap:12px">
          <div class="field"><label for="sName">Display name</label><input class="input" id="sName" name="name" maxlength="24" value="${esc(S.settings.name)}" placeholder="Optional"></div>
          <div class="field"><span class="label-sm" id="themeLbl">Theme</span><div class="seg" role="group" aria-labelledby="themeLbl">${["dark", "light"].map((t) => `<button type="button" data-action="set-theme" data-v="${t}" aria-pressed="${S.settings.theme === t}">${t === "dark" ? "Dark" : "Light"}</button>`).join("")}</div></div>
          <button class="btn primary" type="submit">${icon("i-check")}Save preferences</button>
        </form>
      </div>
      <div class="card reveal">
        <div class="section-title"><h2>Connect Centy to Gemini</h2><span class="pill ${geminiReady() ? "mint" : "gold"}">${geminiReady() ? "Connected" : "Offline mode"}</span></div>
        <form data-form="ai" class="grid" style="gap:12px" autocomplete="off">
          <div class="field"><label for="aiKey">Gemini API key</label><input class="input num" id="aiKey" name="key" type="password" placeholder="${AI.key ? "Saved. Paste a new key to replace it" : usingSharedKey() ? "Using the site's shared key. Paste your own to override it" : "Paste your key from Google AI Studio"}" autocomplete="off" spellcheck="false"></div>
          <div class="field"><label for="aiModel">Model</label><input class="input num" id="aiModel" name="model" value="${esc(AI.model)}" list="modelList" spellcheck="false">
            <datalist id="modelList"><option value="gemini-flash-latest"><option value="gemini-flash-lite-latest"><option value="gemini-2.5-flash"></datalist></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn primary" type="submit">${icon("i-key")}Save</button>
            <button class="btn" type="button" data-action="ai-test" ${geminiReady() ? "" : "disabled"}>${icon("i-zap")}Test connection</button>
            ${AI.key ? `<button class="btn ghost danger" type="button" data-action="ai-forget">${icon("i-trash")}Remove my key</button>` : ""}
          </div>
          <p class="hint" id="aiStatus" style="margin:0">Get a free key at aistudio.google.com. It's stored only in this browser and sent only to Google's Gemini API. Never put your key in the code or on GitHub.</p>
        </form>
      </div>
    </section>

    <section class="grid g-2 mt">
      <div class="card reveal">
        <div class="section-title"><h2>Centy's test results</h2><span class="ai-badge">${icon("i-trophy")}Evaluation</span></div>
        <div id="evalBox">${evalHTML()}</div>
        <button type="button" class="btn sm mt" data-action="eval-centy" ${geminiReady() && !ui.evalRunning ? "" : "disabled"}>${icon("i-zap")}Run evaluation on ${D.QUESTION_BANK.length} questions</button>
      </div>
      <div class="card reveal">
        <div class="section-title"><h2>Categorizer test results</h2><span class="ai-badge">${icon("i-brain")}On-device</span></div>
        <dl class="kv">
          <dt>Model</dt><dd>Multinomial Naive Bayes</dd>
          <dt>Held-out accuracy</dt><dd>${(c.accuracy * 100).toFixed(1)}%</dd>
          <dt>Baseline (most common)</dt><dd>${(c.baseline * 100).toFixed(1)}%</dd>
          <dt>When ≥60% confident</dt><dd>${(c.confidentAccuracy * 100).toFixed(1)}% on ${Math.round(c.confidentShare * 100)}% of items</dd>
          <dt>Test method</dt><dd>${c.k}-fold CV, ${c.n} examples</dd>
          <dt>Learned from you</dt><dd>${S.userExamples.length} examples</dd>
        </dl>
        <p class="label-sm mt">Where it fails</p>
        <ul class="muted small" style="margin:0;padding-left:18px">${c.failures.filter((f) => f.confidence >= 0.5).slice(0, 4).map((f) => `<li>“${esc(f.text)}”: guessed ${esc(f.predicted)} (${Math.round(f.confidence * 100)}%), really ${esc(f.truth)}</li>`).join("")}</ul>
        <button type="button" class="btn sm mt" data-action="reset-ai">${icon("i-rotate")}Forget what the AI learned from me</button>
      </div>
    </section>
    <section class="grid g-2 mt">
      <div class="card reveal">
        <div class="section-title"><h2>Your data</h2></div>
        <div class="grid g-2" style="gap:10px">
          <button type="button" class="btn" data-action="export-csv">${icon("i-download")}Transactions CSV</button>
          <button type="button" class="btn" data-action="export-json">${icon("i-download")}Full backup JSON</button>
        </div>
        <div class="feedback mt" style="border-color:color-mix(in srgb,var(--coral) 40%,var(--line))">
          <h4>${icon("i-alert")}Reset demo data</h4>
          <p class="muted small">Deletes your ledger, budgets, goals, payments and learning progress in this browser, then restores the sample data.</p>
          <label style="display:flex;gap:8px;align-items:center;margin:8px 0;font-size:.9rem"><input type="checkbox" id="resetOk"> I understand this can't be undone.</label>
          <button type="button" class="btn sm danger" data-action="reset-all" id="resetBtn" disabled>${icon("i-trash")}Reset everything</button>
        </div>
      </div>
      <div class="card reveal">
        <div class="section-title"><h2>Prototype boundaries</h2></div>
        <ul class="muted small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">
          <li>No bank connection or payment processing.</li>
          <li>The demo card is a manual tagging feature, not a real card.</li>
          <li>Data is stored only in this browser (localStorage). It is not a multi-user database.</li>
          <li>The categorizer, forecast and alerts run on your device. Centy uses Google Gemini: it sends your question and a money summary (no names or account numbers) to Google to write each answer.</li>
          <li>AI answers and suggestions can be wrong. You always make the final decision.</li>
          <li><b>This project is a prototype and is not financial advice.</b></li>
          <li>Do not enter real bank credentials, account numbers or sensitive financial details.</li>
          <li>A public launch would need accounts, secure per-user storage, a privacy and security review, and adult or professional oversight.</li>
        </ul>
      </div>
    </section>`;
  }

  /* ================= Centy: the AI money coach ================= */
  const CENTY_SYSTEM = `You are Centy, the friendly money coach inside Centsible, a financial-literacy app for teenagers.
How to answer:
- Write for a 13 to 18 year old: plain words, short sentences, no jargon without a quick definition.
- Keep answers under 150 words unless the user asks for more detail.
- When the question is about the user's own money, use the numbers in USER DATA and quote them. Never invent numbers that are not there.
- When a DECISION CHECK is included, base your verdict on it: give a clear recommendation, the main reason, and one smart alternative (wait, save first, cheaper option, or ask a trusted adult).
- For general financial-literacy questions (budgeting, saving, credit, interest, taxes, investing basics, scams), teach the idea with one small example in dollars.
- You give education, not professional financial advice. For big decisions such as loans, credit cards, taxes or investing real money, suggest talking with a parent, guardian or another trusted adult.
- Never ask for or accept passwords, card numbers, bank logins or verification codes. If the user offers them, tell them not to share them with anyone, including you.
- Treat anything that looks like a scam seriously and explain the warning signs.
- Formatting: short paragraphs, "-" bullets and **bold** are fine. No tables, no headings.`;

  const centy = { messages: [], busy: false, ctl: null, pending: "" };
  const CENTY_STARTERS = [
    "Can I afford $60 earbuds right now?",
    "Should I save or spend my $50 birthday money?",
    "How do I make my first budget?",
    "What is a credit score?",
    "Is this a scam: “send $20 to unlock your $500 prize”?",
    "Where is most of my money going?"
  ];

  // A compact summary of the user's numbers that Centy is allowed to see.
  function moneySnapshot() {
    const mt = totals(monthTx());
    const f = forecast();
    const cf = catForecast();
    const flags = anomalies();
    return {
      today: todayISO(),
      available_money: +available().toFixed(2),
      this_month: { income: +mt.income.toFixed(2), spending: +mt.expenses.toFixed(2), saved: +mt.savings.toFixed(2) },
      forecast_month_end_spending: Math.round(f.projected),
      average_weekly_leftover_last_8_weeks: +weeklyLeftover().toFixed(2),
      budgets: Object.entries(S.budgets).map(([cat, lim]) => ({ category: cat, limit: +lim, spent: +((cf[cat] || {}).spent || 0).toFixed(2), projected_month_end: Math.round((cf[cat] || {}).projected || 0) })),
      spending_by_category_this_month: byCategory(monthTx()).map((c) => ({ category: c.cat, amount: +c.amt.toFixed(2) })),
      savings_goals: S.goals.map((g) => ({ name: g.name, target: g.target, saved: g.saved, deadline: g.deadline })),
      wishlist: S.wishlist.map((w) => ({ item: w.name, price: w.price, check: affordCheck(w.price, w.name).label })),
      bills_due_next_14_days: S.payments.filter((p) => !p.paid && daysUntil(p.due) <= 14).map((p) => ({ name: p.name, amount: p.amount, due: p.due })),
      unusual_purchases: S.tx.filter((t) => flags[t.id]).slice(-3).map((t) => ({ item: t.description, amount: t.amount, times_usual: +flags[t.id].ratio.toFixed(1) })),
      weakest_quiz_topics: Object.entries(S.learning.mastery).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([t, m]) => `${t} (${Math.round(m)}%)`)
    };
  }

  async function geminiGenerate({ system, contents, temperature = 0.4, maxOutputTokens = 2048, signal }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(AI.model.trim() || DEFAULT_MODEL)}:generateContent`;
    const body = { contents, generationConfig: { temperature, maxOutputTokens } };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    let res;
    try {
      res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": activeKey() }, body: JSON.stringify(body), signal });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw Object.assign(new Error("Couldn't reach Gemini. Check your internet connection."), { code: "network" });
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (json.error && json.error.message) || `HTTP ${res.status}`;
      const code = res.status === 429 ? "rate" : res.status === 404 ? "model" : res.status === 400 || res.status === 403 ? "key" : "api";
      throw Object.assign(new Error(msg), { code, status: res.status });
    }
    const cand = (json.candidates || [])[0];
    const text = cand && cand.content && (cand.content.parts || []).map((p) => p.text || "").join("").trim();
    if (!text) {
      const why = (json.promptFeedback && json.promptFeedback.blockReason) || (cand && cand.finishReason) || "empty reply";
      throw Object.assign(new Error(`Gemini returned no text (${why}).`), { code: "empty" });
    }
    return text;
  }

  function friendlyError(e) {
    if (e.code === "rate") return "Gemini's free tier is busy or your quota ran out. Wait a minute and try again.";
    if (e.code === "model") return `Gemini doesn't recognise the model “${AI.model}”. Open Settings and enter a current model name from Google AI Studio.`;
    if (e.code === "key") return `Gemini rejected the request: ${e.message} Check your API key in Settings.`;
    return e.message || "Something went wrong talking to Gemini.";
  }

  /* Offline mode: answers from the app's own data and lessons when no key is connected. */
  function offlineAnswer(q) {
    const text = q.toLowerCase();
    const price = parseAmount(q);
    if (price != null && /afford|\bbuy\b|purchase|worth it|should i get/.test(text)) {
      const item = q.replace(/\$?\s*\d+(\.\d+)?/g, " ").replace(/can i|afford|should i|buy|right now|get|a |an |the |\?/gi, " ").trim();
      return decisionText(affordCheck(price, item), item);
    }
    if (/where.*(money|spend)|biggest|most.*spend|spending/.test(text)) {
      const cats = byCategory(monthTx());
      if (!cats.length) return "You haven't logged any spending this month yet. Add a few purchases on the Activity page and I'll break it down.";
      const tot = sum(cats.map((c) => c.amt));
      return `This month you've spent **${money(tot)}**. Your biggest categories:\n${cats.slice(0, 3).map((c) => `- **${c.cat}**: ${money(c.amt)} (${Math.round((c.amt / tot) * 100)}%)`).join("\n")}\nAt your current pace you'll spend about **${money(forecast().projected, 0)}** by the end of the month.`;
    }
    if (/budget/.test(text) && /my|over|left|how am i/.test(text)) {
      const cf = catForecast();
      const rows = Object.entries(S.budgets).map(([c, l]) => ({ c, l: +l, ...(cf[c] || { spent: 0, projected: 0 }) }));
      const over = rows.filter((r) => r.projected > r.l);
      return over.length ? `Heads up: ${over.map((r) => `**${r.c}** (spent ${money(r.spent)} of ${money(r.l, 0)}, heading for ${money(r.projected, 0)})`).join(", ")} ${over.length === 1 ? "is" : "are"} on track to go over budget. Try pausing extras in that category for a week.` : "Every budget category is on track at your current pace. Nice work.";
    }
    if (/goal/.test(text) && /my|how|close/.test(text)) {
      if (!S.goals.length) return "You don't have any savings goals yet. Create one on the Goals page and I'll track your pace.";
      return S.goals.map((g) => `- **${g.name}**: ${money(g.saved, 0)} of ${money(g.target, 0)} (${Math.round((g.saved / g.target) * 100)}%)`).join("\n");
    }
    // Glossary terms first: longest matching phrase wins ("compound interest" beats "interest").
    let gloss = null, glossLen = 0;
    for (const [terms, def] of D.GLOSSARY) {
      for (const t of terms) if (new RegExp(`\\b${t.replace(/[/]/g, "\\/")}\\b`, "i").test(q) && t.length > glossLen) { gloss = def; glossLen = t.length; }
    }
    if (gloss) return gloss;
    // Otherwise find the closest explanation in the lessons and question bank.
    const words = new Set(ML.tokenize(q).filter((f) => f.startsWith("w:")).map((f) => f.slice(2)).filter((w) => w.length > 2));
    const docs = [
      ...D.QUESTION_BANK.map((x) => ({ title: x.topic, text: `${x.q} ${x.why}`, answer: `${x.why}\n\n**Key idea:** ${x.takeaway}` })),
      ...D.LESSONS.flatMap((l) => l.sections.map(([h, b]) => ({ title: l.title, text: `${l.title} ${h} ${b}`, answer: `**${h}.** ${b}` })))
    ];
    let best = null, bestScore = 0;
    for (const d of docs) {
      const dw = new Set(ML.tokenize(d.text).filter((f) => f.startsWith("w:")).map((f) => f.slice(2)));
      let s = 0; words.forEach((w) => { if (dw.has(w)) s++; });
      if (s > bestScore) { bestScore = s; best = d; }
    }
    if (best && bestScore >= 1) return `${best.answer}\n\nWant to practise this? Try a session in the **Learn** tab (topic: ${best.title}).`;
    return "I can check whether you can afford something (try “Can I afford $40 shoes?”), show where your money goes, or explain money ideas like budgeting, saving, credit and scams. Connect a Gemini key in Settings and I can answer almost any money question.";
  }
  function decisionText(d, item) {
    return `**${d.label}**${item ? ` for ${item}` : ""} at ${money(d.price)}.\n${d.lines.map((l) => `- ${l}`).join("\n")}\n${d.kind === "warn" ? "A smart move: add it to your wishlist and save toward it first." : d.kind === "tip" ? "It works, but it leaves little cushion for surprises. Waiting a week or two is the safer choice." : "This fits comfortably. Enjoy it, and keep your savings transfer going."}`;
  }

  function md(s) {
    const lines = esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n/);
    let html = "", list = false;
    for (const raw of lines) {
      const l = raw.trim();
      const m = l.match(/^(?:[-*•]|\d+\.)\s+(.*)/);
      if (m) { if (!list) { html += "<ul>"; list = true; } html += `<li>${m[1]}</li>`; continue; }
      if (list) { html += "</ul>"; list = false; }
      if (l) html += `<p>${l}</p>`;
    }
    if (list) html += "</ul>";
    return html;
  }

  async function sendToCenty(question) {
    const q = question.trim();
    if (!q || centy.busy) return;
    centy.messages.push({ role: "user", text: q });
    centy.busy = true;
    paintChat();
    const price = parseAmount(q);
    const check = price != null && /afford|\bbuy\b|purchase|worth it|should i get/i.test(q) ? affordCheck(price, q) : null;
    try {
      let reply, source;
      if (geminiReady()) {
        centy.ctl = new AbortController();
        const system = `${CENTY_SYSTEM}\n\nUSER DATA (JSON):\n${JSON.stringify(moneySnapshot())}${check ? `\n\nDECISION CHECK for the latest question (computed by Centsible's rules):\n${check.label}. ${check.lines.join(" ")}` : ""}`;
        // Leave out failed exchanges (an error reply and the question that caused it).
        const clean = centy.messages.filter((m, i, arr) => !m.err && !(m.role === "user" && arr[i + 1] && arr[i + 1].err));
        const contents = clean.slice(-12).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));
        reply = await geminiGenerate({ system, contents, signal: centy.ctl.signal });
        source = `Gemini · ${AI.model}${check ? " · decision check" : ""}`;
      } else {
        await new Promise((r) => setTimeout(r, reduced() ? 0 : 500));
        reply = offlineAnswer(q);
        source = "Offline mode · Centsible rules";
      }
      centy.messages.push({ role: "model", text: reply, source });
      addXP(2);
    } catch (e) {
      if (e.name === "AbortError") centy.messages.push({ role: "model", text: "Stopped.", source: "", err: true });
      else {
        centy.messages.push({ role: "model", text: `${friendlyError(e)}\n\nHere's what I can tell you offline:\n\n${offlineAnswer(q)}`, source: "Offline fallback", err: true });
      }
    } finally {
      centy.busy = false; centy.ctl = null;
      paintChat();
    }
  }

  function chatHTML() {
    const hello = `Hi! I'm **Centy**, your money coach. Ask me whether you can afford something, how your budget is doing, or anything about money: budgeting, saving, credit, taxes, scams. ${geminiReady() ? "" : "\n\nI'm in **offline mode** right now. Add a free Gemini API key in Settings to unlock full answers."}`;
    const msgs = [{ role: "model", text: hello, source: "" }, ...centy.messages];
    return msgs.map((m, i) => `<div class="msg ${m.role === "user" ? "user" : "bot"} ${m.err ? "err" : ""}" ${i < msgs.length - 2 ? `style="animation:none"` : ""}>
        ${m.role === "user" ? "" : `<span class="centy-face" aria-hidden="true">C</span>`}
        <div class="bubble">${md(m.text)}${m.source ? `<span class="src">${esc(m.source)}</span>` : ""}</div></div>`).join("")
      + (centy.busy ? `<div class="msg bot"><span class="centy-face" aria-hidden="true">C</span><div class="bubble"><span class="dots" aria-label="Centy is thinking"><i></i><i></i><i></i></span></div></div>` : "");
  }
  function paintChat() {
    const log = $("#chatLog");
    if (!log) return;
    log.innerHTML = chatHTML();
    log.scrollTop = log.scrollHeight;
    const send = $("#chatSend");
    if (send) send.innerHTML = centy.busy ? icon("i-stop") + `<span class="sr-only">Stop</span>` : icon("i-send") + `<span class="sr-only">Send</span>`;
  }

  function pageCenty() {
    const d = affordCheck(S.wishlist[0] ? S.wishlist[0].price : 50, S.wishlist[0] ? S.wishlist[0].name : "");
    return `
    ${pageHead("Your AI money coach", "Ask Centy", "Centy answers money questions and helps you decide before you spend. It reads your Centsible numbers, runs a decision check, and explains the result in plain language.",
      `<span class="pill ${geminiReady() ? "mint" : "gold"}">${icon(geminiReady() ? "i-check" : "i-key")}${geminiReady() ? "Gemini connected" : "Offline mode"}</span>`)}
    <section class="centy-layout">
      <div class="card chat reveal">
        <div class="chat-head"><span class="centy-face" aria-hidden="true">C</span><div><h2>Centy</h2><div class="muted small">${geminiReady() ? `Powered by Google Gemini (${esc(AI.model)})` : "Offline mode: answers from your data and Centsible's lessons"}</div></div>
          <button type="button" class="btn sm ghost" data-action="centy-clear" style="margin-left:auto">${icon("i-rotate")}New chat</button></div>
        <div class="chat-log" id="chatLog" aria-live="polite">${chatHTML()}</div>
        <div class="chat-foot">
          <div class="chips">${CENTY_STARTERS.map((s) => `<button type="button" class="chip" data-action="centy-ask" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
          <form class="composer" data-form="centy">
            <label class="sr-only" for="chatInput">Message Centy</label>
            <textarea class="input" id="chatInput" name="q" rows="1" maxlength="600" placeholder="Ask about a purchase, your budget, or any money question…">${esc(centy.pending)}</textarea>
            <button class="btn primary" type="submit" id="chatSend">${icon("i-send")}<span class="sr-only">Send</span></button>
          </form>
          <div class="hint">Centy is a learning tool, not a financial adviser. Never share passwords, card numbers or verification codes.</div>
        </div>
      </div>
      <div class="grid" style="align-content:start">
        <div class="card reveal">
          <div class="section-title"><h2>Decision check</h2><span class="ai-badge">${icon("i-spark")}Live</span></div>
          <form data-form="decide" class="grid" style="gap:10px">
            <div class="field"><label for="dItem">Thinking of buying</label><input class="input" id="dItem" name="item" maxlength="60" value="${esc(S.wishlist[0] ? S.wishlist[0].name : "")}" placeholder="e.g. Hoodie"></div>
            <div class="field"><label for="dPrice">Price ($)</label><input class="input num" id="dPrice" name="price" type="number" min="0.01" step="0.01" value="${S.wishlist[0] ? S.wishlist[0].price : 50}"></div>
            <button class="btn primary" type="submit">${icon("i-chat")}Ask Centy</button>
          </form>
          <div class="decision mt" id="decisionPreview">${decisionCard(d)}</div>
        </div>
        <div class="card reveal">
          <div class="section-title"><h2>What Centy sees</h2></div>
          <dl class="kv">
            <dt>Available money</dt><dd>${money(available())}</dd>
            <dt>Bills next 14 days</dt><dd>${money(billsWithin(14))}</dd>
            <dt>Weekly leftover</dt><dd>${money(weeklyLeftover())}</dd>
            <dt>Month-end forecast</dt><dd>${money(forecast().projected, 0)}</dd>
          </dl>
          <p class="hint" style="margin-bottom:0">When Centy is connected to Gemini, your question and this money summary are sent to Google to write the answer. No names, accounts or card numbers are included.</p>
        </div>
      </div>
    </section>`;
  }
  function decisionCard(d) {
    const pill = d.kind === "good" ? "mint" : d.kind === "tip" ? "gold" : "coral";
    return `<div class="verdict"><span class="pill ${pill}">${esc(d.label)}</span><span class="num">${money(d.price)}</span></div><ul>${d.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
  }

  /* Centy evaluation: the 29-question quiz bank, answered without the answer key. */
  async function evaluateCenty() {
    if (!geminiReady()) { toast("Add a Gemini API key first.", { icon: "i-key" }); return; }
    const box = $("#evalBox");
    const qs = D.QUESTION_BANK;
    const counts = {}; qs.forEach((q) => (counts[q.answer] = (counts[q.answer] || 0) + 1));
    const majorityIdx = +Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const results = [];
    ui.evalRunning = true;
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (box) box.innerHTML = `<div class="muted small">Asking question ${i + 1} of ${qs.length}…</div><div class="bar-track mt"><i style="width:${(i / qs.length) * 100}%"></i></div>`;
      const prompt = `Answer this multiple-choice financial literacy question. Reply with only the single letter of the best answer (A, B, C or D).\n\n${q.q}\n${q.choices.map((c, j) => `${String.fromCharCode(65 + j)}) ${c}`).join("\n")}`;
      let letter = null, tries = 0;
      while (tries < 2) {
        try {
          const out = await geminiGenerate({ contents: [{ role: "user", parts: [{ text: prompt }] }], temperature: 0, maxOutputTokens: 1024 });
          const m = out.toUpperCase().match(/\b([A-D])\b/);
          letter = m ? m[1] : null;
          break;
        } catch (e) {
          tries++;
          if (e.code === "rate" && tries < 2) { if (box) box.innerHTML = `<div class="muted small">Rate limited. Waiting 30 seconds…</div>`; await new Promise((r) => setTimeout(r, 30000)); continue; }
          ui.evalRunning = false;
          if (box) box.innerHTML = `<p class="error">${esc(friendlyError(e))}</p>`;
          return;
        }
      }
      results.push({ id: q.id, topic: q.topic, picked: letter, answer: String.fromCharCode(65 + q.answer), correct: letter === String.fromCharCode(65 + q.answer), q: q.q });
      await new Promise((r) => setTimeout(r, 4500)); // stay under free-tier per-minute limits
    }
    const right = results.filter((r) => r.correct).length;
    const evalRes = { date: new Date().toISOString(), model: AI.model, n: qs.length, correct: right,
      majorityLetter: String.fromCharCode(65 + majorityIdx), majorityCorrect: counts[majorityIdx], wrong: results.filter((r) => !r.correct) };
    store.set("centyEval", evalRes);
    ui.evalRunning = false;
    render({ soft: true });
    toast(`Centy scored ${right}/${qs.length}`, { icon: "i-trophy" });
  }
  function evalHTML() {
    const r = store.get("centyEval", null);
    if (!r) return `<p class="muted small" style="margin:0">Not run yet. This sends each of the ${D.QUESTION_BANK.length} quiz questions to Gemini (without the answer) and scores the replies. It takes about 3 minutes on the free tier.</p>`;
    return `<dl class="kv">
      <dt>Centy (${esc(r.model)})</dt><dd>${r.correct}/${r.n} · ${Math.round((r.correct / r.n) * 100)}%</dd>
      <dt>Baseline: always “${esc(r.majorityLetter)}”</dt><dd>${r.majorityCorrect}/${r.n} · ${Math.round((r.majorityCorrect / r.n) * 100)}%</dd>
      <dt>Baseline: random guess</dt><dd>~25%</dd>
      <dt>Run on</dt><dd>${fmtDate(r.date.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}</dd></dl>
      ${r.wrong.length ? `<p class="label-sm mt">Missed</p><ul class="muted small" style="margin:0;padding-left:18px">${r.wrong.map((w) => `<li>${esc(w.q)} (answered ${esc(w.picked || "nothing")}, correct ${esc(w.answer)})</li>`).join("")}</ul>` : `<p class="muted small">No misses.</p>`}`;
  }

  /* ================= router ================= */
  const PAGES = [
    ["overview", "Overview", "i-home", pageOverview],
    ["centy", "Centy", "i-chat", pageCenty],
    ["activity", "Activity", "i-list", pageActivity],
    ["budget", "Budget", "i-pie", pageBudget],
    ["goals", "Goals", "i-target", pageGoals],
    ["payments", "Payments", "i-calendar", pagePayments],
    ["learn", "Learn", "i-book", pageLearn],
    ["card", "Demo card", "i-card", pageCard],
    ["settings", "Settings", "i-settings", pageSettings]
  ];
  let current = "overview";

  function buildNav() {
    const nav = $("#nav");
    nav.insertAdjacentHTML("beforeend", PAGES.map(([id, label, ic]) => `<a href="#${id}" data-page="${id}">${icon(ic)}<span>${label}</span></a>`).join(""));
  }
  function moveIndicator(animate = true) {
    const a = $(`.nav a[data-page="${current}"]`), ind = $("#navIndicator");
    if (!a || !ind) return;
    $$(".nav a").forEach((x) => x.removeAttribute("aria-current"));
    a.setAttribute("aria-current", "page");
    if (!animate) ind.style.transition = "none";
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
    if (!animate) requestAnimationFrame(() => (ind.style.transition = ""));
    a.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced() || !animate ? "auto" : "smooth" });
  }

  function render({ soft = false } = {}) {
    const view = $("#view");
    const page = PAGES.find((p) => p[0] === current) || PAGES[0];
    const scrollY = window.scrollY;
    view.innerHTML = page[3]();
    if (!soft) { view.classList.remove("view"); void view.offsetWidth; view.classList.add("view"); }
    else window.scrollTo(0, scrollY);
    settle(!soft);
    bindPage();
    $("#fab").hidden = current === "centy";
    if (current === "overview") fillCoach();
    if (current === "centy") { const log = $("#chatLog"); if (log) log.scrollTop = log.scrollHeight; }
    document.title = `${page[1]} · Centsible`;
  }
  function go(page) {
    if (!PAGES.some((p) => p[0] === page)) page = "overview";
    if (page !== current) { ui.quiz = null; }
    current = page;
    moveIndicator();
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  window.addEventListener("hashchange", () => go(location.hash.slice(1) || "overview"));

  /* ================= page bindings ================= */
  function bindPage() {
    if (current === "activity") {
      const desc = $("#txDesc");
      let t;
      desc.addEventListener("input", () => { form.desc = desc.value; clearTimeout(t); t = setTimeout(updateSuggest, 120); });
      $("#txCat").addEventListener("change", (e) => { form.cat = e.target.value; form.catTouched = true; updateSuggest(); });
      $("#txMethod").addEventListener("change", (e) => { $("#codeField").hidden = e.target.value !== "Centsible demo card"; });
      $("#txSearch").addEventListener("input", (e) => {
        ui.txSearch = e.target.value;
        clearTimeout(t);
        t = setTimeout(() => { render({ soft: true }); const s = $("#txSearch"); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }, 200);
      });
      $("#csvFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => importCSV(String(reader.result));
        reader.readAsText(file);
      });
      if (form.desc) updateSuggest();
    }
    if (current === "budget") {
      $$("[data-limit]").forEach((inp) => inp.addEventListener("change", () => {
        const v = Math.max(0, parseFloat(inp.value) || 0);
        S.budgets[inp.dataset.limit] = v; save("budgets");
        toast(`${inp.dataset.limit} limit set to ${money(v, 0)}`);
        render({ soft: true });
      }));
    }
    if (current === "card") {
      const card = $("#demoCard");
      const flip = () => card.classList.toggle("flipped");
      card.addEventListener("click", flip);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      if (!reduced()) {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          const base = card.classList.contains("flipped") ? 180 : 0;
          card.style.transition = "transform 80ms linear";
          card.style.transform = `rotateY(${base + (px - 0.5) * 22}deg) rotateX(${(0.5 - py) * 16}deg)`;
          $$(".shine", card).forEach((s) => { s.style.setProperty("--mx", px * 100 + "%"); s.style.setProperty("--my", py * 100 + "%"); });
        });
        card.addEventListener("pointerleave", () => { card.style.transition = ""; card.style.transform = ""; });
      }
      const cd = $("#cDesc");
      cd.addEventListener("input", () => {
        const p = cd.value.trim() ? model.predict(cd.value) : null;
        $("#cSuggest").innerHTML = p && p.label ? `${icon("i-spark")} AI category: <b>${esc(p.label)}</b> <span class="num">${Math.round(p.confidence * 100)}%</span>` : `${icon("i-spark")} The AI will categorize this for you.`;
      });
    }
    if (current === "settings") {
      $("#resetOk").addEventListener("change", (e) => ($("#resetBtn").disabled = !e.target.checked));
    }
    if (current === "centy") {
      const ta = $("#chatInput");
      const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; };
      ta.addEventListener("input", () => { centy.pending = ta.value; grow(); });
      ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ta.form.requestSubmit(); } });
      const dPrice = $("#dPrice"), dItem = $("#dItem");
      const preview = () => { const p = parseFloat(dPrice.value); if (p > 0) $("#decisionPreview").innerHTML = decisionCard(affordCheck(p, dItem.value)); };
      dPrice.addEventListener("input", preview); dItem.addEventListener("input", preview);
      if (centy.autoAsk) { const q = centy.autoAsk; centy.autoAsk = ""; sendToCenty(q); }
    }
    if (current === "goals") {
      const w = $("#calcW"), n = $("#calcN");
      const upd = () => {
        ui.calcWeekly = +w.value; ui.calcWeeks = +n.value;
        const total = ui.calcWeekly * ui.calcWeeks;
        $("#calcWOut").textContent = money(ui.calcWeekly, 0);
        $("#calcNOut").textContent = `${ui.calcWeeks} weeks`;
        $("#calcTotal").textContent = money(total, 0);
        const card = $("#calcCard"); const hint = $(".hint", card); if (hint) hint.textContent = `${money(ui.calcWeekly, 0)} × ${ui.calcWeeks} weeks, before any interest. Real results depend on what you actually save.`;
        const covers = $("#calcCovers");
        if (covers) {
          const targets = [...S.goals.filter((g) => g.saved < g.target).map((g) => ({ name: g.name, need: g.target - g.saved })), ...S.wishlist.map((x) => ({ name: x.name, need: x.price }))].sort((a, b) => a.need - b.need).slice(0, 5);
          covers.innerHTML = coversHTML(total, targets);
        }
      };
      w.addEventListener("input", upd); n.addEventListener("input", upd);
    }
    if (current === "overview") {
      const segs = $$(".donut circle.seg"), items = $$(".legend li");
      const hot = (cat, on) => { segs.concat(items).forEach((el) => el.classList.toggle("hot", on && el.dataset.cat === cat)); };
      segs.concat(items).forEach((el) => { el.addEventListener("pointerenter", () => hot(el.dataset.cat, true)); el.addEventListener("pointerleave", () => hot(null, false)); });
    }
  }

  /* ================= actions ================= */
  const actions = {
    "tx-type": (b) => setType(b.dataset.v),
    "pick-cat": (b) => { form.cat = b.dataset.v; form.catTouched = true; $("#txCat").value = form.cat; updateSuggest(); },
    "tx-filter": (b) => { ui.txFilter = b.dataset.v; render({ soft: true }); },
    "del-tx": (b) => {
      const idx = S.tx.findIndex((t) => t.id === b.dataset.id);
      if (idx < 0) return;
      const [removed] = S.tx.splice(idx, 1);
      save("tx");
      const li = b.closest(".tx");
      const finish = () => render({ soft: true });
      if (li && !reduced()) li.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(40px)" }], { duration: 260, easing: "ease-in" }).onfinish = finish;
      else finish();
      toast(`Deleted “${removed.description}”`, { icon: "i-trash", undo: () => { S.tx.splice(idx, 0, removed); save("tx"); render({ soft: true }); } });
    },
    "load-sample": async () => {
      let text = SAMPLE_CSV;
      try { const r = await fetch("data/sample_transactions.csv"); if (r.ok) text = await r.text(); } catch {}
      importCSV(text);
    },
    "export-csv": () => saveFile("centsible_transactions.csv", toCSV(S.tx), "text/csv"),
    "export-json": () => saveFile("centsible_backup.json", JSON.stringify({ exported: new Date().toISOString(), ...S }, null, 2), "application/json"),
    "del-budget": (b) => {
      const cat = b.dataset.cat, prev = S.budgets[cat];
      delete S.budgets[cat]; save("budgets"); render({ soft: true });
      toast(`Removed the ${cat} budget`, { icon: "i-trash", undo: () => { S.budgets[cat] = prev; save("budgets"); render({ soft: true }); } });
    },
    "del-goal": (b) => {
      const idx = S.goals.findIndex((g) => g.id === b.dataset.id);
      if (idx < 0) return;
      const [g] = S.goals.splice(idx, 1);
      save("goals"); render({ soft: true });
      toast(`Deleted “${g.name}”`, { icon: "i-trash", undo: () => { S.goals.splice(idx, 0, g); save("goals"); render({ soft: true }); } });
    },
    pay: (b) => {
      const p = S.payments.find((x) => x.id === b.dataset.id);
      if (!p) return;
      b.classList.add("done");
      p.paid = true; p.paidDate = todayISO();
      const pred = model.predict(p.name);
      S.tx.push({ id: uid(), date: todayISO(), description: p.name, category: pred.label && pred.confidence >= 0.35 ? pred.label : "Other", amount: p.amount, type: "Expense", method: "Payment", card: "" });
      const next = { Weekly: () => addDays(7, ML.parseDate(p.due)), Monthly: () => addMonths(p.due, 1), Yearly: () => addMonths(p.due, 12) }[p.frequency];
      if (next) S.payments.push({ id: uid(), name: p.name, amount: p.amount, due: next(), frequency: p.frequency, paid: false });
      save("payments", "tx");
      award("on-time");
      toast(`${p.name} paid · logged as ${S.tx[S.tx.length - 1].category}${next ? " · next one scheduled" : ""}`);
      setTimeout(() => render({ soft: true }), reduced() ? 0 : 450);
    },
    "learn-tab": (b) => { ui.learnTab = b.dataset.v; render({ soft: true }); },
    "start-quiz": (b) => startQuiz(b.dataset.mode),
    "start-again": () => { const mode = ui.quiz.mode; ui.quiz = null; ui.learnTab = "challenges"; render({ soft: true }); startQuiz(mode); },
    "quit-quiz": () => { ui.quiz = null; render({ soft: true }); },
    "quiz-pick": (b) => { ui.quiz.pick = +b.dataset.i; render({ soft: true }); },
    "quiz-lock": () => {
      const Q = ui.quiz;
      if (Q.pick == null) return;
      Q.answers[Q.i] = Q.pick;
      if (Q.mode === "Assessment") {
        if (Q.i === Q.qs.length - 1) finishQuiz(); else { Q.i++; Q.pick = null; }
        render({ soft: true });
        return;
      }
      Q.locked = true;
      render({ soft: true });
      const ok = Q.pick === Q.qs[Q.i].answer;
      const card = $("#quizCard");
      if (card && !reduced()) card.classList.add(ok ? "pop" : "shake");
    },
    "quiz-next": () => {
      const Q = ui.quiz;
      if (Q.i === Q.qs.length - 1) finishQuiz(); else { Q.i++; Q.pick = null; Q.locked = false; }
      render({ soft: true });
    },
    "lesson-answer": (b) => {
      const l = D.LESSONS.find((x) => x.id === b.dataset.lesson);
      const i = +b.dataset.i;
      ui.lessonPick[l.id] = i;
      if (i === l.answer && !S.learning.completed.includes(l.id)) {
        S.learning.completed.push(l.id);
        addXP(35);
        if (S.learning.completed.length >= 3) award("scholar");
        toast("Lesson complete · +35 XP", { icon: "i-trophy" });
        confetti(60);
      }
      render({ soft: true });
      const d = $(`details[data-lesson="${l.id}"]`);
      if (d) { d.open = true; if (i !== l.answer && !reduced()) d.classList.add("shake"); }
    },
    scenario: (b) => { ui.scenario = +b.dataset.i; ui.scenarioPick = null; render({ soft: true }); },
    "scenario-answer": (b) => {
      const sc = D.SCENARIOS[ui.scenario];
      ui.scenarioPick = +b.dataset.i;
      if (ui.scenarioPick === sc.answer) addXP(15);
      render({ soft: true });
    },
    "set-theme": (b) => { setTheme(b.dataset.v); render({ soft: true }); },
    "centy-ask": (b) => sendToCenty(b.dataset.q),
    "centy-clear": () => { if (centy.ctl) centy.ctl.abort(); centy.messages = []; centy.pending = ""; render({ soft: true }); },
    "wish-del": (b) => {
      const idx = S.wishlist.findIndex((w) => w.id === b.dataset.id);
      if (idx < 0) return;
      const [w] = S.wishlist.splice(idx, 1);
      save("wishlist"); render({ soft: true });
      toast(`Removed “${w.name}”`, { icon: "i-trash", undo: () => { S.wishlist.splice(idx, 0, w); save("wishlist"); render({ soft: true }); } });
    },
    "wish-ask": (b) => {
      const w = S.wishlist.find((x) => x.id === b.dataset.id);
      if (!w) return;
      centy.autoAsk = `Can I afford the ${w.name} for $${w.price}? Should I buy it now or wait?`;
      location.hash = "centy";
    },
    "ai-test": async (b) => {
      const st = $("#aiStatus");
      b.disabled = true; st.textContent = "Testing…";
      try {
        const out = await geminiGenerate({ contents: [{ role: "user", parts: [{ text: "Reply with exactly: Centy is online." }] }], temperature: 0, maxOutputTokens: 256 });
        st.textContent = `Connected. Gemini replied: “${out.slice(0, 80)}”`;
        st.style.color = "var(--mint)";
      } catch (e) { st.textContent = friendlyError(e); st.style.color = "var(--coral)"; }
      b.disabled = false;
    },
    "ai-forget": () => { AI.key = ""; saveAI(); toast(usingSharedKey() ? "Your key was removed. Centy is back on the site's shared key." : "Gemini key removed. Centy is in offline mode."); render({ soft: true }); },
    "eval-centy": (b) => { b.disabled = true; evaluateCenty(); },
    "reset-ai": () => { S.userExamples = []; S.taught = 0; save("userExamples", "taught"); buildModel(); toast("The AI forgot your corrections. It's back to its original training."); render({ soft: true }); },
    "reset-all": () => { store.clear(); saveAI(); store.set("centyEval", null); load(); centy.messages = []; buildModel(); setTheme(S.settings.theme); ui.quiz = null; toast("Demo data reset"); render(); }
  };

  document.addEventListener("click", (e) => {
    const goEl = e.target.closest("[data-go]");
    if (goEl) { location.hash = goEl.dataset.go; return; }
    const a = e.target.closest("[data-action]");
    if (a && actions[a.dataset.action]) { e.preventDefault(); actions[a.dataset.action](a, e); }
  });

  // Toggling a lesson open shouldn't scroll-jump; restore previous answers only.
  const forms = {
    tx(f) {
      const d = Object.fromEntries(new FormData(f));
      const err = $("#txErr");
      const amount = parseFloat(d.amount);
      if (!d.desc.trim()) { err.textContent = "Add a short description."; $("#txDesc").focus(); return; }
      if (!(amount > 0)) { err.textContent = "Enter an amount greater than $0."; $("#txAmt").focus(); return; }
      if (d.method === "Centsible demo card" && String(d.code || "").trim().toUpperCase() !== D.DEMO_CARD_CODE) { err.textContent = `Enter the demo code ${D.DEMO_CARD_CODE} (it's on the Demo card page).`; $("#txCode").focus(); return; }
      const pred = model.predict(d.desc);
      teach(d.desc, d.category, pred.label);
      S.tx.push({ id: uid(), date: d.date || todayISO(), description: d.desc.trim().slice(0, 80), category: d.category, amount: Math.round(amount * 100) / 100, type: form.type, method: d.method, card: d.method === "Centsible demo card" ? D.DEMO_CARD_CODE : "" });
      save("tx");
      award("first-steps");
      const flags = anomalies();
      const added = S.tx[S.tx.length - 1];
      Object.assign(form, { desc: "", cat: null, catTouched: false, pred: null });
      toast(flags[added.id] ? `Saved. Heads up: that's ${flags[added.id].ratio.toFixed(1)}× your usual ${added.category} purchase.` : pred.label && pred.label !== d.category ? `Saved. The AI learned that this is ${d.category}.` : "Transaction saved", { icon: flags[added.id] ? "i-zap" : "i-check" });
      render({ soft: true });
      $("#txDesc").focus();
    },
    goal(f) {
      const d = Object.fromEntries(new FormData(f));
      const target = parseFloat(d.target), saved = parseFloat(d.saved) || 0;
      const err = $("#goalErr");
      if (!d.name.trim()) { err.textContent = "Give your goal a name."; return; }
      if (!(target > 0)) { err.textContent = "Set a target above $0."; return; }
      if (saved > target) { err.textContent = "Already saved can't be more than the target."; return; }
      S.goals.push({ id: uid(), name: d.name.trim(), target, saved, deadline: d.deadline || addDays(120), created: todayISO() });
      save("goals"); toast("Goal created"); render({ soft: true });
    },
    contrib(f) {
      const g = S.goals.find((x) => x.id === f.dataset.id);
      const amt = parseFloat(new FormData(f).get("amt"));
      if (!g || !(amt > 0)) return;
      const before = g.saved;
      g.saved = Math.min(g.target, Math.round((g.saved + amt) * 100) / 100);
      S.tx.push({ id: uid(), date: todayISO(), description: `Saved for ${g.name}`, category: "Savings", amount: g.saved - before, type: "Saving", method: "Transfer", card: "" });
      save("goals", "tx");
      if (g.saved >= g.target) { award("goal-getter"); confetti(); toast(`“${g.name}” is fully funded!`, { icon: "i-trophy" }); }
      else toast(`Added ${money(g.saved - before)} to ${g.name}`);
      render({ soft: true });
    },
    payment(f) {
      const d = Object.fromEntries(new FormData(f));
      const amount = parseFloat(d.amount);
      if (!d.name.trim()) { $("#payErr").textContent = "Name the payment."; return; }
      if (!(amount > 0)) { $("#payErr").textContent = "Enter an amount above $0."; return; }
      S.payments.push({ id: uid(), name: d.name.trim(), amount, due: d.due || addDays(7), frequency: d.frequency, paid: false });
      save("payments"); toast("Payment added"); render({ soft: true });
    },
    "add-budget"(f) {
      const d = Object.fromEntries(new FormData(f));
      S.budgets[d.cat] = Math.max(0, parseFloat(d.lim) || 0);
      save("budgets"); toast(`${d.cat} budget added`); render({ soft: true });
    },
    card(f) {
      const d = Object.fromEntries(new FormData(f));
      const amount = parseFloat(d.amount);
      const err = $("#cardErr");
      if (!d.desc.trim()) { err.textContent = "Add what you bought."; return; }
      if (!(amount > 0)) { err.textContent = "Enter an amount above $0."; return; }
      if (String(d.code || "").trim().toUpperCase() !== D.DEMO_CARD_CODE) { err.textContent = `The demo code doesn't match. Use ${D.DEMO_CARD_CODE}.`; return; }
      const p = model.predict(d.desc);
      S.tx.push({ id: uid(), date: d.date || todayISO(), description: d.desc.trim().slice(0, 80), category: p.label && p.confidence >= 0.35 ? p.label : "Other", amount, type: "Expense", method: "Centsible demo card", card: D.DEMO_CARD_CODE });
      save("tx"); award("first-steps");
      toast(`Recorded · AI filed it under ${S.tx[S.tx.length - 1].category}`);
      render({ soft: true });
    },
    settings(f) {
      S.settings.name = String(new FormData(f).get("name") || "").trim().slice(0, 24);
      save("settings"); toast("Preferences saved"); render({ soft: true });
    },
    "quiz-config"() {},
    centy(f) {
      if (centy.busy) { if (centy.ctl) centy.ctl.abort(); return; }
      const ta = $("#chatInput");
      const q = ta.value;
      if (!q.trim()) return;
      ta.value = ""; centy.pending = ""; ta.style.height = "";
      sendToCenty(q);
    },
    decide(f) {
      const d = Object.fromEntries(new FormData(f));
      const p = parseFloat(d.price);
      if (!(p > 0)) return;
      sendToCenty(`Can I afford ${d.item.trim() ? `the ${d.item.trim()}` : "this"} for $${p}? Should I buy it now or wait?`);
    },
    wish(f) {
      const d = Object.fromEntries(new FormData(f));
      const price = parseFloat(d.price);
      if (!d.name.trim()) { $("#wishErr").textContent = "Name the item."; return; }
      if (!(price > 0)) { $("#wishErr").textContent = "Enter a price above $0."; return; }
      S.wishlist.push({ id: uid(), name: d.name.trim().slice(0, 40), price });
      save("wishlist");
      const v = affordCheck(price, d.name);
      toast(`Added · ${v.label}`, { icon: v.kind === "warn" ? "i-alert" : "i-check" });
      render({ soft: true });
    },
    ai(f) {
      const d = Object.fromEntries(new FormData(f));
      if (d.key.trim()) AI.key = d.key.trim();
      AI.model = (d.model || DEFAULT_MODEL).trim();
      saveAI();
      toast(geminiReady() ? "Saved. Centy will use Gemini." : "Saved. Add a key to connect Gemini.", { icon: "i-key" });
      render({ soft: true });
    }
  };
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("form[data-form]");
    if (!f) return;
    e.preventDefault();
    const h = forms[f.dataset.form];
    if (h) h(f);
  });

  /* ================= theme ================= */
  function setTheme(t) {
    S.settings.theme = t === "light" ? "light" : "dark";
    save("settings");
    document.documentElement.dataset.theme = S.settings.theme;
    const btn = $("#themeBtn");
    btn.innerHTML = icon(S.settings.theme === "dark" ? "i-sun" : "i-moon");
    btn.setAttribute("aria-label", S.settings.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  $("#themeBtn").addEventListener("click", () => { setTheme(S.settings.theme === "dark" ? "light" : "dark"); render({ soft: true }); });

  /* ================= boot ================= */
  load();
  buildModel();
  setTheme(S.settings.theme);
  buildNav();
  current = PAGES.some((p) => p[0] === location.hash.slice(1)) ? location.hash.slice(1) : "overview";
  moveIndicator(false);
  render();
  window.addEventListener("resize", () => moveIndicator(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveIndicator(false));
})();
