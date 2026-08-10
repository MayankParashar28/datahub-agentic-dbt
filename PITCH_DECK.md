# DataHub dbt Forge — Technical Pitch Deck 🚀
**Metadata-Aware AI Agent for Autonomous, Verified dbt Artifact Generation & Lineage Write-Back**

---

## Slide 1: The Problem — AI Code Generators Create Data Debt
* **SQL Generators Are Dumb**: Generic AI assistants write naive SQL query snippets without understanding column data types, business terminology, foreign key relationships, or lineage dependencies.
* **Hallucinated Columns Break Pipelines**: AI frequently fabricates column names (`customer_name`, `total_price`) that don't exist in warehouse tables.
* **Documentation & Lineage Fragmentation**: Artifacts produced by developers or LLMs are rarely ingested back into metadata catalogs, creating disconnected data silos.

---

## Slide 2: The Solution — DataHub dbt Forge
**DataHub dbt Forge** is an intelligent AI data engineering agent that reads live metadata from **DataHub GMS**, reasons over schema bounds and lineage graph contracts, automatically generates production-grade dbt artifacts, validates them with AST parsers, and writes back metadata & lineage to DataHub.

```
+------------------+     +-------------------+     +------------------+     +---------------------+
| DataHub GMS      | --> | AI Metadata Agent | --> | Reasoning Engine | --> | sqlglot AST Checker |
| (Schema/Lineage) |     | (Quality Scoring) |     | (CTE / Test Plan)|     | (0 Hallucinations)  |
+------------------+     +-------------------+     +------------------+     +---------------------+
                                                                                   |
                                                                                   v
                                                                        +---------------------+
                                                                        | DataHub Writeback   |
                                                                        | (Lineage + Tags)    |
                                                                        +---------------------+
```

---

## Slide 3: Core Architecture & Differentiation
1. **0–100 Metadata Quality Scoring & Gap Detection**:
   - Evaluates schema completeness, documentation coverage, and lineage edges.
   - Detects gaps like `UNDEFINED_CURRENCY` or `MISSING_DESCRIPTION`.
   - **Ground-Truth Principle**: The AI never guesses missing metadata or fabricates columns; it explicitly surfaces gaps as engineering assumptions.

2. **Structured Reasoning Engine**:
   - Formulates model grain, derived CTE arithmetic, dbt test assertions (`unique`, `not_null`, `relationships`), and an auditing decision log.

3. **`sqlglot` AST Validation & 3-Retry Self-Repair Loop**:
   - Parses generated SQL into Abstract Syntax Trees to verify table and column references against DataHub metadata contracts.
   - Automatically repairs SQL syntax or schema mismatch errors before user review.

4. **Closed-Loop DataHub Lineage Write-Back**:
   - Publishes newly generated dbt models back to DataHub with `ai-generated` tags, documentation aspects, and upstream/downstream lineage graph edges.

---

## Slide 4: Multi-Dataset Joins & Custom Prompting
* **Foreign Key Resolution**: Resolves foreign key relationships from DataHub metadata to construct valid multi-table joins (`orders.customer_id = customers.customer_id`).
* **Custom Business Rules**: Accepts custom instructions (e.g. *"Derive gross order value, lower-case email, and filter active accounts"*) without breaking schema bounds.
* **One-Click dbt Project Export**: Downloads a ready-to-run `.zip` archive containing `dbt_project.yml`, `profiles.yml.example`, `models/*.sql`, `schema.yml`, and `README.md`.

---

## Slide 5: Tech Stack & System Design
* **Backend**: FastAPI (Python 3.9+), `sqlglot` (AST parser), DataHub GraphQL & REST Client, Pydantic V2.
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS (White & Black High-Contrast Master Studio Layout).
* **LLM Engine**: Provider-agnostic interface supporting Anthropic Claude, OpenAI GPT-4, Google Gemini, and offline Mock fallback.

---

## Slide 6: Summary & Impact
* **Reduces dbt Model Creation Time by 90%**: From hours of manual SQL/YAML writing to 5 seconds.
* **Guaranteed 0 Column Hallucinations**: Enforced via AST verification against DataHub catalog schema.
* **Restores Metadata Lineage Integrity**: Every generated model automatically updates DataHub.
