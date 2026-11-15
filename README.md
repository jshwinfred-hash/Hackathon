
elif page == "Insights":
    st.subheader("Your Personal Money Coach")
    st.write(
        "See where your money is going, how close you are to your goals, "
        "and what steps could help you make progress."
    )

    # Get the latest information
    income, expenses, saved, total, available = totals()
    goals_df = get_goal_progress()
    wishlist = read_df("SELECT * FROM wishlist ORDER BY price")
    transactions = read_df("SELECT * FROM transactions ORDER BY tx_date")

    # MONEY OVERVIEW
    st.markdown("## 💰 Your Money Overview")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Available Money", money(available))
    c2.metric("Total Money", money(total))
    c3.metric("Total Savings", money(saved))
    c4.metric("Total Expenses", money(expenses))

    st.caption(
        "Available money is your balance after purchases and savings contributions."
    )

    st.divider()

    # SAVINGS GOALS
    st.markdown("## 🎯 Your Savings Goals")

    if goals_df.empty:
        st.info(
            "You haven't created a savings goal yet. "
            "Create one in Savings Goals to give your money a purpose."
        )
    else:
        goal_target = float(goals_df["target"].sum())
        goal_saved = float(goals_df["saved"].sum())
        remaining = max(goal_target - goal_saved, 0)

        a, b, c = st.columns(3)
        a.metric("Goal Amount", money(goal_target))
        b.metric("Saved So Far", money(goal_saved))
        c.metric("Still Needed", money(remaining))

        for _, goal in goals_df.iterrows():
            target = float(goal["target"])
            current = float(goal["saved"])
            progress = min(current / target, 1)

            st.write(
                f"**{goal['name']}** — "
                f"{money(current)} / {money(target)}"
            )
            st.progress(progress)

            if progress >= 1:
                st.success(f"You reached your {goal['name']} goal!")
            elif progress >= 0.75:
                st.info("You're close! Keep following your savings plan.")
            elif progress >= 0.40:
                st.write("You're making progress. Keep building your savings.")
            else:
                st.write("This goal needs more saving to reach its target.")

    st.divider()

    # WISHLIST
    st.markdown("## 🛍️ Your Wishlist")

    if wishlist.empty:
        st.info(
            "Your wishlist is empty. Add items to see which purchases "
            "fit your current budget."
        )
    else:
        affordable = wishlist[wishlist["price"] <= available]
        not_affordable = wishlist[wishlist["price"] > available]

        w1, w2 = st.columns(2)
        w1.metric("Wishlist Items", len(wishlist))
        w2.metric("Affordable Right Now", len(affordable))

        for _, item in wishlist.iterrows():
            price = float(item["price"])

            if price <= available:
                st.success(
                    f"**{item['name']}** — {money(price)} — "
                    "Fits your available balance."
                )
            else:
                difference = price - available
                st.warning(
                    f"**{item['name']}** — {money(price)} — "
                    f"You need {money(difference)} more."
                )

        if len(affordable) > 0:
            st.info(
                "Suggestion: Just because you can afford an item doesn't "
                "mean you need to buy it. Check your savings goals first."
            )

    st.divider()

    # SPENDING ANALYSIS
    st.markdown("## 📊 Where Your Money Goes")

    expense_data = transactions[
        transactions["kind"] == "Expense"
    ].copy() if not transactions.empty else pd.DataFrame()

    if expense_data.empty:
        st.info("Record some purchases to unlock your spending analysis.")
    else:
        expense_data["tx_date"] = pd.to_datetime(
            expense_data["tx_date"]
        )
        category_data = (
            expense_data.groupby("category")["amount"]
            .sum()
            .reset_index()
        )

        monthly_data = (
            expense_data.assign(
                Month=expense_data["tx_date"].dt.strftime("%B %Y")
            )
            .groupby("Month")["amount"]
            .sum()
            .reset_index()
        )

        col1, col2 = st.columns(2)

        with col1:
            fig = px.pie(
                category_data,
                names="category",
                values="amount",
                hole=0.45,
                title="Spending by Category"
            )
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            fig = px.bar(
                monthly_data,
                x="Month",
                y="amount",
                title="Monthly Spending",
                labels={"amount": "Money Spent ($)"}
            )
            st.plotly_chart(fig, use_container_width=True)

        st.markdown("### Your biggest spending category")

        biggest = category_data.sort_values(
            "amount", ascending=False
        ).iloc[0]

        st.write(
            f"You spend the most on **{biggest['category']}**, "
            f"at {money(biggest['amount'])}."
        )

        st.info(
            "Suggestion: Review this category and see whether there are "
            "any purchases you could reduce."
        )

    st.divider()

    # PERSONALIZED ADVICE
    st.markdown("## 🧠 What Should You Do With Your Money?")

    advice = []

    if available < 0:
        advice.append(
            ("Review your savings allocations",
             "Your current savings allocations are greater than your "
             "available money. Consider reducing contributions until "
             "your balance is positive.")
        )
    elif available < 25:
        advice.append(
            ("Protect your remaining balance",
             "You have less than $25 available. Consider postponing "
             "optional purchases and keeping some money available.")
        )
    else:
        advice.append(
            ("Plan before spending",
             f"You have {money(available)} available. Decide how much "
             "you want to keep for spending and how much you want to save.")
        )

    if not goals_df.empty:
        unfinished = goals_df[
            goals_df["saved"] < goals_df["target"]
        ]

        if not unfinished.empty:
            closest = unfinished.assign(
                left=unfinished["target"] - unfinished["saved"]
            ).sort_values("left").iloc[0]

            advice.append(
                ("Focus on your closest savings goal",
                 f"Your {closest['name']} goal needs "
                 f"{money(closest['left'])} more. Consider making "
                 "this your next savings priority.")
            )
        else:
            advice.append(
                ("Celebrate your completed goals",
                 "All your current savings goals have reached their "
                 "targets. You could create a new goal for your next priority.")
            )
    else:
        advice.append(
            ("Create a savings goal",
             "Choose something you want to save for and give it a target amount.")
        )

    if not wishlist.empty:
        cheapest = wishlist.sort_values("price").iloc[0]

        advice.append(
            ("Think before buying",
             f"Your least expensive wishlist item is "
             f"{cheapest['name']} at {money(cheapest['price'])}. "
             "Check whether buying it would affect your savings plans.")
        )
    else:
        advice.append(
            ("Start a wishlist",
             "Add things you want to buy so you can plan for them instead "
             "of spending without a plan.")
        )

    if expenses > income and income > 0:
        advice.append(
            ("Review your spending",
             "Your recorded expenses are higher than your recorded income. "
             "Look through your transactions and consider adjusting your budget.")
        )

    for number, (heading, message) in enumerate(advice, 1):
        with st.container(border=True):
            st.markdown(f"### {number}. {heading}")
            st.write(message)

    st.divider()

    # WHAT-IF SAVINGS CALCULATOR
    st.markdown("## 🔮 Plan Your Future Savings")

    st.write(
        "Experiment with how much you could save over time. "
        "This is an estimate, not a guaranteed result."
    )

    weekly_amount = st.slider(
        "How much could you save each week?",
        min_value=0,
        max_value=200,
        value=20,
        step=5
    )

    number_of_weeks = st.slider(
        "How many weeks?",
        min_value=1,
        max_value=52,
        value=12
    )

    extra_savings = weekly_amount * number_of_weeks
    future_savings = saved + extra_savings

    f1, f2, f3 = st.columns(3)
    f1.metric("Current Savings", money(saved))
    f2.metric("Additional Savings", money(extra_savings))
    f3.metric("Possible Future Savings", money(future_savings))

    if not goals_df.empty and weekly_amount > 0:
        next_goal = goals_df[
            goals_df["saved"] < goals_df["target"]
        ]

        if not next_goal.empty:
            next_goal = next_goal.assign(
                remaining=next_goal["target"] - next_goal["saved"]
            ).sort_values("remaining").iloc[0]

            weeks_needed = int(
                (next_goal["remaining"] + weekly_amount - 0.000001)
                // weekly_amount
            )

            st.success(
                f"If you save {money(weekly_amount)} every week, "
                f"you could reach {next_goal['name']} in approximately "
                f"{weeks_needed} weeks."
            )

    st.caption(
        "Common Cents recommendations are educational suggestions. "
        "You make the final decision about how to use your money."
    )
