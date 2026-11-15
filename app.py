from __future__ import annotations

from pathlib import Path
from datetime import date, datetime, timedelta
from collections import defaultdict
import json
import uuid
import math
import random
import textwrap

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# =============================================================================
# CENTSIBLE — PERSONAL FINANCE LEARNING & MONEY MANAGEMENT
# A polished, local-first Streamlit prototype. Demo data only; no bank link.
# =============================================================================

APP_VERSION = "2.0"
APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

TX_FILE = DATA_DIR / "transactions.csv"
BUDGET_FILE = DATA_DIR / "budgets.json"
GOALS_FILE = DATA_DIR / "goals.json"
PAYMENTS_FILE = DATA_DIR / "payments.json"
PROGRESS_FILE = DATA_DIR / "learning_progress.json"
SETTINGS_FILE = DATA_DIR / "settings.json"

DEMO_CARD_CODE = "CENTSIBLE-0001"
CURRENCY = "$"
CATEGORIES = [
    "Food", "Shopping", "Entertainment", "Transportation", "Education",
    "Health", "Gifts", "Housing", "Utilities", "Savings", "Income", "Other"
]
TX_COLUMNS = [
    "ID", "Date", "Description", "Category", "Amount", "Type",
    "Payment method", "Card code"
]
TX_TYPES = ["Expense", "Income", "Saving"]
NAV_ITEMS = [
    "Overview", "Transactions", "Budget studio", "Savings goals",
    "Payments", "Learning lab", "My demo card", "Settings"
]

st.set_page_config(
    page_title="Centsible — Money, made clearer",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# =============================================================================
# DESIGN SYSTEM
# =============================================================================

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
:root {
 --bg:#0b0d10; --surface:#13171c; --surface2:#191f26; --surface3:#202832;
 --line:#2a333d; --text:#f4f6f8; --muted:#9ca8b5; --soft:#cbd3dc;
 --accent:#b8c5d2; --accent2:#8fa4b8; --green:#61c49b; --red:#ed8b8b;
 --gold:#e4c27a; --blue:#83b7e8; --radius:18px;
}
html, body, [class*="css"] { font-family:'DM Sans',sans-serif; color:var(--text); }
.stApp {
 background:
 radial-gradient(ellipse at 78% -18%,rgba(124,145,164,.13),transparent 42%),
 radial-gradient(ellipse at 5% 22%,rgba(76,96,113,.10),transparent 36%),
 var(--bg);
 color:var(--text);
}
[data-testid="stHeader"] { background:rgba(11,13,16,.88); }
[data-testid="stSidebar"] { display:none !important; }
[data-testid="collapsedControl"] { display:none !important; }
.block-container { max-width:1500px; padding-top:1.35rem; padding-bottom:4rem; }
h1,h2,h3,h4 { font-family:'Space Grotesk',sans-serif !important; letter-spacing:-.04em; color:#f7f8fa !important; }
h1 { font-size:2.55rem !important; font-weight:700 !important; }
h2 { font-size:1.7rem !important; }
h3 { font-size:1.18rem !important; }
p, label, li { color:#d5dce3; }
small, .muted { color:var(--muted) !important; }
hr { border-color:var(--line); }
div[data-testid="stVerticalBlock"] > div:has(> div[data-testid="stHorizontalBlock"]) { min-width:0; }
div.stButton > button, div.stFormSubmitButton > button, div.stDownloadButton > button {
 border:1px solid #465461; border-radius:12px; color:#f6f8fa;
 background:linear-gradient(135deg,#35414c,#26313b); font-weight:700;
 min-height:2.55rem; transition:all .18s ease;
}
div.stButton > button:hover, div.stFormSubmitButton > button:hover, div.stDownloadButton > button:hover {
 border-color:#9cabb9; background:linear-gradient(135deg,#526171,#354451);
 transform:translateY(-1px); color:white;
}
div.stButton > button:focus { box-shadow:0 0 0 .15rem rgba(150,175,195,.25); }
[data-testid="stPopover"] button {
 border-radius:12px !important; border:1px solid #394550 !important;
 background:#171d23 !important; color:#f4f6f8 !important;
}
[data-testid="stTabs"] [data-baseweb="tab-list"] {
 gap:7px; border-bottom:1px solid var(--line); background:transparent;
}
[data-testid="stTabs"] [data-baseweb="tab"] {
 background:#171d23; border:1px solid #2b3540; border-radius:10px 10px 0 0;
 padding:10px 15px; color:#b8c3cd;
}
[data-testid="stTabs"] [aria-selected="true"] {
 background:#34414d !important; color:#fff !important; border-color:#687989 !important;
}
[data-testid="stMetric"] {
 background:linear-gradient(145deg,#171d23,#11161b);
 border:1px solid #2b3540; border-radius:16px; padding:17px 18px;
}
[data-testid="stMetricLabel"] { color:#aab6c1 !important; font-size:.76rem; letter-spacing:.08em; }
[data-testid="stMetricValue"] { color:#f7f8fa !important; font-family:'Space Grotesk',sans-serif; }
[data-testid="stDataFrame"] { border:1px solid #2b3540; border-radius:14px; overflow:hidden; }
[data-testid="stExpander"] { border:1px solid #303b46; border-radius:14px; background:#141a20; }
[data-testid="stForm"] { border:1px solid #303b46; border-radius:16px; background:#13191f; padding:18px; }
input, textarea, [data-baseweb="select"] > div {
 background:#171e25 !important; color:#f4f6f8 !important; border-color:#3a4652 !important;
}
[data-testid="stProgressBar"] > div > div > div > div { background:#a8b8c7; }
div[data-testid="stAlert"] { border-radius:13px; }
.eyebrow { color:#a9bac9; font-size:.70rem; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
.hero { padding:20px 0 12px; animation:rise .45s ease both; }
.hero h1 { margin:.25rem 0 .35rem; }
.hero p { color:#aab6c1; max-width:780px; font-size:1rem; }
.panel {
 background:linear-gradient(145deg,rgba(25,32,39,.97),rgba(17,22,27,.98));
 border:1px solid #303b46; border-radius:18px; padding:19px 21px;
 box-shadow:0 12px 35px rgba(0,0,0,.14); transition:transform .18s,border-color .18s;
}
.panel:hover { border-color:#647687; transform:translateY(-2px); }
.panel-label { color:#aab6c1; font-size:.70rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
.panel-value { color:#fff; font-family:'Space Grotesk',sans-serif; font-size:1.85rem; font-weight:700; letter-spacing:-.05em; margin-top:8px; }
.panel-note { color:#9eabb7; font-size:.79rem; margin-top:4px; }
.pill { display:inline-block; border:1px solid #43515e; border-radius:99px; padding:4px 9px; color:#cbd5de; font-size:.72rem; font-weight:700; }
.feature-card { border:1px solid #34414d; border-radius:16px; background:#151c22; padding:17px; height:100%; }
.feature-card h4 { margin:.25rem 0 .4rem; }
.feature-card p { color:#aab6c1; font-size:.86rem; }
.question-card { background:linear-gradient(145deg,#1b242d,#141a20); border:1px solid #465462; border-radius:20px; padding:23px; }
.question-number { color:#9fb3c5; font-size:.75rem; letter-spacing:.14em; font-weight:800; text-transform:uppercase; }
.question-text { color:#fff; font-family:'Space Grotesk',sans-serif; font-size:1.45rem; font-weight:650; line-height:1.35; margin:.6rem 0 1rem; }
.answer-correct { border:1px solid #4d9c7c; background:rgba(48,121,89,.16); border-radius:12px; padding:13px 15px; }
.answer-wrong { border:1px solid #a45f5f; background:rgba(151,64,64,.14); border-radius:12px; padding:13px 15px; }
.lesson-step { border-left:3px solid #879bad; padding:4px 0 4px 14px; margin:10px 0; }
.callout { border:1px solid #3b4b59; background:#18212a; border-radius:14px; padding:14px 16px; }
.nav-caption { color:#91a0ad; font-size:.72rem; letter-spacing:.12em; font-weight:800; text-transform:uppercase; }
@keyframes rise { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# PERSISTENCE & STATE
# =============================================================================

def read_json(path: Path, fallback):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        pass
    return fallback

def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    temp.replace(path)

def money(value) -> str:
    try:
        return f"${float(value):,.2f}"
    except (TypeError, ValueError):
        return "$0.00"

def today_iso() -> str:
    return date.today().isoformat()

def seed_transactions():
    now = date.today()
    rows = [
        [uuid.uuid4().hex[:10], str(now-timedelta(days=12)), "Weekend earnings", "Income", 180.00, "Income", "Deposit", ""],
        [uuid.uuid4().hex[:10], str(now-timedelta(days=9)), "Lunch", "Food", 13.50, "Expense", "Centsible demo card", DEMO_CARD_CODE],
        [uuid.uuid4().hex[:10], str(now-timedelta(days=7)), "Notebook and supplies", "Education", 18.75, "Expense", "Centsible demo card", DEMO_CARD_CODE],
        [uuid.uuid4().hex[:10], str(now-timedelta(days=5)), "Savings contribution", "Savings", 25.00, "Saving", "Transfer", ""],
        [uuid.uuid4().hex[:10], str(now-timedelta(days=3)), "Movie night", "Entertainment", 16.00, "Expense", "Cash", ""],
        [uuid.uuid4().hex[:10], str(now-timedelta(days=1)), "Gift", "Gifts", 12.00, "Expense", "Cash", ""],
    ]
    return pd.DataFrame(rows, columns=TX_COLUMNS)

def load_transactions():
    if TX_FILE.exists():
        try:
            frame = pd.read_csv(TX_FILE)
            for col in TX_COLUMNS:
                if col not in frame.columns:
                    frame[col] = 0 if col == "Amount" else ""
            frame["Amount"] = pd.to_numeric(frame["Amount"], errors="coerce").fillna(0).clip(lower=0)
            frame["Date"] = pd.to_datetime(frame["Date"], errors="coerce").dt.strftime("%Y-%m-%d").fillna(today_iso())
            frame["Type"] = frame["Type"].astype(str).str.title()
            frame.loc[frame["Type"] == "Savings", "Type"] = "Saving"
            return frame[TX_COLUMNS]
        except Exception:
            return seed_transactions()
    return seed_transactions()

DEFAULT_BUDGETS = {
    "Food": 150.0, "Shopping": 90.0, "Entertainment": 65.0,
    "Transportation": 60.0, "Education": 50.0, "Other": 50.0
}
DEFAULT_PAYMENTS = [
    {"id":"pay-music","name":"Music subscription","amount":5.99,
     "due":str(date.today()+timedelta(days=4)),"frequency":"Monthly","paid":False},
    {"id":"pay-phone","name":"Phone contribution","amount":25.00,
     "due":str(date.today()+timedelta(days=9)),"frequency":"Monthly","paid":False},
]
DEFAULT_PROGRESS = {
    "completed": [], "streak": 0, "last_day": "",
    "xp": 0, "quiz_history": [], "best_scores": {},
    "mastery": {}, "badges": [], "daily_activity": {}
}

def init_state():
    defaults = {
        "transactions": load_transactions(),
        "budgets": read_json(BUDGET_FILE, DEFAULT_BUDGETS.copy()),
        "goals": read_json(GOALS_FILE, []),
        "payments": read_json(PAYMENTS_FILE, DEFAULT_PAYMENTS.copy()),
        "learning": read_json(PROGRESS_FILE, DEFAULT_PROGRESS.copy()),
        "settings": read_json(SETTINGS_FILE, {"display_name":"Learner","monthly_income":0.0}),
        "page": "Overview",
        "quiz": None,
        "test": None,
        "scenario": None,
        "toast": "",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

def save_transactions():
    st.session_state.transactions.to_csv(TX_FILE, index=False)

def save_budgets():
    write_json(BUDGET_FILE, st.session_state.budgets)

def save_goals():
    write_json(GOALS_FILE, st.session_state.goals)

def save_payments():
    write_json(PAYMENTS_FILE, st.session_state.payments)

def save_learning():
    write_json(PROGRESS_FILE, st.session_state.learning)

def save_settings():
    write_json(SETTINGS_FILE, st.session_state.settings)

init_state()

# =============================================================================
# TRANSACTION & FINANCE CALCULATIONS
# =============================================================================

def transactions():
    frame = st.session_state.transactions.copy()
    if frame.empty:
        return pd.DataFrame(columns=TX_COLUMNS)
    frame["Amount"] = pd.to_numeric(frame["Amount"], errors="coerce").fillna(0)
    return frame

def totals(frame=None):
    frame = transactions() if frame is None else frame
    income = float(frame.loc[frame.Type == "Income", "Amount"].sum())
    expenses = float(frame.loc[frame.Type == "Expense", "Amount"].sum())
    savings = float(frame.loc[frame.Type == "Saving", "Amount"].sum())
    return {"income":income, "expenses":expenses, "savings":savings,
            "remaining":income-expenses-savings, "cashflow":income-expenses}

def monthly_frame(frame=None):
    frame = transactions() if frame is None else frame
    if frame.empty:
        return frame
    frame["Date"] = pd.to_datetime(frame["Date"], errors="coerce")
    start = pd.Timestamp(date.today().replace(day=1))
    return frame[frame["Date"] >= start]

def category_spending(frame=None):
    frame = transactions() if frame is None else frame
    expenses = frame[frame.Type == "Expense"]
    if expenses.empty:
        return pd.DataFrame(columns=["Category","Amount"])
    return expenses.groupby("Category", as_index=False)["Amount"].sum().sort_values("Amount", ascending=False)

def add_transaction(description, category, amount, kind, when, method="Manual", card_code=""):
    row = {
        "ID":uuid.uuid4().hex[:10], "Date":str(when), "Description":description.strip(),
        "Category":category, "Amount":float(amount), "Type":kind,
        "Payment method":method, "Card code":card_code
    }
    st.session_state.transactions = pd.concat(
        [transactions(), pd.DataFrame([row])], ignore_index=True
    )[TX_COLUMNS]
    save_transactions()

def remove_transaction(tx_id):
    frame = transactions()
    st.session_state.transactions = frame[frame.ID.astype(str) != str(tx_id)].copy()
    save_transactions()

def month_label():
    return date.today().strftime("%B %Y")

def due_status(due_string):
    try:
        due = date.fromisoformat(str(due_string))
        days = (due-date.today()).days
        if days < 0:
            return f"{abs(days)} days overdue", "late"
        if days == 0:
            return "Due today", "soon"
        if days <= 3:
            return f"Due in {days} days", "soon"
        return f"Due {due.strftime('%b %d')}", "normal"
    except ValueError:
        return "Date unavailable", "normal"

# =============================================================================
# LEARNING CONTENT: QUESTION BANK
# Each item has a concept, difficulty, explanation and practical takeaway.
# =============================================================================

QUESTION_BANK = [
    {"id":"budget-01","topic":"Budgeting","level":"Starter","type":"concept",
     "q":"You receive $120 this month. Which plan is the strongest starting budget?",
     "choices":["Spend first and save whatever remains","Give every dollar a planned job, including savings","Put everything into savings and ignore expenses","Borrow money whenever the plan runs short"],
     "answer":1,"why":"A plan gives income jobs before it disappears. You can allocate money to needs, wants, savings, and future costs, then adjust when reality changes.",
     "takeaway":"Plan first. Review often. A budget is a flexible tool, not a punishment."},
    {"id":"budget-02","topic":"Budgeting","level":"Starter","type":"application",
     "q":"Your monthly take-home income is $800. Essential costs are $430 and planned savings are $100. How much remains for flexible spending?",
     "choices":["$170","$270","$370","$530"],"answer":1,
     "why":"$800 − $430 − $100 = $270. This is the amount available for flexible categories, assuming the listed costs are complete.",
     "takeaway":"Use subtraction to find what is actually available—not what you hope is available."},
    {"id":"budget-03","topic":"Budgeting","level":"Core","type":"analysis",
     "q":"A budget category has a $75 limit. You have spent $52.40. What is the remaining amount?",
     "choices":["$12.60","$22.60","$27.40","$127.40"],"answer":1,
     "why":"$75.00 − $52.40 = $22.60. Tracking throughout the month helps you make choices before a category runs out.",
     "takeaway":"Remaining budget = budget limit − amount spent."},
    {"id":"budget-04","topic":"Budgeting","level":"Core","type":"scenario",
     "q":"Your spending is above plan halfway through the month. What is the most useful next step?",
     "choices":["Ignore it because the month is not over","Review transactions and adjust flexible categories","Delete the budget","Assume next month will automatically be better"],
     "answer":1,
     "why":"A budget is a feedback system. Find the category driving the difference, check for errors, and make a realistic adjustment.",
     "takeaway":"A budget review is information, not a grade on your character."},
    {"id":"budget-05","topic":"Budgeting","level":"Advanced","type":"analysis",
     "q":"Your income changes each month. Which approach is generally more resilient?",
     "choices":["Build the plan around your highest-ever month","Use a conservative baseline and prioritize essentials","Commit every dollar before income is known","Ignore irregular expenses"],
     "answer":1,
     "why":"A conservative baseline reduces the risk of planning around income that may not arrive. Irregular costs can be handled with sinking funds.",
     "takeaway":"For variable income, plan around a dependable floor—not an optimistic ceiling."},
    {"id":"saving-01","topic":"Saving","level":"Starter","type":"concept",
     "q":"What is a sinking fund?",
     "choices":["A fund for a cost you expect in the future","A loan with no repayment date","An investment guaranteed to rise","A bank fee"],
     "answer":0,
     "why":"A sinking fund sets aside smaller amounts over time for a known future expense, such as school supplies or an annual bill.",
     "takeaway":"Turn a large future cost into smaller planned contributions."},
    {"id":"saving-02","topic":"Saving","level":"Starter","type":"application",
     "q":"You want $180 in 6 months. If you save the same amount monthly, how much is needed each month?",
     "choices":["$20","$25","$30","$36"],"answer":2,
     "why":"$180 ÷ 6 = $30 per month. This assumes no interest and no withdrawals.",
     "takeaway":"Monthly goal contribution = target amount ÷ months available."},
    {"id":"saving-03","topic":"Saving","level":"Core","type":"analysis",
     "q":"Why might an emergency fund be kept somewhere accessible and relatively stable?",
     "choices":["So it can be spent on every sale","Because emergencies require access and the money should not depend on market prices","Because it always earns the highest return","So it cannot be tracked"],
     "answer":1,
     "why":"Emergency savings are for unexpected costs. Stability and access usually matter more than chasing a high return.",
     "takeaway":"Match the account or asset to the purpose and time horizon."},
    {"id":"saving-04","topic":"Saving","level":"Core","type":"scenario",
     "q":"A goal is due in two months, but you have saved only 20% of the target. What is a sound response?",
     "choices":["Assume the money will appear","Revisit the deadline, target, or contribution plan","Use a high-risk investment to catch up","Hide the shortfall"],
     "answer":1,
     "why":"A plan should reflect actual progress. You can extend the timeline, lower the target, or increase contributions if realistic.",
     "takeaway":"Adjust the plan transparently instead of relying on a risky shortcut."},
    {"id":"saving-05","topic":"Saving","level":"Advanced","type":"analysis",
     "q":"What does opportunity cost mean when deciding whether to buy something?",
     "choices":["The sales tax on the item","The value of the next-best option you give up","The original retail price","The amount of cash in your wallet"],
     "answer":1,
     "why":"Choosing one option means giving up another. The opportunity cost is the value of that next-best alternative.",
     "takeaway":"Ask what else this money could do before making a purchase."},
    {"id":"credit-01","topic":"Credit","level":"Starter","type":"concept",
     "q":"What is interest on a loan?",
     "choices":["The cost of borrowing money","A reward paid by every store","A type of debit card","A payment that is always optional"],
     "answer":0,
     "why":"Interest is the cost of borrowing, usually expressed as a rate. Fees and repayment timing also affect total cost.",
     "takeaway":"Compare the total amount repaid—not just the monthly payment."},
    {"id":"credit-02","topic":"Credit","level":"Core","type":"application",
     "q":"A $200 balance has a 10% simple annual interest rate for one year. Ignoring fees and payments, what is the interest?",
     "choices":["$2","$10","$20","$40"],"answer":2,
     "why":"$200 × 0.10 = $20 for one year under this simplified simple-interest example. Real credit products may compound and include fees.",
     "takeaway":"Interest depends on balance, rate, and time. Read the actual agreement."},
    {"id":"credit-03","topic":"Credit","level":"Core","type":"analysis",
     "q":"Why can paying only the minimum on a credit card be expensive?",
     "choices":["It always cancels the balance","It can extend repayment and increase total interest paid","It removes all fees","It improves every credit score instantly"],
     "answer":1,
     "why":"A minimum payment may leave much of the balance outstanding. Interest can continue to accrue, making repayment take longer.",
     "takeaway":"Understand the minimum, due date, APR, and total cost."},
    {"id":"credit-04","topic":"Credit","level":"Advanced","type":"scenario",
     "q":"A purchase is advertised as 'only $25 per month.' What should you check before judging affordability?",
     "choices":["Only the monthly amount","APR, fees, term, total repayment, and whether you need it","Whether the ad uses a bright color","Whether friends bought it"],
     "answer":1,
     "why":"A small payment can hide a long term or high total cost. Compare the complete terms and your budget.",
     "takeaway":"Monthly payment is only one part of borrowing cost."},
    {"id":"banking-01","topic":"Banking safety","level":"Starter","type":"concept",
     "q":"Which information should never be shared in response to an unexpected message?",
     "choices":["A public store address","A one-time verification code or password","A general question about budgeting","A public product name"],
     "answer":1,
     "why":"Verification codes and passwords can give someone access to an account. Legitimate support should not ask you to disclose a one-time code.",
     "takeaway":"Never share passwords or verification codes. Verify requests independently."},
    {"id":"banking-02","topic":"Banking safety","level":"Core","type":"scenario",
     "q":"You receive a text claiming your account will be locked unless you click a link immediately. What is safest?",
     "choices":["Click quickly","Reply with your password","Open the official app or contact the institution using a trusted channel","Forward it to everyone"],
     "answer":2,
     "why":"Urgency and unexpected links are common scam signals. Navigate independently using an official app, website, or known phone number.",
     "takeaway":"Do not use contact details supplied by a suspicious message."},
    {"id":"banking-03","topic":"Banking safety","level":"Advanced","type":"analysis",
     "q":"What is the strongest reason to enable transaction alerts?",
     "choices":["They guarantee no fraud","They can help you notice unfamiliar activity sooner","They replace account statements","They make passwords unnecessary"],
     "answer":1,
     "why":"Alerts provide an additional monitoring layer. They do not prevent every problem, but can help you respond faster.",
     "takeaway":"Use alerts alongside strong passwords and regular account reviews."},
    {"id":"invest-01","topic":"Investing","level":"Starter","type":"concept",
     "q":"What does diversification mean?",
     "choices":["Putting all money into one company","Spreading investments across different assets or exposures","Buying only what is trending","Avoiding all risk"],
     "answer":1,
     "why":"Diversification reduces dependence on one investment or risk source. It cannot eliminate market risk or guarantee gains.",
     "takeaway":"Diversification manages concentration risk; it does not guarantee returns."},
    {"id":"invest-02","topic":"Investing","level":"Core","type":"analysis",
     "q":"Why is a high expected return usually connected to higher risk?",
     "choices":["Higher returns are guaranteed","Investors may require compensation for taking greater uncertainty","Risk disappears over time","All assets have identical risk"],
     "answer":1,
     "why":"Investments with uncertain outcomes may offer higher potential returns, but losses are possible and returns are never guaranteed.",
     "takeaway":"Potential return must be considered together with possible loss."},
    {"id":"invest-03","topic":"Investing","level":"Core","type":"application",
     "q":"An investment rises from $100 to $110. What is the percentage gain before fees and taxes?",
     "choices":["5%","10%","11%","20%"],"answer":1,
     "why":"The gain is $10. Divide $10 by the original $100: 0.10, or 10%.",
     "takeaway":"Percentage return = gain or loss ÷ starting value × 100."},
    {"id":"invest-04","topic":"Investing","level":"Advanced","type":"scenario",
     "q":"Money is needed for a known expense next month. Which statement is most appropriate?",
     "choices":["Put it all into a volatile investment","Keep the money in a suitable accessible place rather than depending on short-term market gains","Borrow to invest more","Assume the market will rise"],
     "answer":1,
     "why":"A short time horizon leaves little time to recover from a market decline. Money needed soon generally calls for stability and access.",
     "takeaway":"Time horizon matters when choosing where money belongs."},
    {"id":"scams-01","topic":"Scam detection","level":"Starter","type":"concept",
     "q":"Which is a common warning sign of a financial scam?",
     "choices":["A clear explanation of fees","Pressure to act immediately and keep it secret","A link to official documentation you independently located","Time to compare options"],
     "answer":1,
     "why":"Scammers often create urgency, secrecy, or fear to stop people from checking the facts.",
     "takeaway":"Pause, verify independently, and ask a trusted person when uncertain."},
    {"id":"scams-02","topic":"Scam detection","level":"Core","type":"scenario",
     "q":"Someone online promises to double your money by tomorrow if you send a fee first. What is the best response?",
     "choices":["Pay the fee","Send a small test amount","Treat it as a major warning sign and do not send money","Share your account login"],
     "answer":2,
     "why":"Guaranteed fast returns and upfront fees are major scam indicators. Do not send money or private information.",
     "takeaway":"No legitimate investment can guarantee rapid, risk-free returns."},
    {"id":"tax-01","topic":"Taxes & pay","level":"Starter","type":"concept",
     "q":"What is take-home pay?",
     "choices":["Pay before any deductions","Pay remaining after applicable deductions and withholding","A bonus from an employer","The amount on a job advertisement"],
     "answer":1,
     "why":"Gross pay is before deductions. Take-home pay is what reaches you after applicable withholding and deductions.",
     "takeaway":"Build a spending plan around money actually received."},
    {"id":"tax-02","topic":"Taxes & pay","level":"Core","type":"application",
     "q":"You work 8 hours at $15 per hour. What is gross pay before deductions?",
     "choices":["$23","$80","$120","$150"],"answer":2,
     "why":"8 × $15 = $120 gross pay before taxes or other deductions.",
     "takeaway":"Hours worked × hourly rate = gross pay, before deductions."},
    {"id":"consumer-01","topic":"Smart spending","level":"Starter","type":"concept",
     "q":"What is a useful way to compare two products with different package sizes?",
     "choices":["Compare unit prices","Choose the brighter package","Compare only the package names","Assume the larger package is always cheaper"],
     "answer":0,
     "why":"Unit price compares cost per common unit, such as ounce or item, making different sizes easier to compare.",
     "takeaway":"Unit price helps reveal value, but also consider quality and whether you need the quantity."},
    {"id":"consumer-02","topic":"Smart spending","level":"Core","type":"scenario",
     "q":"A limited-time sale ends in ten minutes. You had not planned to buy the item. What should you do?",
     "choices":["Buy it because the timer is running","Pause and compare the purchase with your needs and budget","Use credit automatically","Buy two to save more"],
     "answer":1,
     "why":"Artificial urgency can push impulsive choices. A discount is not savings if it creates an unnecessary expense.",
     "takeaway":"A purchase is not a good deal just because the price is lower."},
    {"id":"insurance-01","topic":"Risk & protection","level":"Core","type":"concept",
     "q":"What is the main purpose of insurance?",
     "choices":["To make every event profitable","To transfer certain financial risks in exchange for premiums and policy terms","To guarantee that nothing bad happens","To eliminate all costs"],
     "answer":1,
     "why":"Insurance can help protect against specified financial losses, subject to coverage, exclusions, deductibles, and limits.",
     "takeaway":"Understand what a policy covers—and what it does not."},
    {"id":"inflation-01","topic":"Economics","level":"Core","type":"analysis",
     "q":"If prices rise while your income stays the same, what generally happens to purchasing power?",
     "choices":["It increases","It decreases","It stays exactly the same","It becomes unlimited"],
     "answer":1,
     "why":"Inflation means the general price level rises. The same amount of money buys fewer goods and services.",
     "takeaway":"Purchasing power depends on income relative to prices."},
]

TOPIC_DESCRIPTIONS = {
    "Budgeting":"Build a plan, track trade-offs, and make your money intentional.",
    "Saving":"Set goals, prepare for future costs, and build consistency.",
    "Credit":"Understand borrowing, interest, repayment, and total cost.",
    "Banking safety":"Protect accounts, recognize suspicious messages, and monitor activity.",
    "Investing":"Learn risk, return, diversification, and time horizons.",
    "Scam detection":"Spot pressure tactics, unrealistic promises, and unsafe requests.",
    "Taxes & pay":"Understand gross pay, deductions, and take-home income.",
    "Smart spending":"Compare value, question urgency, and make deliberate purchases.",
    "Risk & protection":"Understand how insurance transfers defined financial risks.",
    "Economics":"Connect inflation and purchasing power to everyday choices.",
}

LESSONS = [
    {"id":"lesson-budget","topic":"Budgeting","title":"Build a budget that survives real life","minutes":6,
     "level":"Starter","sections":[
      ("The idea","A budget is a plan for money coming in and money going out. It is a decision-making tool—not a restriction or a prediction that every month will be identical."),
      ("A practical structure","Start with dependable income. List essential costs, flexible spending, savings goals, and irregular expenses. Give each dollar a purpose while leaving room for reality."),
      ("The review loop","Compare your plan with actual transactions. Find the biggest difference, decide whether it was expected, and adjust one category at a time."),
      ("Try it","If you receive $500, plan $250 for essentials, $75 for savings, $100 for flexible spending, and $75 for future or irregular costs. The right amounts depend on your situation.")
     ],"check":"What makes a budget useful?","options":["It never changes","It helps compare a plan with real spending","It guarantees more income","It removes every want"],"answer":1},
    {"id":"lesson-saving","topic":"Saving","title":"Turn a goal into a repeatable system","minutes":5,
     "level":"Starter","sections":[
      ("Make it specific","A useful savings goal has a target amount, a reason, and a time frame."),
      ("Calculate the pace","Divide the amount still needed by the number of saving periods remaining. Check whether that contribution is realistic."),
      ("Separate the purpose","A goal fund can help prevent money intended for one purpose from being spent on another."),
      ("Review without shame","If the pace is too high, change the timeline or target. A realistic plan is more useful than an impossible one.")
     ],"check":"You need $96 in 4 months. What is the equal monthly contribution?","options":["$12","$24","$32","$48"],"answer":1},
    {"id":"lesson-credit","topic":"Credit","title":"Read the full cost of borrowing","minutes":7,
     "level":"Core","sections":[
      ("Principal and interest","Principal is the amount borrowed. Interest is the cost of borrowing, often described using an annual percentage rate."),
      ("Look beyond the payment","A low monthly payment may come from a longer repayment period. Compare fees, rate, term, and total repayment."),
      ("Due dates matter","Late payments can create fees and other consequences. Read the agreement and keep track of due dates."),
      ("Pause before signing","Borrowing is a commitment. If a term is unclear, ask questions and get help from a qualified, trusted adult.")
     ],"check":"Which comparison gives the clearest picture of loan cost?","options":["Monthly payment only","Total repayment, APR, fees, and term","The color of the offer","The first payment only"],"answer":1},
    {"id":"lesson-safety","topic":"Banking safety","title":"Build safer account habits","minutes":5,
     "level":"Starter","sections":[
      ("Protect access","Use unique passwords and multi-factor authentication where available. Never share a password or one-time verification code."),
      ("Verify independently","Do not trust an unexpected link or phone number in a message. Open the official app or use contact details you already trust."),
      ("Monitor activity","Transaction alerts and regular reviews can help you notice unfamiliar activity sooner."),
      ("Ask before acting","Pressure, secrecy, and unrealistic promises are warning signs. Pause and check with a trusted person.")
     ],"check":"A message asks for your verification code. What should you do?","options":["Send it if the message looks official","Never share it; verify through a trusted channel","Post it to ask if it is real","Reply with your password"],"answer":1},
    {"id":"lesson-investing","topic":"Investing","title":"Understand risk before return","minutes":7,
     "level":"Core","sections":[
      ("What investing means","Investing means buying assets with the hope of future value or income. The value can fall, and returns are not guaranteed."),
      ("Risk and time","Money needed soon usually has less time to recover from a decline. Time horizon should influence the amount of risk considered."),
      ("Diversification","Spreading exposure can reduce concentration risk. It does not remove all market risk or guarantee a positive result."),
      ("Costs matter","Fees, taxes, and trading costs can reduce returns. Understand the product before committing money.")
     ],"check":"What does diversification help reduce?","options":["Every possible loss","Concentration in one investment or exposure","All fees","The passage of time"],"answer":1},
    {"id":"lesson-scams","topic":"Scam detection","title":"Recognize manipulation before it works","minutes":4,
     "level":"Starter","sections":[
      ("Urgency","Scams may pressure you to act immediately so you do not have time to verify."),
      ("Secrecy","Requests to hide a transaction from family, a bank, or another trusted person are warning signs."),
      ("Unrealistic promises","Guaranteed high returns or easy money with no risk should be treated skeptically."),
      ("Verification","Stop. Do not send money or information. Independently verify the claim and ask for help.")
     ],"check":"Which is the strongest scam warning sign?","options":["Clear terms and time to review","Pressure to send a fee for guaranteed fast returns","A public company address","A receipt for a completed purchase"],"answer":1},
]

# =============================================================================
# INTERACTIVE LEARNING ENGINE
# =============================================================================

def learning_state():
    data = st.session_state.learning
    for key, value in DEFAULT_PROGRESS.items():
        data.setdefault(key, value.copy() if isinstance(value, (dict,list)) else value)
    return data

def award_xp(amount, reason):
    data = learning_state()
    data["xp"] = int(data.get("xp", 0)) + int(amount)
    data.setdefault("daily_activity", {})
    data["daily_activity"][today_iso()] = int(data["daily_activity"].get(today_iso(), 0)) + int(amount)
    save_learning()

def record_learning_day():
    data = learning_state()
    today = today_iso()
    last = data.get("last_day", "")
    if last != today:
        if last:
            try:
                gap = (date.today()-date.fromisoformat(last)).days
            except ValueError:
                gap = 999
            data["streak"] = int(data.get("streak",0))+1 if gap == 1 else 1
        else:
            data["streak"] = 1
        data["last_day"] = today
        save_learning()

def record_quiz_result(topic, correct, total, mode):
    data = learning_state()
    pct = round((correct/max(total,1))*100)
    data.setdefault("quiz_history", []).append({
        "date":datetime.now().isoformat(timespec="minutes"),
        "topic":topic,"correct":int(correct),"total":int(total),
        "percent":pct,"mode":mode
    })
    data["quiz_history"] = data["quiz_history"][-60:]
    data.setdefault("best_scores", {})
    data["best_scores"][topic] = max(pct, int(data["best_scores"].get(topic,0)))
    data.setdefault("mastery", {})
    prior = float(data["mastery"].get(topic, 0))
    data["mastery"][topic] = round(min(100, prior*.65 + pct*.35), 1)
    record_learning_day()
    award_xp(correct*10 + (20 if pct == 100 else 0), f"{mode} completed")
    if pct >= 80 and "sharp-mind" not in data["badges"]:
        data["badges"].append("sharp-mind")
    if len(data["quiz_history"]) >= 5 and "consistent-learner" not in data["badges"]:
        data["badges"].append("consistent-learner")
    save_learning()

def make_quiz(topic="All topics", difficulty="Mixed", count=10, mode="Practice"):
    pool = QUESTION_BANK[:]
    if topic != "All topics":
        pool = [q for q in pool if q["topic"] == topic]
    if difficulty != "Mixed":
        pool = [q for q in pool if q["level"] == difficulty]
    if not pool:
        pool = QUESTION_BANK[:]
    random.shuffle(pool)
    chosen = pool[:min(int(count),len(pool))]
    return {
        "topic":topic,"difficulty":difficulty,"mode":mode,"questions":chosen,
        "index":0,"answers":{},"submitted":False,"started":datetime.now().isoformat()
    }

def quiz_score(quiz):
    correct = 0
    for idx, answer in quiz["answers"].items():
        if answer == quiz["questions"][int(idx)]["answer"]:
            correct += 1
    return correct

def start_quiz(topic, difficulty, count, mode):
    st.session_state.quiz = make_quiz(topic, difficulty, count, mode)

def render_quiz():
    quiz = st.session_state.quiz
    if not quiz:
        return
    questions = quiz["questions"]
    idx = quiz["index"]
    total = len(questions)

    if quiz["submitted"]:
        correct = quiz_score(quiz)
        pct = round(correct/total*100) if total else 0
        st.markdown('<div class="eyebrow">SESSION REPORT</div>', unsafe_allow_html=True)
        st.title("Your results")
        a,b,c = st.columns(3)
        a.metric("Score", f"{pct}%")
        b.metric("Correct", f"{correct} / {total}")
        c.metric("XP earned", f"+{correct*10 + (20 if pct==100 else 0)}")
        if pct >= 90:
            st.success("Excellent command of the material. Review the explanations to reinforce the details.")
        elif pct >= 70:
            st.info("Good progress. Review the questions you missed, then try a new set.")
        else:
            st.warning("This is a starting point. Use the explanations as a study guide and retry when ready.")
        st.progress(pct/100)
        st.markdown("### Question-by-question review")
        for n, q in enumerate(questions, 1):
            selected = quiz["answers"].get(str(n-1))
            is_right = selected == q["answer"]
            with st.expander(f"{'✓' if is_right else '↺'} {n}. {q['q']}", expanded=not is_right):
                st.write("**Your answer:**", q["choices"][selected] if selected is not None else "Not answered")
                st.write("**Correct answer:**", q["choices"][q["answer"]])
                st.write(q["why"])
                st.caption("Key takeaway: " + q["takeaway"])
        if st.button("Build another session", type="primary", use_container_width=True):
            st.session_state.quiz = None
            st.rerun()
        return

    q = questions[idx]
    st.markdown(f'<div class="eyebrow">{quiz["mode"].upper()} · {quiz["topic"].upper()}</div>', unsafe_allow_html=True)
    st.progress((idx+1)/total, text=f"Question {idx+1} of {total}")
    st.markdown('<div class="question-card">', unsafe_allow_html=True)
    st.markdown(f'<div class="question-number">QUESTION {idx+1:02d} / {total:02d} · {q["topic"]} · {q["level"]}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="question-text">{q["q"]}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    key = f"quiz_answer_{quiz['started']}_{idx}"
    previous = quiz["answers"].get(str(idx))
    choice = st.radio(
        "Choose the strongest answer",
        options=list(range(len(q["choices"]))),
        format_func=lambda x: f"{chr(65+x)}. {q['choices'][x]}",
        index=previous if previous is not None else None,
        key=key,
        label_visibility="collapsed",
    )
    st.caption("Take your time. The explanation appears after you submit this question.")
    left, right = st.columns([1,1])
    with left:
        if idx > 0 and st.button("← Previous", use_container_width=True):
            quiz["index"] -= 1
            st.rerun()
    with right:
        label = "Finish session" if idx == total-1 else "Lock answer & continue →"
        if st.button(label, type="primary", use_container_width=True, disabled=choice is None):
            quiz["answers"][str(idx)] = int(choice)
            if idx == total-1:
                quiz["submitted"] = True
                correct = quiz_score(quiz)
                record_quiz_result(quiz["topic"], correct, total, quiz["mode"])
            else:
                quiz["index"] += 1
            st.rerun()

def render_learning_lab():
    st.markdown('<div class="eyebrow">CENTSIBLE ACADEMY</div>', unsafe_allow_html=True)
    st.title("Learning lab")
    st.markdown("Learn a concept, apply it to a decision, and prove you understand it. Every session gives you feedback—not just a score.")
    progress = learning_state()
    xp = int(progress.get("xp",0))
    level = xp//250 + 1
    next_level = level*250
    a,b,c,d = st.columns(4)
    a.metric("Learning level", f"Level {level}")
    b.metric("Total XP", f"{xp:,}")
    c.metric("Current streak", f"{progress.get('streak',0)} days")
    d.metric("Completed lessons", len(progress.get("completed",[])))
    st.progress((xp % 250)/250, text=f"{next_level-xp} XP to Level {level+1}")
    if st.session_state.quiz:
        render_quiz()
        return

    tab_quiz, tab_lessons, tab_scenario, tab_progress = st.tabs(
        ["⚡ Challenge center", "📚 Learning paths", "🧭 Decision simulator", "📈 My progress"]
    )
    with tab_quiz:
        st.markdown("### Challenge center")
        st.write("Choose a topic and difficulty. Practice mode gives instant learning context after each session; assessment mode builds a scored test with a full review.")
        topics = ["All topics"] + sorted(TOPIC_DESCRIPTIONS.keys())
        x,y,z = st.columns([1.2,1,1])
        topic = x.selectbox("Topic", topics, key="quiz_topic")
        difficulty = y.selectbox("Difficulty", ["Mixed","Starter","Core","Advanced"], key="quiz_difficulty")
        count = z.selectbox("Questions", [5,8,10,15,20], index=2, key="quiz_count")
        pool_size = len(QUESTION_BANK) if topic=="All topics" else len([q for q in QUESTION_BANK if q["topic"]==topic])
        st.caption(f"{pool_size} questions currently available in this selection. New sessions shuffle the question order.")
        p1,p2 = st.columns(2)
        with p1:
            st.markdown('<div class="feature-card"><span class="pill">PRACTICE</span><h4>Learn as you go</h4><p>Work through a focused set, then review every answer, explanation, and practical takeaway.</p></div>', unsafe_allow_html=True)
            if st.button("Start practice session", type="primary", use_container_width=True):
                start_quiz(topic,difficulty,count,"Practice")
                st.rerun()
        with p2:
            st.markdown('<div class="feature-card"><span class="pill">ASSESSMENT</span><h4>Test your understanding</h4><p>Complete a scored test without seeing the answer key until the end. Results include a topic breakdown and review.</p></div>', unsafe_allow_html=True)
            if st.button("Start assessment", use_container_width=True):
                start_quiz(topic,difficulty,count,"Assessment")
                st.rerun()
        st.markdown("#### Topic map")
        cols = st.columns(2)
        for i,(name,desc) in enumerate(TOPIC_DESCRIPTIONS.items()):
            with cols[i%2]:
                st.markdown(f'<div class="feature-card"><div class="panel-label">{name}</div><p>{desc}</p></div>',unsafe_allow_html=True)
    with tab_lessons:
        st.markdown("### Guided learning paths")
        completed = set(progress.get("completed",[]))
        for lesson in LESSONS:
            done = lesson["id"] in completed
            with st.expander(f"{'✓ ' if done else '○ '}{lesson['title']} · {lesson['minutes']} min · {lesson['level']}", expanded=False):
                st.caption(lesson["topic"])
                for heading,body in lesson["sections"]:
                    st.markdown(f"**{heading}**")
                    st.write(body)
                st.divider()
                st.markdown("**Knowledge check**")
                answer = st.radio(lesson["check"], list(range(len(lesson["options"]))),
                    format_func=lambda i, opts=lesson["options"]: f"{chr(65+i)}. {opts[i]}",
                    key=f"lesson_check_{lesson['id']}", index=None)
                if st.button("Check understanding", key=f"lesson_submit_{lesson['id']}"):
                    if answer is None:
                        st.warning("Choose an answer first.")
                    elif answer == lesson["answer"]:
                        if lesson["id"] not in completed:
                            progress["completed"].append(lesson["id"])
                            record_learning_day()
                            award_xp(35, "lesson completed")
                        st.success("Correct. Lesson completed. +35 XP")
                        save_learning()
                    else:
                        st.error("Not quite. Re-read the lesson and try the knowledge check again.")
    with tab_scenario:
        st.markdown("### Money decision simulator")
        st.write("Practice making trade-offs in a fictional situation. No real money is involved.")
        scenarios = [
            {"title":"The first paycheck","brief":"You receive a fictional $240 paycheck. Your planned needs cost $110, and you want to save $50.",
             "question":"How much remains for flexible spending and other goals?","choices":["$50","$80","$100","$130"],"answer":1,
             "explain":"$240 − $110 − $50 = $80. This is the amount remaining after the two planned allocations."},
            {"title":"The surprise expense","brief":"Your fictional budget has $40 of unassigned room. A necessary school expense costs $28.",
             "question":"What is the remaining unassigned amount?","choices":["$8","$12","$18","$28"],"answer":1,
             "explain":"$40 − $28 = $12. Updating the budget keeps the plan honest."},
            {"title":"The subscription audit","brief":"You pay $8 per month for a service you rarely use. You are reviewing recurring expenses.",
             "question":"What is the best first step?","choices":["Ignore it because it is small","Check usage, terms, and whether you still value it","Borrow to cover it","Assume cancelling is always free"],"answer":1,
             "explain":"Review value and cancellation terms before deciding. Small recurring expenses can add up, but the right choice depends on your needs."},
            {"title":"The suspicious offer","brief":"A stranger promises a guaranteed 40% return this week if you send a processing fee.",
             "question":"What should you do?","choices":["Send the fee","Ask for their password","Do not send money; independently verify and ask a trusted person","Send half the fee"],"answer":2,
             "explain":"Guaranteed rapid returns and upfront fees are serious warning signs. Do not share money or account information."},
        ]
        names = [s["title"] for s in scenarios]
        chosen_name = st.selectbox("Choose a scenario", names)
        scenario = next(s for s in scenarios if s["title"]==chosen_name)
        st.markdown(f'<div class="question-card"><div class="question-number">SIMULATED CASE</div><div class="question-text">{scenario["brief"]}</div></div>',unsafe_allow_html=True)
        st.markdown("**Your decision**")
        selected = st.radio(scenario["question"], list(range(len(scenario["choices"]))),
            format_func=lambda i: f"{chr(65+i)}. {scenario['choices'][i]}",
            key=f"scenario_{chosen_name}", index=None)
        if st.button("Evaluate my decision", type="primary"):
            if selected is None:
                st.warning("Choose an option first.")
            elif selected == scenario["answer"]:
                st.success("Strong decision.")
                award_xp(15,"scenario completed")
                st.write(scenario["explain"])
            else:
                st.warning("Review the reasoning and try again.")
                st.write(scenario["explain"])
    with tab_progress:
        st.markdown("### Your learning record")
        history = progress.get("quiz_history",[])
        if history:
            hist = pd.DataFrame(history)
            st.dataframe(hist[["date","topic","mode","correct","total","percent"]].sort_values("date",ascending=False),
                         use_container_width=True, hide_index=True)
            fig = px.line(hist.reset_index(), x="index", y="percent", color="topic",
                          markers=True, labels={"index":"Attempt","percent":"Score","topic":"Topic"})
            fig.update_layout(template="plotly_dark",paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",height=300,margin=dict(l=10,r=10,t=20,b=10),
                font_color="#dce3e9",legend_title_text="")
            st.plotly_chart(fig,use_container_width=True)
        else:
            st.info("Complete a quiz or assessment to build your learning record.")
        mastery = progress.get("mastery",{})
        if mastery:
            st.markdown("#### Topic mastery")
            for name,value in sorted(mastery.items(),key=lambda x:x[1],reverse=True):
                st.write(f"**{name}** · {value:.0f}%")
                st.progress(min(1,float(value)/100))
        badges = progress.get("badges",[])
        st.markdown("#### Achievements")
        badge_names = {"sharp-mind":"Sharp Mind · Scored 80% or higher","consistent-learner":"Consistent Learner · Completed five sessions"}
        if badges:
            for badge in badges:
                st.markdown(f'<span class="pill">✦ {badge_names.get(badge,badge)}</span>',unsafe_allow_html=True)
        else:
            st.caption("Achievements unlock as you learn.")

# =============================================================================
# NAVIGATION & SHARED UI
# =============================================================================

def set_page(page):
    st.session_state.page = page
    st.rerun()

def top_navigation():
    current = st.session_state.page
    left, middle, right = st.columns([1.15,4.2,1.3])
    with left:
        st.markdown("### ✦ Centsible")
        st.caption("MONEY, MADE CLEARER")
    with middle:
        st.markdown('<div class="nav-caption">WORKSPACE</div>',unsafe_allow_html=True)
        with st.popover(f"☰  {current}  ·  Open menu", use_container_width=True):
            st.markdown("**Navigate Centsible**")
            for item in NAV_ITEMS:
                label = ("✓  " if item==current else "") + item
                if st.button(label, key=f"nav_{item}", use_container_width=True):
                    set_page(item)
    with right:
        st.markdown("<div style='text-align:right;padding-top:8px'><span class='pill'>DEMO MODE</span></div>",unsafe_allow_html=True)
    st.divider()

def page_header(kicker, title, subtitle):
    st.markdown(f'<div class="hero"><div class="eyebrow">{kicker}</div><h1>{title}</h1><p>{subtitle}</p></div>',unsafe_allow_html=True)

def metric_panel(label, value, note=""):
    st.markdown(f'<div class="panel"><div class="panel-label">{label}</div><div class="panel-value">{value}</div><div class="panel-note">{note}</div></div>',unsafe_allow_html=True)

def empty_state(title, message):
    st.markdown(f'<div class="callout"><b>{title}</b><p style="margin:.35rem 0 0;color:#aab6c1">{message}</p></div>',unsafe_allow_html=True)

def recent_activity(limit=6):
    frame = transactions()
    if frame.empty:
        empty_state("No activity yet","Add a transaction to see it here.")
        return
    frame = frame.sort_values("Date",ascending=False).head(limit)
    for _,row in frame.iterrows():
        sign = "+" if row["Type"]=="Income" else ("−" if row["Type"]=="Expense" else "↗")
        color = "#69c99e" if row["Type"]=="Income" else ("#e69a9a" if row["Type"]=="Expense" else "#9eb9d0")
        st.markdown(
            f'<div class="panel" style="padding:12px 15px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">'
            f'<div><b>{row["Description"]}</b><div class="muted">{row["Category"]} · {row["Date"]}</div></div>'
            f'<b style="color:{color}">{sign}{money(row["Amount"])}</b></div>',
            unsafe_allow_html=True
        )

# =============================================================================
# PAGE: OVERVIEW
# =============================================================================

def page_overview():
    page_header("YOUR MONEY COMMAND CENTER","Make every dollar make sense.",
        "A clear view of what came in, what went out, what you are building, and what needs attention.")
    frame = transactions()
    month = monthly_frame(frame)
    month_totals = totals(month)
    all_totals = totals(frame)
    a,b,c,d = st.columns(4)
    with a: metric_panel("INCOME THIS MONTH",money(month_totals["income"]),"Recorded income")
    with b: metric_panel("SPENDING THIS MONTH",money(month_totals["expenses"]),"Recorded expenses")
    with c: metric_panel("SAVED THIS MONTH",money(month_totals["savings"]),"Recorded savings contributions")
    with d: metric_panel("NET CASH FLOW",money(month_totals["cashflow"]),"Income minus expenses")
    st.write("")
    left,right = st.columns([1.45,1])
    with left:
        st.markdown("### Spending overview")
        cats = category_spending(month)
        if cats.empty:
            empty_state("Your chart is ready","Add expenses to see where your money is going.")
        else:
            fig = px.pie(cats,names="Category",values="Amount",hole=.68,
                         color_discrete_sequence=["#7f9aaf","#9eabb5","#6f8799","#c1b9a8","#788c7c","#b78f86","#8b8c9d"])
            fig.update_traces(textposition="inside",textinfo="percent",textfont_color="#10161c",
                              marker=dict(line=dict(color="#151b21",width=2)))
            fig.update_layout(height=340,margin=dict(t=8,b=8,l=8,r=8),
                paper_bgcolor="rgba(0,0,0,0)",plot_bgcolor="rgba(0,0,0,0)",
                font_color="#e5ebf0",legend=dict(orientation="h",y=-.1),
                showlegend=True)
            st.plotly_chart(fig,use_container_width=True)
    with right:
        st.markdown("### Upcoming payments")
        upcoming = sorted([p for p in st.session_state.payments if not p.get("paid")],key=lambda p:p.get("due",""))[:5]
        if not upcoming:
            empty_state("All clear","No upcoming payments are listed.")
        for payment in upcoming:
            status,_ = due_status(payment.get("due",""))
            st.markdown(f'<div class="panel" style="padding:13px 15px;margin-bottom:9px"><div style="display:flex;justify-content:space-between;gap:12px"><b>{payment["name"]}</b><b>{money(payment["amount"])}</b></div><div class="muted">{status} · {payment.get("frequency","One-time")}</div></div>',unsafe_allow_html=True)
        if st.button("Manage payments →",use_container_width=True):
            set_page("Payments")
    st.markdown("### Recent activity")
    recent_activity()
    st.markdown("### Keep building your money skills")
    x,y,z = st.columns(3)
    with x:
        st.markdown('<div class="feature-card"><div class="panel-label">LEARN</div><h4>Learning lab</h4><p>Interactive lessons, scenario challenges, and scored assessments.</p></div>',unsafe_allow_html=True)
        if st.button("Open learning lab",key="overview_learn",use_container_width=True): set_page("Learning lab")
    with y:
        st.markdown('<div class="feature-card"><div class="panel-label">PLAN</div><h4>Budget studio</h4><p>Set category limits and compare them with recorded spending.</p></div>',unsafe_allow_html=True)
        if st.button("Open budget studio",key="overview_budget",use_container_width=True): set_page("Budget studio")
    with z:
        st.markdown('<div class="feature-card"><div class="panel-label">BUILD</div><h4>Savings goals</h4><p>Turn a target into a clear contribution plan.</p></div>',unsafe_allow_html=True)
        if st.button("Open savings goals",key="overview_goals",use_container_width=True): set_page("Savings goals")

# =============================================================================
# PAGE: TRANSACTIONS
# =============================================================================

def page_transactions():
    page_header("ACTIVITY LEDGER","Transactions","Record income, expenses, and savings contributions. This prototype uses manual entries only.")
    tab_add,tab_history = st.tabs(["＋ Add transaction","Transaction history"])
    with tab_add:
        with st.form("transaction_form",clear_on_submit=True):
            a,b = st.columns(2)
            desc = a.text_input("Description",placeholder="e.g. Weekend earnings, lunch, supplies")
            when = b.date_input("Date",value=date.today())
            c,d,e = st.columns(3)
            kind = c.selectbox("Transaction type",TX_TYPES)
            amount = d.number_input("Amount ($)",min_value=.01,value=12.00,step=1.00)
            category = e.selectbox("Category",CATEGORIES)
            method = st.selectbox("Payment method",["Manual entry","Centsible demo card","Cash","Other"])
            code = st.text_input("Demo card code (only for demo-card purchases)",placeholder=DEMO_CARD_CODE) if method=="Centsible demo card" else ""
            submitted = st.form_submit_button("Save transaction",type="primary",use_container_width=True)
            if submitted:
                if not desc.strip():
                    st.error("Enter a description.")
                elif method=="Centsible demo card" and code.strip().upper()!=DEMO_CARD_CODE:
                    st.error("Enter the demo code shown on the My demo card page.")
                else:
                    add_transaction(desc,category,amount,kind,when,
                        "Centsible demo card" if method=="Centsible demo card" else method,
                        DEMO_CARD_CODE if method=="Centsible demo card" else "")
                    st.success("Transaction saved.")
                    st.rerun()
    with tab_history:
        frame = transactions().sort_values("Date",ascending=False)
        if frame.empty:
            empty_state("No transactions","Add your first entry to start the ledger.")
        else:
            filter_col,search_col = st.columns([1,2])
            chosen_type = filter_col.selectbox("Filter by type",["All"]+TX_TYPES)
            search = search_col.text_input("Search description or category")
            shown = frame.copy()
            if chosen_type!="All": shown=shown[shown.Type==chosen_type]
            if search.strip():
                mask = shown.astype(str).apply(lambda col:col.str.contains(search,case=False,na=False)).any(axis=1)
                shown=shown[mask]
            st.dataframe(shown.drop(columns=["ID"]),use_container_width=True,hide_index=True)
            st.download_button("Export visible transactions",shown.drop(columns=["ID"]).to_csv(index=False).encode(),
                               "centsible_transactions.csv","text/csv")
            with st.expander("Remove a transaction"):
                options = {f'{r["Date"]} · {r["Description"]} · {money(r["Amount"])}':r["ID"] for _,r in shown.iterrows()}
                if options:
                    label = st.selectbox("Choose entry",list(options))
                    if st.button("Delete selected entry"):
                        remove_transaction(options[label])
                        st.success("Transaction deleted.")
                        st.rerun()
        st.caption("Use fictional sample data for demonstrations. Do not enter bank passwords, account numbers, or private financial details.")

# =============================================================================
# PAGE: BUDGET STUDIO
# =============================================================================

def page_budget():
    page_header("PLAN WITH INTENTION","Budget studio","Create category limits, track actual spending, and see where your plan needs adjustment.")
    spent = category_spending(monthly_frame())
    spent_map = dict(zip(spent.Category,spent.Amount)) if not spent.empty else {}
    budgets = st.session_state.budgets
    total_budget = sum(float(v) for v in budgets.values())
    total_spent = sum(float(spent_map.get(k,0)) for k in budgets)
    a,b,c = st.columns(3)
    a.metric("Planned category limits",money(total_budget))
    b.metric("Tracked spending",money(total_spent))
    c.metric("Remaining category budget",money(total_budget-total_spent))
    st.markdown("### Category performance")
    for category,limit in budgets.items():
        limit = float(limit)
        used = float(spent_map.get(category,0))
        ratio = used/limit if limit>0 else 0
        label = "Over limit" if ratio>1 else ("Near limit" if ratio>=.8 else "On track")
        color = "#e69a9a" if ratio>1 else ("#e4c27a" if ratio>=.8 else "#8eb7a2")
        st.markdown(f'<div style="display:flex;justify-content:space-between;gap:10px"><b>{category}</b><span style="color:{color}">{money(used)} / {money(limit)} · {label}</span></div>',unsafe_allow_html=True)
        st.progress(min(ratio,1.0) if limit>0 else 0)
    st.divider()
    with st.expander("Edit monthly category limits",expanded=True):
        with st.form("budget_editor"):
            updated = {}
            cols = st.columns(3)
            for i,category in enumerate(list(budgets.keys())):
                with cols[i%3]:
                    updated[category]=st.number_input(f"{category} limit ($)",min_value=0.0,
                        value=float(budgets[category]),step=5.0,key=f"budget_{category}")
            new_category = st.selectbox("Add a category",["None"]+[c for c in CATEGORIES if c not in budgets])
            new_limit = st.number_input("New category limit ($)",min_value=0.0,value=50.0,step=5.0)
            if st.form_submit_button("Save budget"):
                if new_category!="None": updated[new_category]=new_limit
                st.session_state.budgets=updated
                save_budgets()
                st.success("Budget updated.")
                st.rerun()
    if not spent.empty:
        st.markdown("### Actual spending by category")
        fig=px.bar(spent,x="Category",y="Amount",text_auto=".2f",
            color="Category",color_discrete_sequence=["#7892a7","#9eabb5","#718a9a","#c1b9a8","#788c7c","#b78f86"])
        fig.update_layout(template="plotly_dark",paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",font_color="#e5ebf0",showlegend=False,
            height=320,margin=dict(t=15,b=10,l=10,r=10))
        st.plotly_chart(fig,use_container_width=True)

# =============================================================================
# PAGE: SAVINGS GOALS
# =============================================================================

def page_goals():
    page_header("FUTURE YOU","Savings goals","Give your goals a target, a timeline, and a contribution plan.")
    goals = st.session_state.goals
    with st.expander("＋ Create a savings goal",expanded=not bool(goals)):
        with st.form("goal_form",clear_on_submit=True):
            a,b,c = st.columns(3)
            name=a.text_input("Goal name",placeholder="e.g. New laptop")
            target=b.number_input("Target amount ($)",min_value=1.0,value=300.0,step=10.0)
            saved=c.number_input("Already saved ($)",min_value=0.0,value=0.0,step=5.0)
            deadline=st.date_input("Target date",value=date.today()+timedelta(days=120))
            if st.form_submit_button("Create goal",type="primary"):
                if not name.strip(): st.error("Give your goal a name.")
                elif saved>target: st.error("Already saved cannot exceed the target.")
                else:
                    goals.append({"id":uuid.uuid4().hex[:8],"name":name.strip(),"target":target,
                                  "saved":saved,"deadline":str(deadline),"created":today_iso()})
                    save_goals()
                    st.success("Goal created.")
                    st.rerun()
    if not goals:
        empty_state("Your next goal starts here","Create a goal above to see your progress and suggested contribution pace.")
    for goal in goals:
        target=float(goal["target"]); saved=float(goal["saved"])
        remaining=max(0,target-saved); pct=min(1,saved/target) if target else 0
        try:
            days=max(0,(date.fromisoformat(goal["deadline"])-date.today()).days)
        except ValueError:
            days=0
        monthly=remaining/(max(days,1)/30.4375)
        with st.container(border=True):
            top1,top2=st.columns([3,1])
            top1.markdown(f"### {goal['name']}")
            top1.caption(f"Target date: {goal['deadline']} · {days} days remaining")
            top2.metric("Progress",f"{pct*100:.0f}%")
            st.progress(pct)
            m1,m2,m3=st.columns(3)
            m1.metric("Saved",money(saved))
            m2.metric("Still needed",money(remaining))
            m3.metric("Suggested monthly pace",money(monthly))
            with st.form(f"contribute_{goal['id']}"):
                amount=st.number_input("Add contribution ($)",min_value=.01,value=10.0,step=5.0,key=f"contrib_{goal['id']}")
                add,delete=st.columns(2)
                do_add=add.form_submit_button("Add contribution")
                do_delete=delete.form_submit_button("Delete goal")
                if do_add:
                    goal["saved"]=min(target,saved+amount)
                    save_goals()
                    st.success("Contribution added.")
                    st.rerun()
                if do_delete:
                    st.session_state.goals=[g for g in goals if g["id"]!=goal["id"]]
                    save_goals()
                    st.rerun()

# =============================================================================
# PAGE: PAYMENTS
# =============================================================================

def page_payments():
    page_header("STAY AHEAD","Payments","Keep track of recurring and one-time costs before they are due.")
    with st.form("payment_form",clear_on_submit=True):
        a,b=st.columns(2)
        name=a.text_input("Payment name",placeholder="e.g. Subscription")
        amount=b.number_input("Amount ($)",min_value=.01,value=10.0,step=1.0)
        c,d=st.columns(2)
        due=c.date_input("Due date",value=date.today()+timedelta(days=7))
        frequency=d.selectbox("Frequency",["One-time","Weekly","Monthly","Yearly"])
        if st.form_submit_button("Add payment",type="primary"):
            if not name.strip(): st.error("Enter a payment name.")
            else:
                st.session_state.payments.append({"id":uuid.uuid4().hex[:8],"name":name.strip(),
                    "amount":amount,"due":str(due),"frequency":frequency,"paid":False})
                save_payments()
                st.success("Payment added.")
                st.rerun()
    unpaid=sorted([p for p in st.session_state.payments if not p.get("paid")],key=lambda p:p.get("due",""))
    paid=sorted([p for p in st.session_state.payments if p.get("paid")],key=lambda p:p.get("paid_date",""),reverse=True)
    st.markdown("### Upcoming")
    if not unpaid: empty_state("No upcoming payments","Add a payment above to track it.")
    for payment in unpaid:
        status,kind=due_status(payment.get("due",""))
        with st.container(border=True):
            a,b,c=st.columns([3,1,1])
            a.markdown(f"**{payment['name']}**")
            a.caption(f"{status} · {payment.get('frequency','One-time')}")
            b.metric("Amount",money(payment["amount"]))
            if c.button("Mark paid",key=f"paid_{payment['id']}"):
                payment["paid"]=True
                payment["paid_date"]=today_iso()
                save_payments()
                st.rerun()
    st.markdown("### Payment history")
    if not paid: st.caption("Payments marked as paid appear here.")
    for payment in paid[:12]:
        st.markdown(f'<div class="panel" style="padding:12px 15px;margin-bottom:8px"><b>{payment["name"]}</b> · {money(payment["amount"])} <span class="muted">· Paid {payment.get("paid_date","")}</span></div>',unsafe_allow_html=True)

# =============================================================================
# PAGE: DEMO CARD
# =============================================================================

def page_card():
    page_header("SIMULATED PAYMENT EXPERIENCE","My demo card","A visual prototype for manually tagging purchases. It is not a payment card and cannot connect to a card network.")
    frame=transactions()
    card_tx=frame[frame["Card code"].astype(str)==DEMO_CARD_CODE]
    spent=float(card_tx.loc[card_tx.Type=="Expense","Amount"].sum())
    st.markdown(f"""
    <div style="max-width:760px;min-height:260px;border-radius:24px;padding:26px;
      background:linear-gradient(135deg,#27313a 0%,#3b4a56 55%,#647687 100%);
      border:1px solid #8495a4;box-shadow:0 20px 55px rgba(0,0,0,.25);
      display:flex;flex-direction:column;justify-content:space-between">
      <div style="display:flex;justify-content:space-between;align-items:center">
       <div style="font-family:Space Grotesk;font-weight:800;letter-spacing:.18em">CENTSIBLE</div>
       <div style="font-size:1.5rem">✦</div>
      </div>
      <div><div style="font-size:.72rem;letter-spacing:.16em;color:#d6e0e8">DEMO IDENTIFIER</div>
       <div style="font-family:Space Grotesk;font-size:1.8rem;font-weight:700;letter-spacing:.06em">CENTSIBLE-0001</div></div>
      <div style="display:flex;justify-content:space-between">
       <div><div style="font-size:.65rem;color:#d6e0e8">CARDHOLDER</div><b>DEMO USER</b></div>
       <div><div style="font-size:.65rem;color:#d6e0e8">STATUS</div><b>ACTIVE · SIMULATED</b></div>
      </div>
    </div>""",unsafe_allow_html=True)
    st.warning("CENTSIBLE-0001 is an internal demo code—not a debit or credit card number. It cannot be used at stores, authorize payments, or read purchases automatically.")
    a,b=st.columns(2)
    a.metric("Demo-card spending",money(spent))
    b.metric("Tagged purchases",len(card_tx[card_tx.Type=="Expense"]))
    with st.form("card_purchase",clear_on_submit=True):
        st.markdown("### Record a simulated purchase")
        x,y=st.columns(2)
        description=x.text_input("Merchant or purchase",placeholder="e.g. Bookstore")
        amount=y.number_input("Amount ($)",min_value=.01,value=12.0,step=1.0)
        c,d=st.columns(2)
        category=c.selectbox("Category",CATEGORIES)
        when=d.date_input("Purchase date",value=date.today())
        code=st.text_input("Enter the demo code",placeholder=DEMO_CARD_CODE)
        if st.form_submit_button("Record demo purchase",type="primary"):
            if code.strip().upper()!=DEMO_CARD_CODE: st.error("The demo code does not match.")
            elif not description.strip(): st.error("Enter a purchase description.")
            else:
                add_transaction(description,category,amount,"Expense",when,"Centsible demo card",DEMO_CARD_CODE)
                st.success("Purchase recorded in the local demo ledger.")
                st.rerun()
    st.markdown("### Demo-card activity")
    if card_tx.empty: st.caption("No purchases tagged with this demo code yet.")
    else: st.dataframe(card_tx.drop(columns=["ID"]).sort_values("Date",ascending=False),use_container_width=True,hide_index=True)

# =============================================================================
# PAGE: SETTINGS & DATA CONTROLS
# =============================================================================

def page_settings():
    page_header("CONTROL CENTER","Settings & data","Manage your local prototype data, display preferences, and demo environment.")
    settings=st.session_state.settings
    with st.form("settings_form"):
        name=st.text_input("Display name",value=settings.get("display_name","Learner"))
        income=st.number_input("Optional monthly income reference ($)",min_value=0.0,
            value=float(settings.get("monthly_income",0)),step=25.0)
        if st.form_submit_button("Save preferences"):
            st.session_state.settings={"display_name":name.strip() or "Learner","monthly_income":income}
            save_settings()
            st.success("Preferences saved.")
    st.markdown("### Data management")
    st.write("Centsible stores prototype data in JSON and CSV files inside the project's `data` folder. In a public product, this must be replaced with authenticated, per-user storage and appropriate security controls.")
    a,b=st.columns(2)
    with a:
        export = transactions().drop(columns=["ID"]).to_csv(index=False).encode()
        st.download_button("Download transaction CSV",export,"centsible_export.csv","text/csv",use_container_width=True)
    with b:
        snapshot={
            "transactions":transactions().drop(columns=["ID"]).to_dict(orient="records"),
            "budgets":st.session_state.budgets,"goals":st.session_state.goals,
            "payments":st.session_state.payments,"learning":learning_state(),
            "settings":st.session_state.settings
        }
        st.download_button("Download demo backup JSON",json.dumps(snapshot,indent=2).encode(),
            "centsible_backup.json","application/json",use_container_width=True)
    with st.expander("Reset demo data",expanded=False):
        st.warning("This deletes the local demo ledger, goals, budgets, payments, and learning progress for this project workspace.")
        confirm=st.checkbox("I understand this will reset the prototype data.")
        if st.button("Reset all demo data",disabled=not confirm):
            for file in [TX_FILE,BUDGET_FILE,GOALS_FILE,PAYMENTS_FILE,PROGRESS_FILE]:
                if file.exists(): file.unlink()
            for key in ["transactions","budgets","goals","payments","learning","quiz","test"]:
                if key in st.session_state: del st.session_state[key]
            init_state()
            st.success("Demo data reset.")
            st.rerun()
    st.markdown("### Prototype boundaries")
    st.markdown("""
    - No bank connection or payment processing is implemented.
    - The demo card is a manual tagging feature, not a real card.
    - Data files are local to this project workspace; this is not a multi-user production database.
    - Do not enter real banking credentials, account numbers, or sensitive financial information.
    - A public launch needs authentication, per-user data isolation, secure server-side storage, privacy review, and appropriate adult/professional oversight.
    """)

# =============================================================================
# APP ROUTER
# =============================================================================

top_navigation()
page = st.session_state.page

if page == "Overview":
    page_overview()
elif page == "Transactions":
    page_transactions()
elif page == "Budget studio":
    page_budget()
elif page == "Savings goals":
    page_goals()
elif page == "Payments":
    page_payments()
elif page == "Learning lab":
    render_learning_lab()
elif page == "My demo card":
    page_card()
elif page == "Settings":
    page_settings()
else:
    st.session_state.page="Overview"
    st.rerun()

st.divider()
st.markdown(
    f"<div style='display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#7f8b96;font-size:.75rem'>"
    f"<span>✦ CENTSIBLE · VERSION {APP_VERSION}</span>"
    f"<span>Financial education prototype · Demo data only · Not financial advice</span></div>",
    unsafe_allow_html=True
)

