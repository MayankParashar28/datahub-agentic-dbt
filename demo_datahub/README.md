# Demo DataHub Data System — fiction-retail

A self-contained, high-quality demo metadata system representing a fictional retail data platform (`fiction-retail`).

---

## 1. What This Is

A structured **Demo DataHub Context** simulating the metadata catalog that an AI data engineering agent would retrieve from DataHub GMS via GraphQL or MCP Server.

---

## 2. Why It Exists

It allows **DataHub dbt Forge** to perform metadata-aware reasoning, Quality Scoring (0–100), gap detection, AST-validated dbt model generation, and lineage tracking locally before or alongside connecting to a live DataHub deployment.

---

## 3. What It Contains

* **7 Datasets**:
  * `customers` (PostgreSQL / Dimension)
  * `orders` (PostgreSQL / Fact)
  * `products` (PostgreSQL / Catalog)
  * `payments` (PostgreSQL / Transactions)
  * `stores` (PostgreSQL / Directory)
  * `monthly_revenue` (Downstream Analytics)
  * `customer_lifetime_value` (Downstream Analytics)
* **Full Schema Metadata**: Column data types (`BIGINT`, `DECIMAL`, `VARCHAR`, `TIMESTAMP`), nullability, primary/foreign key flags.
* **Lineage Graph**: Directed upstream & downstream dependency edges between all 7 datasets (`lineage.json`).
* **Business Glossary**: 10 enterprise terms (`Customer`, `Order`, `Product`, `Revenue`, `Net Revenue`, `Gross Revenue`, `Customer Lifetime Value`, `Order Status`, `Payment Status`, `Store`).
* **Ownership**: Team-level dataset governance (`retail-data-team`, `analytics-team`, `data-platform-team`, `finance-analytics-team`, `customer-analytics-team`).
* **Tags**: Domain classification (`identifier`, `pii`, `financial`, `commerce`, `customer-data`, `transactional`, `analytics`, `derived`, `reference-data`).
* **Metadata Quality & Intentional Gaps**: Documented quality issues (`UNDEFINED_CURRENCY`, `MISSING_DESCRIPTION`, `MISSING_DOMAIN`).

---

## 4. Important Disclaimer

> ⚠️ **DISCLAIMER**: This directory is a local, version-controlled metadata snapshot for development, testing, and demonstration. It is not a live DataHub server instance.

---

## 5. Future MCP & Live DataHub Integration

The normalized metadata models used in this data system are designed so that the **DataHub MCP Server** or live DataHub GraphQL client (`app/datahub/client.py`) can replace this offline snapshot seamlessly without altering the core AI agent reasoning pipeline.
