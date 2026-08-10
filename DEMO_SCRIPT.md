# DataHub dbt Forge — 3-Minute Live Hackathon Demo Script ⏱️

This step-by-step guide helps you present **DataHub dbt Forge** to hackathon judges for maximum score impact.

---

## ⏱️ Minute 0:00 – 0:45 | Introduction & Problem Statement

**Visual**: Open browser at **`http://localhost:3000`**.

**Speaker Narration**:
> *"Hi judges! Every data team uses AI to write SQL today. But generic AI assistants have a fatal flaw: **they don't know your metadata catalog**. They hallucinate column names, guess currencies, and produce orphan SQL files that break dbt pipelines.*
>
> *We built **DataHub dbt Forge** — an intelligent agent that reads real metadata from DataHub, respects schema bounds and lineage, generates verified dbt models and tests with **zero hallucinations**, and writes lineage back to DataHub."*

---

## ⏱️ Minute 0:45 – 1:30 | Tab 1: DataHub Metadata Context & Quality Score

**Visual Action**:
1. Point to top dropdown: `retail.orders — SNOWFLAKE (E-Commerce)`.
2. Click **Tab 1: DataHub Context & Quality Score**.

**Speaker Narration**:
> *"First, our agent connects to DataHub GMS. It pulls schema types, primary keys, foreign keys, glossary terms, and upstream lineage.*
>
> *Notice our **Metadata Quality Score meter (96/100)**. The agent detected two metadata gaps: `UNDEFINED_CURRENCY` and a missing column description.
>
> **Here is our core philosophy**: The AI does not guess USD or invent fake columns. It surfaces metadata gaps explicitly as engineering assumptions."*

---

## ⏱️ Minute 1:30 – 2:15 | Tab 2 & 3: Multi-Dataset Join & Glossary Type Checker

**Visual Action**:
1. Under **Join Dimension (Optional)**, select **`JOIN retail.customers`**.
2. Click the black **`"▶ Generate dbt Pipeline"`** button.
3. Switch to **Tab 2: Agent Reasoning & Logic**, then **Tab 3: Generated dbt Assets & Publish**.

**Speaker Narration**:
> *"Watch what happens when we generate a multi-table join model. Our reasoning agent discovers foreign key relationships between `orders.customer_id` and `customers.customer_id` directly from DataHub.*
>
> *Look at our validation panel: Every check is **100% GREEN by construction**.*
>
> *Here is our biggest technical breakthrough: We turned DataHub's Business Glossary into a **Semantic Type System**. Standard SQL linters pass queries that sum USD and EUR or sum rates like average order values because the SQL syntax is valid. But our agent type-checks the SQL against DataHub's glossary terms and rejects semantically corrupt logic.*
>
> ***This SQL is syntactically perfect, but semantically wrong — and the ONLY reason we can catch it is the DataHub Glossary type checker!***"*

---

## ⏱️ Minute 2:15 – 3:00 | Closed-Loop DataHub Write-Back & Export

**Visual Action**:
1. Click **`"Publish to DataHub"`**. Show the success modal.
2. Click **`"Export dbt Project (.ZIP)"`**.

**Speaker Narration**:
> *"Finally, we close the loop. Clicking **Publish to DataHub** writes the newly created model entity back to DataHub, attaches `ai-generated` tags, updates dataset documentation, and registers upstream lineage edges.*
>
> *And if you want to deploy right now, one click on **Export dbt Project (.ZIP)** downloads a complete dbt repository archive containing `dbt_project.yml`, `profiles.yml.example`, and all models ready for `dbt run`.*
>
> *Thank you! We're ready for your questions."*

---

## 💡 Quick Tips for Live Q&A

- **Q: What if the LLM generates invalid SQL syntax?**
  - **Answer**: *"Our `GenerationAgent` has a built-in 3-retry self-repair loop using `sqlglot`. If an AST error is detected, the error snippet is fed back to the LLM to self-correct before the user ever sees it."*
- **Q: Does this work with live DataHub GMS instances?**
  - **Answer**: *"Yes! We have a native GraphQL and REST client (`DataHubClient`) configured in `app/datahub/client.py`. Setting `DEMO_MODE=false` in `.env` connects to any live DataHub server."*
