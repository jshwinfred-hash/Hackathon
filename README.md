# Centsible – Money that makes sense

**Track:** Finance

**Team:** Joshua, Jason, Zach

## The Problem

Many people struggle to manage their money effectively because they do not always know how much they are spending, how much they should be saving, or whether they can afford the things they want to buy. Without a clear understanding of their financial situation, it can be difficult to set realistic savings goals and develop responsible spending habits. Centsible addresses this problem by providing users with a simple and interactive way to understand, organize, and manage their personal finances.

## What We Built

We built **Centsible**, a personal finance management application designed to act as a personal money coach. The application helps users track their income, expenses, savings, financial goals, and planned purchases in one place.

One of its main features is the Insights page, which transforms the user's financial information into understandable summaries, charts, progress updates, and personalized recommendations.

Centsible includes several key features:

- **Money Overview:** Displays available money, total money, total savings, and total expenses, giving users a quick understanding of their financial situation.
- **Savings Goals:** Allows users to create financial goals, monitor how much they have saved, and track their progress using visual progress bars.
- **Wishlist:** Allows users to record items they want to purchase and checks whether those items fit within their available balance.
- **Spending Analysis:** Uses pie charts and bar charts to show spending by category and monthly expenses. It also identifies the user's biggest spending category.
- **Personalized Financial Advice:** Provides suggestions based on the user's financial situation, including recommendations to control spending, prioritize savings, and plan purchases.
- **Future Savings Calculator:** Allows users to experiment with weekly savings amounts and different time periods to estimate their potential future savings.

The application takes financial information entered and stored by the user and turns it into useful insights that can help them make more informed financial decisions.

## How It Works

**Data:**

Centsible uses financial information stored in a database. The Insights page retrieves information from several database tables, including transactions and wishlist items, as well as the user's savings goals.

The application uses the following information:

- Income and expenses to calculate the user's financial overview.
- Savings contributions and targets to measure savings progress.
- Wishlist items and their prices to determine affordability.
- Transaction dates, amounts, and categories to analyze spending habits.

The data is processed using Python and Pandas. Transactions are grouped by category and month to make spending patterns easier to understand. The code also checks whether financial goals have been completed and calculates how much money is still needed to reach them.

**Model and Technology:**

Instead of using a machine-learning model, Centsible uses rule-based calculations and conditional logic to generate financial recommendations.

The application uses:

- **Python:** Handles calculations, financial logic, and data processing.
- **Streamlit:** Provides the interactive user interface and displays financial information.
- **Pandas:** Organizes, filters, and analyzes financial data.
- **Plotly Express:** Creates interactive visualizations, including pie charts and bar charts.
- **SQL Database:** Stores and retrieves transactions, wishlist items, and savings goal information.

The recommendation system checks the user's available balance, savings progress, wishlist, income, and expenses. It then uses predefined conditions to generate relevant financial advice.

This approach was chosen because it allows Centsible to provide understandable, personalized recommendations without requiring a complicated machine-learning model.

## Results

The Insights page successfully brings several areas of personal finance management together into one dashboard.

Centsible provides users with a clear overview of their finances, displays progress toward savings goals, identifies affordable wishlist purchases, and highlights spending patterns through visual charts.

The recommendation system can identify situations such as:

- When the user's available balance becomes negative.
- When the user has a limited amount of money available.
- When a savings goal is close to completion.
- When the user has completed all current savings goals.
- When expenses are higher than recorded income.
- When a wishlist purchase could affect existing savings plans.

The Future Savings Calculator also allows users to see how consistent weekly savings could increase their total savings over time.

Overall, Centsible demonstrates how financial information can be transformed into useful insights that encourage better money-management habits.

**Limitations:** The recommendations are based on predefined rules rather than machine learning. Their accuracy depends on the financial information entered by the user. The application also does not guarantee future savings results, since actual income and expenses may change.

No formal accuracy score, baseline comparison, or held-out test results are provided because the project uses a rule-based recommendation system rather than a trained predictive model.

## What We'd Do Next

With more time, we would improve Centsible by introducing additional features and making its financial recommendations more advanced.

1. **Improve Financial Recommendations:** Develop a more advanced recommendation system that can recognize spending patterns over time and provide suggestions based on a user's previous financial activity.

2. **Add Budget Planning:** Allow users to set spending limits for different categories, such as food, entertainment, and shopping. The application could then notify users when they are approaching or exceeding their budgets.

3. **Add Financial Trends:** Introduce more detailed charts that compare spending and savings over longer periods, helping users understand how their financial habits change.

4. **Improve Goal Planning:** Allow users to set target dates for their savings goals and estimate how much they need to save regularly to reach them.

These improvements would make Centsible an even more useful tool for helping people understand their money and build better financial habits.

## Sources

The project is based on the team's own application code and its implementation of personal finance management features.

**Technologies and documentation:**

- Python: https://www.python.org/
- Streamlit: https://docs.streamlit.io/
- Pandas: https://pandas.pydata.org/docs/
- Plotly: https://plotly.com/python/
- SQL: https://www.sqlite.org/docs.html

No external financial dataset or pretrained AI model is identified in the provided code.
