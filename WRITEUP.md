# Centsible – Money that makes sense

**Track:** Finance
**Team:** [Insert team members' names]
**Code:** [GitHub repository link] · **Demo video:** [link]

> This project is a prototype and is not financial advice.

## The Problem

Many teenagers get their first paycheck, allowance or birthday money without ever being taught how to manage it. They often don't know how much they are spending, how much they should be saving, or whether they can afford the things they want to buy, and the moment they decide ("Should I buy these $60 earbuds?") usually comes with no one to ask. Without a clear picture and a habit of thinking decisions through, it is hard to set realistic goals or build good money habits early. Centsible gives young people an AI money coach that explains their own numbers, helps them make a decision before they spend, and teaches the financial-literacy ideas behind it.

**Who it's for:** a 15-year-old with a part-time job and their first debit card, standing at a checkout and wondering whether a purchase fits their budget and savings goals.

## What We Built

Centsible is a personal finance website that acts as a personal money coach. Users record income, spending and savings, and Centsible turns that information into explanations, forecasts and advice.

* **Centy, the AI money coach (central feature):** a chat assistant powered by Google's Gemini API. Users ask about a decision ("Can I afford $60 earbuds right now?") or any financial-literacy question ("What is a credit score?"). Centy reads a summary of the user's numbers, runs a rule-based Decision Check, and explains the verdict in plain language with a reason and an alternative.
* **Money Overview:** available money, income, spending and savings this month, plus an AI month-end spending forecast.
* **Smart Categorizer:** a machine-learning model that reads a transaction description and suggests its category, shows its confidence and the words behind its guess, and learns from the user's corrections.
* **Spending Analysis:** a category donut chart, a cash-flow chart with a forecast line, the biggest spending category, and alerts for unusual purchases.
* **Budget Studio:** spending limits per category, with each category's projected month-end total.
* **Savings Goals:** goals with progress rings, the monthly amount needed, and a predicted completion date.
* **Wishlist:** items the user wants, each checked against available money, upcoming bills and budgets, with an "Ask Centy" button.
* **Future Savings Calculator:** sliders for a weekly amount and number of weeks, showing the total and which goals or wishlist items it would cover.
* **Learning Lab:** 29 quiz questions across 10 topics, 6 lessons, 4 decision scenarios, XP, streaks and an adaptive mode that targets the user's weakest topics.

## What We Added

Our own idea. It is closest to the brief's example in section 4.2.5 ("a budgeting assistant for teenagers with their first debit card"). We added our own user (teenagers making everyday spending decisions), our own synthetic training data for the categorizer, and a Decision Check that gives Centy's answers real numbers to work from.

## How It Works

**Data:**

* The user's own entries (transactions, budgets, goals, wishlist, payments), stored only in their browser. The demo uses fictional sample data; we collected no one's personal information.
* 408 synthetic transaction descriptions in 12 categories that we wrote to train the categorizer (for example "bubble tea with friends" → Food).
* 29 multiple-choice financial-literacy questions that we wrote for the Learning Lab. These double as the test set for Centy.

**Model and Technology:**

* **Centy:** Google Gemini API (model `gemini-flash-latest`, Google's alias for its current Flash model, changeable in Settings). Each request includes a system prompt (teen-friendly, education not advice, never asks for passwords or card numbers), a summary of the user's numbers, and, for purchase questions, the Decision Check result. We hand Centy the calculated numbers so the language model explains a calculation instead of doing arithmetic itself. Without an API key, Centy runs in an offline mode that answers from the app's data, a glossary and the lessons.
* **Decision Check:** rules that compare the price with available money minus bills due in 14 days, the category's remaining budget, open savings goals and the user's average weekly leftover.
* **Smart Categorizer:** a multinomial Naive Bayes classifier over words, word pairs and character trigrams, with temperature-scaled confidence. It runs in the browser and adds each correction as a new training example.
* **Forecast and alerts:** a least-squares fit of month-to-date spending projects the month-end total. Unusual purchases are flagged with a robust z-score (median and median absolute deviation) within each category.
* **Technology:** HTML, CSS and JavaScript as a static website (no server), the browser's localStorage for data, and hand-drawn SVG charts.

## Results

**Smart Categorizer** (5-fold cross-validation, so every score is on examples the model did not train on; 408 examples, 12 categories):

| | Accuracy |
|---|---|
| Baseline: always guess the most common category | 13.2% |
| Our Naive Bayes model | **64.5%** |
| Our model, only when ≥60% confident (44% of items) | 88.2% |

The app only auto-fills a category when the model is at least 60% confident; otherwise it shows its top guesses and asks the user.

**Where it fails:** "health supplies" was labelled Education (81% confident) and "fitness class" was labelled Education, because words like *supplies* and *class* appear mostly in our school examples. "new clothes" was labelled Income, because "selling clothes" is an Income example. With only about 34 examples per category, one shared word can outweigh the rest.

**Centy** (each of the 29 Learning Lab questions sent to Gemini without the answer key; run from Settings → "Run evaluation"):

| | Score |
|---|---|
| Baseline: random guess | ~25% |
| Baseline: always answer "B" (the most common correct letter) | 21/29 (72%) |
| Centy (`gemini-flash-latest`) | **[X]/29 ([Y]%)** _(fill in after running the evaluation with your key)_ |

The "always B" baseline is high because 21 of our 29 questions have B as the answer. That is a weakness in our question bank that we report honestly. Centy should beat 72% to show real value.

**Recommendations:** the coach and Decision Check correctly identify situations such as spending projected to exceed the budget, a category already over its limit, a purchase several times larger than usual, a savings rate under 10%, a bill due within 3 days, and a wishlist item that would slow existing savings goals.

**Limitations:** the categorizer was trained and tested on synthetic descriptions we wrote, so real users' wording may score lower. We did not test the spending forecast against real future data (we have no real multi-month data), so its accuracy is unmeasured. Centy can make mistakes, and its answers depend on the data the user enters. Centy sends the user's question and a money summary (no names or account numbers) to Google. The live site uses a shared demo key that is restricted to our website and deleted after judging.

## What We'd Do Next

1. **Test with real teenagers:** collect real transaction descriptions (with permission), measure the categorizer on them, and check whether it works equally well for different spending styles.
2. **Back-test the forecast:** use several months of real spending data, train on earlier months and test on later ones, and compare against a simple "same as last month" baseline.
3. **Improve Centy's evaluation:** rebalance the question bank so correct answers are spread evenly across A–D, and add open-ended decision questions graded by a rubric.
4. **Recurring payment detection:** spot subscriptions automatically from the ledger and remind users before they renew.

## Sources

* Google Gemini API: https://ai.google.dev/ (API keys from Google AI Studio: https://aistudio.google.com/)
* Google Fonts (Calistoga, DM Sans, JetBrains Mono): https://fonts.google.com/
* Naive Bayes text classification background: https://scikit-learn.org/stable/modules/naive_bayes.html (our implementation is written from scratch in JavaScript)
* UI UX Pro Max design skill (design guidance): https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
* AI coding assistant: Claude (Anthropic) via Claude Code, used to help write and test the code: https://www.anthropic.com/claude-code
* Datasets: none external. The 408 training descriptions, 29 quiz questions and all demo transactions are synthetic and written by our team.

This project is a prototype and is not financial advice.
