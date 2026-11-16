# Centsible – Money that makes sense

> **This project is a prototype and is not financial advice.**

An AI money coach and financial-literacy lab for teenagers. At its centre is **Centy**, a Gemini-powered assistant that answers money questions and helps you decide before you spend. It's a static website: no server and no bank connection. The categorizer, forecast and alerts run in your browser; Centy calls Google's Gemini API with your own key.

The one-page project write-up is in [WRITEUP.md](WRITEUP.md).

Built for the Veritas AI High School Hackathon 2026 (AI + Finance track).

## Run it

Any static file server works. From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. In GitHub Codespaces, open the **Ports** tab, find port 8000 and choose **Open in Browser**.

To publish it, push the folder to GitHub and turn on **Settings → Pages → Deploy from branch**. The site works from the repository root with no build step.

## Connect Centy to Gemini

1. Get a free API key at https://aistudio.google.com/.
2. Open the site, go to **Settings → Connect Centy to Gemini**, paste the key and press **Save**, then **Test connection**.
3. A key saved in Settings is stored only in your browser and sent only to Google.

**Shared key for visitors:** `js/config.js` holds a site-wide key so anyone opening the site (for example, judges) can use Centy without adding their own. That file is public, so restrict the key in Google Cloud Console (HTTP referrer = your site address, API = Generative Language API), keep billing off for its project, and delete the key after judging. Set it to `""` to require each visitor's own key.
4. If Google renames its models, type a current model name in the same Settings card. No code change needed.

Without a key, Centy runs in offline mode and answers from your data, a built-in glossary and the lessons.

## What's AI about it

| Feature | Technique | Where |
|---|---|---|
| **Centy, the AI money coach** | Google Gemini API with a teen-focused system prompt, a summary of your numbers, and a rule-based Decision Check for purchase questions | Centy page, floating button, Wishlist |
| **Smart categorizer**: type "iced coffee with friends", get *Food, 92%* plus the words that drove the guess | Multinomial Naive Bayes over words, bigrams and character trigrams, with temperature-calibrated confidence | Activity, Demo card, CSV import, Payments |
| **Learns from you**: every save and correction becomes a new training example, weighted 3× | Online updates to the Naive Bayes counts | Activity |
| **Month-end forecast** of total and per-category spending | Least-squares fit of cumulative month-to-date spending, blended with the simple daily average | Overview, Budget |
| **Unusual-purchase detection** ("4.1× your usual Food purchase") | Robust z-score using the median and median absolute deviation within each category | Overview, Activity |
| **AI coach**: ranked, plain-English insights | Combines the forecast, budget pace, anomalies, savings rate, due dates and quiz mastery | Overview |
| **Goal ETA**: "you'd reach this around Mar 2027, after the deadline" | Projection from your 60-day saving rate | Goals |
| **Adaptive practice** aims questions at your weakest topics and brings back ones you missed | Weighted sampling by (100 − topic mastery), 3× weight for missed questions; mastery is an exponential moving average | Learn |

**Evaluation (held-out data, compared with a baseline).**

- Categorizer, 5-fold cross-validation on 408 examples: **64.5%** vs **13.2%** for a baseline that always guesses the most common category. When at least 60% confident (44% of items) it is right 88.2% of the time. Settings lists examples it gets wrong.
- Centy: **Settings → Run evaluation** sends each of the 29 quiz questions to Gemini without the answer and compares the score with two baselines (random ~25%, always "B" 72%).

**Training data.** The 408 transaction descriptions in `js/data.js` are synthetic, written for this project. No real people's or merchants' records are used.

## Everything else

- Overview dashboard: income, spending, savings, net cash flow, forecast chart, spending donut, upcoming payments, recent activity
- Transaction ledger: add, search, filter, delete with undo, CSV import (`data/sample_transactions.csv` is an example) and CSV export
- Budget studio: per-category limits, live status, projected month-end marker on every bar
- Savings goals: progress rings, monthly pace, contributions, celebration when a goal is funded
- Payments: due-date tracking; marking one paid logs the expense and schedules the next if it repeats
- Wishlist with affordability checks, and a Future Savings Calculator
- Learning lab: 29-question bank across 10 topics, 6 lessons with knowledge checks, 4 decision scenarios, XP, levels, streaks, 8 achievements
- Demo card: a 3D card for tagging purchases with the code `CENTSIBLE-0001`
- Settings: display name, light/dark theme, JSON backup, reset, "forget what the AI learned"
- Animations: count-up numbers, charts that draw in, sliding nav indicator, staggered reveals, card tilt, confetti. All respect the system "reduce motion" setting

## Files

```
index.html               page shell and icon set
js/config.js             shared Gemini key and model for the live site
css/styles.css           design system (dark and light themes)
js/data.js               categories, training examples, question bank, lessons, scenarios
js/ml.js                 Naive Bayes, cross-validation, forecast, anomaly detection
js/app.js                pages, Centy, charts, coach, animations, storage
data/sample_transactions.csv   example CSV for import
WRITEUP.md               one-page project write-up (hackathon template)
```

## Credits

Google Gemini API · Google Fonts (Calistoga, DM Sans, JetBrains Mono) · UI UX Pro Max design skill · Claude (Anthropic) via Claude Code as an AI coding assistant. All training data, quiz questions and demo transactions are synthetic and written by the team. Full list in [WRITEUP.md](WRITEUP.md).

## Prototype limits

The demo card identifier is **not** a real debit or credit card. It cannot make payments or read purchases. Data is stored only in your browser (localStorage), so it is not shared between devices or users. With a Gemini key connected, your question and a summary of your numbers (no names or account numbers) are sent to Google to generate Centy's answer. AI answers and suggestions can be wrong; you always make the final decision. Do not enter real banking credentials or sensitive financial information. A public launch would need accounts, secure per-user storage, a privacy and security review, and appropriate adult or professional oversight.
