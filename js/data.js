/* Centsible — static content: categories, learning content, and the
   labelled examples the transaction categorizer is trained on. */

window.CENTSIBLE_DATA = (() => {
  const CATEGORIES = [
    "Food", "Shopping", "Entertainment", "Transportation", "Education",
    "Health", "Gifts", "Housing", "Utilities", "Savings", "Income", "Other"
  ];

  /* Synthetic, hand-written training examples (no real people or merchants'
     records). Each line: category, then " | "-separated descriptions. */
  const TRAINING_TEXT = `
Food | lunch | school lunch | pizza with friends | burger and fries | coffee | iced coffee | bubble tea | boba tea | groceries | grocery run | snacks | vending machine | smoothie | bagel and juice | taco tuesday | sushi | ice cream | bakery | donuts | cafeteria | breakfast sandwich | dinner out | food truck | chips and soda | sandwich shop | ramen | energy drink | candy | pizza slice | fast food | milkshake | frozen yogurt | brunch | food delivery
Shopping | clothes | new shoes | sneakers | hoodie | jeans | t-shirt | jacket | phone case | headphones | earbuds | backpack | makeup | skincare | hair products | sunglasses | thrift store | mall | online order | watch | jewelry | socks | hat | water bottle | room decor | posters | charger cable | keyboard | mouse pad | nail polish | perfume | wallet | dress | sweater
Entertainment | movie | movie tickets | cinema | concert tickets | video game | game pass | streaming subscription | music subscription | bowling | arcade | mini golf | escape room | trampoline park | theme park | comic books | in-game purchase | skins | game dlc | karaoke | museum tickets | laser tag | festival pass | streaming rental | ice skating | paintball | board game | movie night | trivia night
Transportation | bus pass | bus fare | train ticket | subway | metro card | gas | fuel | uber | lyft | taxi | rideshare | bike repair | bike lock | parking | toll | scooter rental | car wash | oil change | tire pump | transit card | ferry ticket | airport shuttle | gas station
Education | notebook | textbook | school supplies | calculator | pens and pencils | binder | sat prep book | tutoring | online course | exam fee | ap exam fee | field trip | lab fee | printing | art supplies | graph paper | flash cards | study guide | coding course | library fine | school club dues | backpack supplies | language app | workbook
Health | pharmacy | medicine | vitamins | doctor copay | dentist | eye drops | first aid kit | gym membership | sports physical | allergy pills | contact lenses | glasses | sunscreen | bandages | protein powder | yoga class | therapy copay | cough drops | flu shot
Gifts | birthday gift | gift for mom | gift for friend | present | flowers | gift card for friend | wedding gift | graduation gift | holiday gifts | donation | charity | fundraiser | card and gift | anniversary present | secret santa | care package | thank you gift
Housing | rent | rent contribution | dorm deposit | room rent | furniture | lamp | storage unit | moving boxes | mattress | desk chair | curtains | apartment application fee
Utilities | phone bill | phone contribution | internet bill | wifi | electric bill | water bill | cloud storage | data plan | phone plan | hotspot | power bill | utility bill
Savings | savings deposit | savings contribution | transfer to savings | emergency fund | college fund | goal deposit | piggy bank | savings account | investment deposit | put money aside | rainy day fund | laptop fund | car fund
Income | paycheck | part-time job | weekend earnings | babysitting | allowance | birthday money | tutoring income | lawn mowing | dog walking | pet sitting | tips | refund | cash back | sold old clothes | freelance design | summer job | lifeguard pay | car wash fundraiser income | reselling | gift money | scholarship | stipend | mowing lawns | sold video game
Other | fee | bank fee | atm fee | late fee | misc | miscellaneous | lost money | fine | replacement id card | key copy | postage | shipping fee | service charge
Food | lunch with friends | coffee before school | coffee shop | pizza night | groceries for the week | snacks after practice | dinner with family | takeout dinner | breakfast burrito | lunch at the mall | cafe latte | cappuccino | hot chocolate | sandwich and chips | burrito bowl | chicken nuggets | fries and a drink | late night snacks | grocery store | juice and muffin
Shopping | new clothes | clothes from the mall | shoes for school | hoodie online | online shopping | phone accessories | new headphones | mall shopping | gift for myself | shirt and jeans | thrift shopping | makeup and skincare | new backpack | earbuds case | sneakers online | jacket for winter
Entertainment | movie with friends | movie ticket | concert | game purchase | new video game | streaming service | music streaming | arcade games | bowling night | theme park tickets | game subscription | event tickets | show tickets | gaming credits | comic book store | movie snacks and ticket
Transportation | bus ticket | train fare | gas for the car | rideshare home | uber to practice | taxi home | monthly bus pass | transit pass | parking fee | bike tire | car gas | ride to school | scooter ride | train pass
Education | school books | supplies for class | notebooks and pens | study materials | test prep | exam registration | class fee | tutoring session | course fee | printer paper | sat practice book | art class supplies | science fair supplies | school trip | graphing calculator
Health | medicine from pharmacy | vitamins and supplements | gym pass | doctor visit | dental checkup | prescription | pharmacy items | sports medicine | fitness class | health supplies | eye exam | cold medicine
Gifts | gift for sister | gift for brother | birthday present | present for friend | flowers for mom | holiday present | donation to charity | gift for teacher | birthday card and gift | gift wrap | gift for dad
Housing | rent payment | monthly rent | dorm supplies | room furniture | bedroom decor lamp | rent share | apartment rent | desk for room
Utilities | monthly phone bill | phone plan payment | internet service | wifi bill | streaming of data plan | electricity bill | water and power | mobile data | cell phone bill
Savings | monthly savings | savings transfer | deposit to savings | saving for laptop | saving for car | money for goal | add to emergency fund | weekly savings | college savings | saved from paycheck
Income | weekly paycheck | pay from job | babysitting money | allowance from parents | cash for chores | birthday cash | tutoring money | dog walking money | selling clothes | tips from work | refund from store | summer job pay | side hustle | holiday money | money from grandma
Other | bank charge | overdraft fee | atm withdrawal fee | random purchase | lost wallet | replacement card fee | shipping cost | processing fee | parking ticket fine | misc expense`;

  const TRAINING = [];
  for (const line of TRAINING_TEXT.trim().split("\n")) {
    const [cat, rest] = line.split(" | ").length > 1
      ? [line.slice(0, line.indexOf(" | ")), line.slice(line.indexOf(" | ") + 3)]
      : [null, null];
    if (!cat) continue;
    for (const text of rest.split(" | ")) TRAINING.push({ text: text.trim(), category: cat.trim() });
  }

  const QUESTION_BANK = [
    {id:"budget-01",topic:"Budgeting",level:"Starter",
     q:"You receive $120 this month. Which plan is the strongest starting budget?",
     choices:["Spend first and save whatever remains","Give every dollar a planned job, including savings","Put everything into savings and ignore expenses","Borrow money whenever the plan runs short"],
     answer:1,why:"A plan gives income jobs before it disappears. You can allocate money to needs, wants, savings, and future costs, then adjust when reality changes.",
     takeaway:"Plan first. Review often. A budget is a flexible tool, not a punishment."},
    {id:"budget-02",topic:"Budgeting",level:"Starter",
     q:"Your monthly take-home income is $800. Essential costs are $430 and planned savings are $100. How much remains for flexible spending?",
     choices:["$170","$270","$370","$530"],answer:1,
     why:"$800 − $430 − $100 = $270. This is the amount available for flexible categories, assuming the listed costs are complete.",
     takeaway:"Use subtraction to find what is actually available—not what you hope is available."},
    {id:"budget-03",topic:"Budgeting",level:"Core",
     q:"A budget category has a $75 limit. You have spent $52.40. What is the remaining amount?",
     choices:["$12.60","$22.60","$27.40","$127.40"],answer:1,
     why:"$75.00 − $52.40 = $22.60. Tracking throughout the month helps you make choices before a category runs out.",
     takeaway:"Remaining budget = budget limit − amount spent."},
    {id:"budget-04",topic:"Budgeting",level:"Core",
     q:"Your spending is above plan halfway through the month. What is the most useful next step?",
     choices:["Ignore it because the month is not over","Review transactions and adjust flexible categories","Delete the budget","Assume next month will automatically be better"],answer:1,
     why:"A budget is a feedback system. Find the category driving the difference, check for errors, and make a realistic adjustment.",
     takeaway:"A budget review is information, not a grade on your character."},
    {id:"budget-05",topic:"Budgeting",level:"Advanced",
     q:"Your income changes each month. Which approach is generally more resilient?",
     choices:["Build the plan around your highest-ever month","Use a conservative baseline and prioritize essentials","Commit every dollar before income is known","Ignore irregular expenses"],answer:1,
     why:"A conservative baseline reduces the risk of planning around income that may not arrive. Irregular costs can be handled with sinking funds.",
     takeaway:"For variable income, plan around a dependable floor—not an optimistic ceiling."},
    {id:"saving-01",topic:"Saving",level:"Starter",
     q:"What is a sinking fund?",
     choices:["A fund for a cost you expect in the future","A loan with no repayment date","An investment guaranteed to rise","A bank fee"],answer:0,
     why:"A sinking fund sets aside smaller amounts over time for a known future expense, such as school supplies or an annual bill.",
     takeaway:"Turn a large future cost into smaller planned contributions."},
    {id:"saving-02",topic:"Saving",level:"Starter",
     q:"You want $180 in 6 months. If you save the same amount monthly, how much is needed each month?",
     choices:["$20","$25","$30","$36"],answer:2,
     why:"$180 ÷ 6 = $30 per month. This assumes no interest and no withdrawals.",
     takeaway:"Monthly goal contribution = target amount ÷ months available."},
    {id:"saving-03",topic:"Saving",level:"Core",
     q:"Why might an emergency fund be kept somewhere accessible and relatively stable?",
     choices:["So it can be spent on every sale","Because emergencies require access and the money should not depend on market prices","Because it always earns the highest return","So it cannot be tracked"],answer:1,
     why:"Emergency savings are for unexpected costs. Stability and access usually matter more than chasing a high return.",
     takeaway:"Match the account or asset to the purpose and time horizon."},
    {id:"saving-04",topic:"Saving",level:"Core",
     q:"A goal is due in two months, but you have saved only 20% of the target. What is a sound response?",
     choices:["Assume the money will appear","Revisit the deadline, target, or contribution plan","Use a high-risk investment to catch up","Hide the shortfall"],answer:1,
     why:"A plan should reflect actual progress. You can extend the timeline, lower the target, or increase contributions if realistic.",
     takeaway:"Adjust the plan transparently instead of relying on a risky shortcut."},
    {id:"saving-05",topic:"Saving",level:"Advanced",
     q:"What does opportunity cost mean when deciding whether to buy something?",
     choices:["The sales tax on the item","The value of the next-best option you give up","The original retail price","The amount of cash in your wallet"],answer:1,
     why:"Choosing one option means giving up another. The opportunity cost is the value of that next-best alternative.",
     takeaway:"Ask what else this money could do before making a purchase."},
    {id:"credit-01",topic:"Credit",level:"Starter",
     q:"What is interest on a loan?",
     choices:["The cost of borrowing money","A reward paid by every store","A type of debit card","A payment that is always optional"],answer:0,
     why:"Interest is the cost of borrowing, usually expressed as a rate. Fees and repayment timing also affect total cost.",
     takeaway:"Compare the total amount repaid—not just the monthly payment."},
    {id:"credit-02",topic:"Credit",level:"Core",
     q:"A $200 balance has a 10% simple annual interest rate for one year. Ignoring fees and payments, what is the interest?",
     choices:["$2","$10","$20","$40"],answer:2,
     why:"$200 × 0.10 = $20 for one year under this simplified simple-interest example. Real credit products may compound and include fees.",
     takeaway:"Interest depends on balance, rate, and time. Read the actual agreement."},
    {id:"credit-03",topic:"Credit",level:"Core",
     q:"Why can paying only the minimum on a credit card be expensive?",
     choices:["It always cancels the balance","It can extend repayment and increase total interest paid","It removes all fees","It improves every credit score instantly"],answer:1,
     why:"A minimum payment may leave much of the balance outstanding. Interest can continue to accrue, making repayment take longer.",
     takeaway:"Understand the minimum, due date, APR, and total cost."},
    {id:"credit-04",topic:"Credit",level:"Advanced",
     q:"A purchase is advertised as 'only $25 per month.' What should you check before judging affordability?",
     choices:["Only the monthly amount","APR, fees, term, total repayment, and whether you need it","Whether the ad uses a bright color","Whether friends bought it"],answer:1,
     why:"A small payment can hide a long term or high total cost. Compare the complete terms and your budget.",
     takeaway:"Monthly payment is only one part of borrowing cost."},
    {id:"banking-01",topic:"Banking safety",level:"Starter",
     q:"Which information should never be shared in response to an unexpected message?",
     choices:["A public store address","A one-time verification code or password","A general question about budgeting","A public product name"],answer:1,
     why:"Verification codes and passwords can give someone access to an account. Legitimate support should not ask you to disclose a one-time code.",
     takeaway:"Never share passwords or verification codes. Verify requests independently."},
    {id:"banking-02",topic:"Banking safety",level:"Core",
     q:"You receive a text claiming your account will be locked unless you click a link immediately. What is safest?",
     choices:["Click quickly","Reply with your password","Open the official app or contact the institution using a trusted channel","Forward it to everyone"],answer:2,
     why:"Urgency and unexpected links are common scam signals. Navigate independently using an official app, website, or known phone number.",
     takeaway:"Do not use contact details supplied by a suspicious message."},
    {id:"banking-03",topic:"Banking safety",level:"Advanced",
     q:"What is the strongest reason to enable transaction alerts?",
     choices:["They guarantee no fraud","They can help you notice unfamiliar activity sooner","They replace account statements","They make passwords unnecessary"],answer:1,
     why:"Alerts provide an additional monitoring layer. They do not prevent every problem, but can help you respond faster.",
     takeaway:"Use alerts alongside strong passwords and regular account reviews."},
    {id:"invest-01",topic:"Investing",level:"Starter",
     q:"What does diversification mean?",
     choices:["Putting all money into one company","Spreading investments across different assets or exposures","Buying only what is trending","Avoiding all risk"],answer:1,
     why:"Diversification reduces dependence on one investment or risk source. It cannot eliminate market risk or guarantee gains.",
     takeaway:"Diversification manages concentration risk; it does not guarantee returns."},
    {id:"invest-02",topic:"Investing",level:"Core",
     q:"Why is a high expected return usually connected to higher risk?",
     choices:["Higher returns are guaranteed","Investors may require compensation for taking greater uncertainty","Risk disappears over time","All assets have identical risk"],answer:1,
     why:"Investments with uncertain outcomes may offer higher potential returns, but losses are possible and returns are never guaranteed.",
     takeaway:"Potential return must be considered together with possible loss."},
    {id:"invest-03",topic:"Investing",level:"Core",
     q:"An investment rises from $100 to $110. What is the percentage gain before fees and taxes?",
     choices:["5%","10%","11%","20%"],answer:1,
     why:"The gain is $10. Divide $10 by the original $100: 0.10, or 10%.",
     takeaway:"Percentage return = gain or loss ÷ starting value × 100."},
    {id:"invest-04",topic:"Investing",level:"Advanced",
     q:"Money is needed for a known expense next month. Which statement is most appropriate?",
     choices:["Put it all into a volatile investment","Keep the money in a suitable accessible place rather than depending on short-term market gains","Borrow to invest more","Assume the market will rise"],answer:1,
     why:"A short time horizon leaves little time to recover from a market decline. Money needed soon generally calls for stability and access.",
     takeaway:"Time horizon matters when choosing where money belongs."},
    {id:"scams-01",topic:"Scam detection",level:"Starter",
     q:"Which is a common warning sign of a financial scam?",
     choices:["A clear explanation of fees","Pressure to act immediately and keep it secret","A link to official documentation you independently located","Time to compare options"],answer:1,
     why:"Scammers often create urgency, secrecy, or fear to stop people from checking the facts.",
     takeaway:"Pause, verify independently, and ask a trusted person when uncertain."},
    {id:"scams-02",topic:"Scam detection",level:"Core",
     q:"Someone online promises to double your money by tomorrow if you send a fee first. What is the best response?",
     choices:["Pay the fee","Send a small test amount","Treat it as a major warning sign and do not send money","Share your account login"],answer:2,
     why:"Guaranteed fast returns and upfront fees are major scam indicators. Do not send money or private information.",
     takeaway:"No legitimate investment can guarantee rapid, risk-free returns."},
    {id:"tax-01",topic:"Taxes & pay",level:"Starter",
     q:"What is take-home pay?",
     choices:["Pay before any deductions","Pay remaining after applicable deductions and withholding","A bonus from an employer","The amount on a job advertisement"],answer:1,
     why:"Gross pay is before deductions. Take-home pay is what reaches you after applicable withholding and deductions.",
     takeaway:"Build a spending plan around money actually received."},
    {id:"tax-02",topic:"Taxes & pay",level:"Core",
     q:"You work 8 hours at $15 per hour. What is gross pay before deductions?",
     choices:["$23","$80","$120","$150"],answer:2,
     why:"8 × $15 = $120 gross pay before taxes or other deductions.",
     takeaway:"Hours worked × hourly rate = gross pay, before deductions."},
    {id:"consumer-01",topic:"Smart spending",level:"Starter",
     q:"What is a useful way to compare two products with different package sizes?",
     choices:["Compare unit prices","Choose the brighter package","Compare only the package names","Assume the larger package is always cheaper"],answer:0,
     why:"Unit price compares cost per common unit, such as ounce or item, making different sizes easier to compare.",
     takeaway:"Unit price helps reveal value, but also consider quality and whether you need the quantity."},
    {id:"consumer-02",topic:"Smart spending",level:"Core",
     q:"A limited-time sale ends in ten minutes. You had not planned to buy the item. What should you do?",
     choices:["Buy it because the timer is running","Pause and compare the purchase with your needs and budget","Use credit automatically","Buy two to save more"],answer:1,
     why:"Artificial urgency can push impulsive choices. A discount is not savings if it creates an unnecessary expense.",
     takeaway:"A purchase is not a good deal just because the price is lower."},
    {id:"insurance-01",topic:"Risk & protection",level:"Core",
     q:"What is the main purpose of insurance?",
     choices:["To make every event profitable","To transfer certain financial risks in exchange for premiums and policy terms","To guarantee that nothing bad happens","To eliminate all costs"],answer:1,
     why:"Insurance can help protect against specified financial losses, subject to coverage, exclusions, deductibles, and limits.",
     takeaway:"Understand what a policy covers—and what it does not."},
    {id:"inflation-01",topic:"Economics",level:"Core",
     q:"If prices rise while your income stays the same, what generally happens to purchasing power?",
     choices:["It increases","It decreases","It stays exactly the same","It becomes unlimited"],answer:1,
     why:"Inflation means the general price level rises. The same amount of money buys fewer goods and services.",
     takeaway:"Purchasing power depends on income relative to prices."}
  ];

  const TOPICS = {
    "Budgeting":"Build a plan, track trade-offs, and make your money intentional.",
    "Saving":"Set goals, prepare for future costs, and build consistency.",
    "Credit":"Understand borrowing, interest, repayment, and total cost.",
    "Banking safety":"Protect accounts, recognize suspicious messages, and monitor activity.",
    "Investing":"Learn risk, return, diversification, and time horizons.",
    "Scam detection":"Spot pressure tactics, unrealistic promises, and unsafe requests.",
    "Taxes & pay":"Understand gross pay, deductions, and take-home income.",
    "Smart spending":"Compare value, question urgency, and make deliberate purchases.",
    "Risk & protection":"Understand how insurance transfers defined financial risks.",
    "Economics":"Connect inflation and purchasing power to everyday choices."
  };

  const LESSONS = [
    {id:"lesson-budget",topic:"Budgeting",title:"Build a budget that survives real life",minutes:6,level:"Starter",sections:[
      ["The idea","A budget is a plan for money coming in and money going out. It is a decision-making tool—not a restriction or a prediction that every month will be identical."],
      ["A practical structure","Start with dependable income. List essential costs, flexible spending, savings goals, and irregular expenses. Give each dollar a purpose while leaving room for reality."],
      ["The review loop","Compare your plan with actual transactions. Find the biggest difference, decide whether it was expected, and adjust one category at a time."],
      ["Try it","If you receive $500, plan $250 for essentials, $75 for savings, $100 for flexible spending, and $75 for future or irregular costs. The right amounts depend on your situation."]],
     check:"What makes a budget useful?",options:["It never changes","It helps compare a plan with real spending","It guarantees more income","It removes every want"],answer:1},
    {id:"lesson-saving",topic:"Saving",title:"Turn a goal into a repeatable system",minutes:5,level:"Starter",sections:[
      ["Make it specific","A useful savings goal has a target amount, a reason, and a time frame."],
      ["Calculate the pace","Divide the amount still needed by the number of saving periods remaining. Check whether that contribution is realistic."],
      ["Separate the purpose","A goal fund can help prevent money intended for one purpose from being spent on another."],
      ["Review without shame","If the pace is too high, change the timeline or target. A realistic plan is more useful than an impossible one."]],
     check:"You need $96 in 4 months. What is the equal monthly contribution?",options:["$12","$24","$32","$48"],answer:1},
    {id:"lesson-credit",topic:"Credit",title:"Read the full cost of borrowing",minutes:7,level:"Core",sections:[
      ["Principal and interest","Principal is the amount borrowed. Interest is the cost of borrowing, often described using an annual percentage rate."],
      ["Look beyond the payment","A low monthly payment may come from a longer repayment period. Compare fees, rate, term, and total repayment."],
      ["Due dates matter","Late payments can create fees and other consequences. Read the agreement and keep track of due dates."],
      ["Pause before signing","Borrowing is a commitment. If a term is unclear, ask questions and get help from a qualified, trusted adult."]],
     check:"Which comparison gives the clearest picture of loan cost?",options:["Monthly payment only","Total repayment, APR, fees, and term","The color of the offer","The first payment only"],answer:1},
    {id:"lesson-safety",topic:"Banking safety",title:"Build safer account habits",minutes:5,level:"Starter",sections:[
      ["Protect access","Use unique passwords and multi-factor authentication where available. Never share a password or one-time verification code."],
      ["Verify independently","Do not trust an unexpected link or phone number in a message. Open the official app or use contact details you already trust."],
      ["Monitor activity","Transaction alerts and regular reviews can help you notice unfamiliar activity sooner."],
      ["Ask before acting","Pressure, secrecy, and unrealistic promises are warning signs. Pause and check with a trusted person."]],
     check:"A message asks for your verification code. What should you do?",options:["Send it if the message looks official","Never share it; verify through a trusted channel","Post it to ask if it is real","Reply with your password"],answer:1},
    {id:"lesson-investing",topic:"Investing",title:"Understand risk before return",minutes:7,level:"Core",sections:[
      ["What investing means","Investing means buying assets with the hope of future value or income. The value can fall, and returns are not guaranteed."],
      ["Risk and time","Money needed soon usually has less time to recover from a decline. Time horizon should influence the amount of risk considered."],
      ["Diversification","Spreading exposure can reduce concentration risk. It does not remove all market risk or guarantee a positive result."],
      ["Costs matter","Fees, taxes, and trading costs can reduce returns. Understand the product before committing money."]],
     check:"What does diversification help reduce?",options:["Every possible loss","Concentration in one investment or exposure","All fees","The passage of time"],answer:1},
    {id:"lesson-scams",topic:"Scam detection",title:"Recognize manipulation before it works",minutes:4,level:"Starter",sections:[
      ["Urgency","Scams may pressure you to act immediately so you do not have time to verify."],
      ["Secrecy","Requests to hide a transaction from family, a bank, or another trusted person are warning signs."],
      ["Unrealistic promises","Guaranteed high returns or easy money with no risk should be treated skeptically."],
      ["Verification","Stop. Do not send money or information. Independently verify the claim and ask for help."]],
     check:"Which is the strongest scam warning sign?",options:["Clear terms and time to review","Pressure to send a fee for guaranteed fast returns","A public company address","A receipt for a completed purchase"],answer:1}
  ];

  const SCENARIOS = [
    {title:"The first paycheck",brief:"You receive a fictional $240 paycheck. Your planned needs cost $110, and you want to save $50.",
     question:"How much remains for flexible spending and other goals?",choices:["$50","$80","$100","$130"],answer:1,
     explain:"$240 − $110 − $50 = $80. This is the amount remaining after the two planned allocations."},
    {title:"The surprise expense",brief:"Your fictional budget has $40 of unassigned room. A necessary school expense costs $28.",
     question:"What is the remaining unassigned amount?",choices:["$8","$12","$18","$28"],answer:1,
     explain:"$40 − $28 = $12. Updating the budget keeps the plan honest."},
    {title:"The subscription audit",brief:"You pay $8 per month for a service you rarely use. You are reviewing recurring expenses.",
     question:"What is the best first step?",choices:["Ignore it because it is small","Check usage, terms, and whether you still value it","Borrow to cover it","Assume cancelling is always free"],answer:1,
     explain:"Review value and cancellation terms before deciding. Small recurring expenses can add up, but the right choice depends on your needs."},
    {title:"The suspicious offer",brief:"A stranger promises a guaranteed 40% return this week if you send a processing fee.",
     question:"What should you do?",choices:["Send the fee","Ask for their password","Do not send money; independently verify and ask a trusted person","Send half the fee"],answer:2,
     explain:"Guaranteed rapid returns and upfront fees are serious warning signs. Do not share money or account information."}
  ];

  /* Plain-language definitions Centy uses in offline mode. Keys are the phrases it looks for. */
  const GLOSSARY = [
    [["credit score"], "A **credit score** is a number (in the US usually 300 to 850) that shows lenders how reliably you've repaid borrowed money. Paying bills on time and keeping card balances low raise it. A higher score can mean easier approval and lower interest when you borrow later. In the US you usually can't build one until you're 18 or added to a parent's card."],
    [["compound interest"], "**Compound interest** means you earn interest on your interest. Save $100 at 5% a year: after year one you have $105, and year two's interest is on $105, not $100. Over long periods this snowballs, which is why starting to save early matters so much."],
    [["apr"], "**APR** (annual percentage rate) is the yearly cost of borrowing, including interest and some fees. A card with 25% APR charges about $25 a year for every $100 you leave unpaid. Lower is better when you borrow."],
    [["interest"], "**Interest** is the price of using money. When you borrow, you pay it; when you save in an interest-bearing account, you earn it. Borrow $200 at 10% simple interest for a year and you'd owe $20 in interest."],
    [["debit card", "debit vs credit", "credit card"], "A **debit card** spends money you already have in your bank account. A **credit card** borrows money you must pay back, and charges interest if you don't pay the full balance by the due date. Debit is usually safer while you're learning to budget."],
    [["emergency fund", "rainy day"], "An **emergency fund** is money kept aside for surprises, like a broken phone or a lost job. A common goal is 3 to 6 months of essential costs for adults; as a teen, even $100 to $300 is a great start. Keep it somewhere easy to reach but separate from spending money."],
    [["50/30/20", "50 30 20"], "The **50/30/20 rule** splits take-home money into 50% needs, 30% wants and 20% savings. With $200 a month: $100 needs, $60 wants, $40 savings. It's a starting point; adjust it to your life."],
    [["inflation"], "**Inflation** is when prices rise over time, so the same money buys less. If inflation is 3%, something that costs $100 today costs about $103 next year. Savings that earn less than inflation slowly lose buying power."],
    [["stock", "shares", "index fund", "etf"], "A **stock** is a small piece of ownership in a company. Its price can go up or down. An **index fund** or **ETF** holds many stocks at once, which spreads out risk. Investing is for money you won't need for years; short-term money belongs somewhere stable."],
    [["tax", "taxes", "paycheck", "gross pay", "net pay"], "**Gross pay** is what you earn before deductions; **net (take-home) pay** is what lands in your account after taxes and other withholding. Budget with your net pay, since that's what you can actually spend."],
    [["budget", "budgeting"], "A **budget** is a plan that gives every dollar a job before you spend it: needs, wants, savings and upcoming costs. Start by listing your income, then your regular costs, then set limits for flexible spending. Review it every week and adjust; Centsible's Budget page does the tracking for you."],
    [["save", "saving", "savings"], "A simple saving habit: **pay yourself first**. Move a set amount (try 10% to 20%) into savings as soon as money comes in, before spending anything. Give savings a goal and a date so it's easier to stick with."],
    [["scam", "phishing", "fraud"], "Common **scam** signs: pressure to act fast, requests for secrecy, prizes that need a fee first, and anyone asking for passwords or verification codes. Stop, don't send money or codes, and check with a trusted adult or the official company through a channel you find yourself."]
  ];

  const BADGES = {
    "first-steps": { name: "First Steps", desc: "Logged your first transaction" },
    "sharp-mind": { name: "Sharp Mind", desc: "Scored 80% or higher on a session" },
    "perfect": { name: "Flawless", desc: "Scored 100% on a session" },
    "consistent-learner": { name: "Consistent Learner", desc: "Completed five sessions" },
    "scholar": { name: "Scholar", desc: "Completed three lessons" },
    "goal-getter": { name: "Goal Getter", desc: "Fully funded a savings goal" },
    "on-time": { name: "On Time", desc: "Marked a payment as paid" },
    "trainer": { name: "AI Trainer", desc: "Taught the categorizer five times" }
  };

  return { CATEGORIES, TRAINING, QUESTION_BANK, TOPICS, LESSONS, SCENARIOS, BADGES, GLOSSARY, DEMO_CARD_CODE: "CENTSIBLE-0001" };
})();
