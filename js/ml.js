/* Centsible — on-device machine learning. Nothing here calls a server.
   1. Categorizer: multinomial Naive Bayes over words, word stems and bigrams,
      trained on labelled examples plus the user's own corrections.
   2. Forecast: least-squares fit of month-to-date cumulative spending.
   3. Anomalies: robust z-scores (median / MAD) within each category. */

window.CentsibleML = (() => {
  const STOP = new Set(["a", "an", "and", "the", "for", "with", "to", "of", "my", "at", "in", "on", "from", "new", "some", "off"]);

  function tokenize(text) {
    const words = String(text || "").toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w && !STOP.has(w) && !/^\d+$/.test(w));
    const feats = [];
    words.forEach((w, i) => {
      feats.push("w:" + w);
      if (w.length > 4) feats.push("p:" + w.slice(0, 4)); // crude stem: "groceries" ~ "grocery"
      if (i > 0) feats.push("b:" + words[i - 1] + "_" + w);
      // Character trigrams let unseen spellings share evidence ("frappuccino" ~ "cappuccino").
      const padded = "^" + w + "$";
      for (let j = 0; j + 3 <= padded.length; j++) feats.push("c:" + padded.slice(j, j + 3));
    });
    return feats;
  }

  class NaiveBayes {
    constructor(alpha = 0.5) { this.alpha = alpha; this.reset(); }
    reset() { this.counts = {}; this.totals = {}; this.docs = {}; this.vocab = new Set(); this.nDocs = 0; }
    add(text, label, weight = 1) {
      const feats = tokenize(text);
      if (!feats.length || !label) return;
      this.counts[label] ||= {};
      this.totals[label] ||= 0;
      this.docs[label] = (this.docs[label] || 0) + weight;
      this.nDocs += weight;
      for (const f of feats) {
        this.counts[label][f] = (this.counts[label][f] || 0) + weight;
        this.totals[label] += weight;
        this.vocab.add(f);
      }
    }
    train(examples) { this.reset(); for (const e of examples) this.add(e.text, e.category, e.weight || 1); return this; }
    logLik(label, f) {
      const V = this.vocab.size || 1;
      return Math.log(((this.counts[label][f] || 0) + this.alpha) / (this.totals[label] + this.alpha * V));
    }
    predict(text) {
      const feats = tokenize(text);
      const labels = Object.keys(this.counts);
      const known = feats.filter((f) => this.vocab.has(f));
      if (!labels.length || !known.length) return { label: null, confidence: 0, ranked: [], reasons: [], known: 0 };
      const scores = labels.map((l) => {
        let s = Math.log(this.docs[l] / this.nDocs);
        for (const f of known) s += this.logLik(l, f);
        return s;
      });
      // Naive Bayes counts correlated features (a word and its trigrams) as independent
      // evidence, which makes it overconfident. A temperature tempers that.
      const T = 1 + known.length / 4;
      const max = Math.max(...scores);
      const exps = scores.map((s) => Math.exp((s - max) / T));
      const sum = exps.reduce((a, b) => a + b, 0);
      const ranked = labels.map((l, i) => ({ label: l, p: exps[i] / sum })).sort((a, b) => b.p - a.p);
      const top = ranked[0].label;
      // Explain: which features pushed hardest toward the winner vs. the runner-up.
      const rival = ranked[1] ? ranked[1].label : null;
      const reasons = [...new Set(known)]
        .filter((f) => !f.startsWith("c:") && !f.startsWith("p:"))
        .map((f) => ({ f, w: this.logLik(top, f) - (rival ? this.logLik(rival, f) : 0) }))
        .filter((r) => r.w > 0.2)
        .sort((a, b) => b.w - a.w)
        .slice(0, 3)
        .map((r) => r.f.slice(2).replace("_", " "));
      return { label: top, confidence: ranked[0].p, ranked: ranked.slice(0, 3), reasons, known: known.length };
    }
  }

  // Deterministic shuffle so the reported accuracy is reproducible.
  function seededShuffle(arr, seed = 7) {
    const a = arr.slice();
    let s = seed;
    const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* k-fold cross-validation: train on k-1 folds, test on the held-out fold.
     Also scores the simplest baseline (always guess the most common category
     in the training folds) and keeps the model's mistakes for review. */
  function crossValidate(examples, k = 5) {
    const data = seededShuffle(examples);
    let correct = 0, baseCorrect = 0, total = 0, confident = 0, confidentRight = 0;
    const failures = [];
    for (let fold = 0; fold < k; fold++) {
      const test = data.filter((_, i) => i % k === fold);
      const train = data.filter((_, i) => i % k !== fold);
      const model = new NaiveBayes().train(train);
      const counts = {};
      for (const ex of train) counts[ex.category] = (counts[ex.category] || 0) + 1;
      const majority = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      for (const ex of test) {
        total++;
        const p = model.predict(ex.text);
        if (p.label === ex.category) correct++;
        else failures.push({ text: ex.text, truth: ex.category, predicted: p.label || "no guess", confidence: p.confidence });
        if (majority === ex.category) baseCorrect++;
        if (p.confidence >= 0.6) { confident++; if (p.label === ex.category) confidentRight++; }
      }
    }
    return {
      accuracy: total ? correct / total : 0,
      baseline: total ? baseCorrect / total : 0,
      confidentShare: total ? confident / total : 0,
      confidentAccuracy: confident ? confidentRight / confident : 0,
      failures, n: total, k
    };
  }

  /* Month-end projection. cumulative[i] = total spent by day i+1.
     Fit spend = slope × day (least squares through the origin). */
  function forecastMonth(expenses, today = new Date()) {
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daily = new Array(d).fill(0);
    for (const t of expenses) {
      const dt = parseDate(t.date);
      if (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() <= d) daily[dt.getDate() - 1] += t.amount;
    }
    let cum = 0, sxy = 0, sxx = 0;
    const cumulative = daily.map((v, i) => { cum += v; sxy += (i + 1) * cum; sxx += (i + 1) * (i + 1); return cum; });
    const spent = cum;
    const slope = sxx ? sxy / sxx : 0;
    const naiveRate = d ? spent / d : 0;
    // Blend: regression captures trend, simple average keeps early-month estimates sane.
    const rate = d >= 5 ? 0.6 * slope + 0.4 * naiveRate : naiveRate;
    const projected = Math.max(spent, spent + rate * (daysInMonth - d));
    return { spent, projected, rate, day: d, daysInMonth, daysLeft: daysInMonth - d, cumulative };
  }

  function parseDate(s) {
    const [Y, M, D] = String(s).split("-").map(Number);
    return new Date(Y, (M || 1) - 1, D || 1);
  }

  function median(xs) {
    const a = xs.slice().sort((p, q) => p - q);
    const mid = a.length >> 1;
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }

  /* Flags an expense when it is far above what is typical for its category.
     Needs at least 3 other expenses in that category to judge. */
  function findAnomalies(expenses) {
    const byCat = {};
    for (const t of expenses) (byCat[t.category] ||= []).push(t);
    const flags = {};
    for (const list of Object.values(byCat)) {
      if (list.length < 4) continue;
      for (const t of list) {
        const others = list.filter((o) => o !== t).map((o) => o.amount);
        const med = median(others);
        const mad = median(others.map((v) => Math.abs(v - med)));
        const robustZ = mad > 0 ? 0.6745 * (t.amount - med) / mad : (t.amount > med ? Infinity : 0);
        if (med > 0 && t.amount >= 2 * med && robustZ > 3) {
          flags[t.id] = { ratio: t.amount / med, typical: med };
        }
      }
    }
    return flags;
  }

  return { tokenize, NaiveBayes, crossValidate, forecastMonth, findAnomalies, parseDate, median };
})();
