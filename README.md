# Centsible — Money, made clearer

A Streamlit finance-literacy and budgeting prototype designed for GitHub Codespaces.

## Run in GitHub Codespaces

```bash
pip install -r requirements.txt
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
```

Open the **Ports** tab, find port **8501**, and choose **Open in Browser**.

## Features

- Top navigation menu that opens on demand; no left sidebar navigation.
- Overview dashboard with income, spending, savings, cash flow, upcoming payments, and recent activity.
- Manual transaction ledger with search, filtering, deletion, and CSV export.
- Budget studio with category limits, progress indicators, and spending charts.
- Savings goals with contribution tracking and suggested monthly pace.
- Upcoming payment tracker with paid status.
- Learning lab with topic-based question bank, randomized practice sessions, scored assessments, explanations, learning paths, knowledge checks, XP, streaks, achievements, and decision scenarios.
- Simulated demo-card purchase tagging using `CENTSIBLE-0001`.
- Local data export and reset controls.

## Important prototype limits

The demo-card identifier is **not** a real debit or credit card. It cannot make payments, connect to card networks, or automatically read purchases. Transactions are entered manually. Data is stored in files in the project workspace and is not isolated into secure accounts for multiple users. Do not enter real banking credentials or sensitive financial information. A public launch would require authentication, secure per-user storage, privacy and security review, and appropriate professional oversight.

## Files

- `app.py` — application interface and logic
- `requirements.txt` — Python dependencies
- `data/` — local prototype data files are created automatically
- `.devcontainer/` — Codespaces configuration
