import json
import logging
import re
from typing import Optional
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

class MockProvider(LLMProvider):
    """
    Deterministic rule-based Mock Provider for DataHub dbt Forge Demo Mode.
    Generates structured reasoning objects, clean SQL, schema.yml, and README.md.
    Supports all datasets (orders, customers, products, payments, stores, monthly_revenue, customer_lifetime_value)
    and custom user business prompts.
    """
    # Dataset tokens the response bodies below switch on, longest-first so that
    # `customer_lifetime_value` is never shadowed by `customers`.
    DATASET_KEYS = (
        "customer_lifetime_value",
        "monthly_revenue",
        "transactions",
        "customers",
        "products",
        "payments",
        "stores",
        "orders",
    )

    MODEL_TO_SUBJECT = {
        "fct_customer_orders": "orders customers join",
        "dim_products": "products",
        "fct_payments": "payments",
        "dim_stores": "stores",
        "fct_customer_lifetime_value": "customer_lifetime_value",
        "dim_customers": "customers",
        "monthly_revenue": "monthly_revenue",
        "fct_orders": "orders",
    }

    def _reasoning_subject(self, prompt: str) -> str:
        """Resolve which dataset a reasoning prompt is about, from its `Table Name:` header."""
        match = re.search(r"table name:\s*([^\n]+)", prompt, re.IGNORECASE)
        table = (match.group(1) if match else "").strip().lower()

        # A merged multi-dataset request carries customer attributes on an orders grain.
        if "order" in table and "first_name" in prompt.lower():
            return "orders customers join"

        for key in self.DATASET_KEYS:
            if key in table:
                return key
        return "orders"

    def _sql_subject(self, prompt: str) -> str:
        """Resolve which dataset a SQL prompt is about, from its `Target model:` header."""
        match = re.search(r"target model:\s*([A-Za-z0-9_]+)", prompt, re.IGNORECASE)
        model = (match.group(1) if match else "").strip().lower()

        if model in self.MODEL_TO_SUBJECT:
            return self.MODEL_TO_SUBJECT[model]
        for key in self.DATASET_KEYS:
            if key in model:
                return key
        return "orders"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        prompt_lower = prompt.lower()

        # Route on the exact signature each agent emits. Loose keyword matching is unsafe
        # here because the SQL prompt embeds the full reasoning object, so tokens like
        # "join" and "reasoning plan" appear inside prompts they do not describe.
        is_reasoning = "structured json reasoning object" in prompt_lower
        is_sql = "output only clean executable sql" in prompt_lower

        if is_reasoning:
            prompt_lower = "structured reasoning " + self._reasoning_subject(prompt)
        elif is_sql:
            prompt_lower = "generate sql " + self._sql_subject(prompt)

        # 1. Reasoning Prompt
        if "metadata_reasoning" in prompt_lower or "structured reasoning" in prompt_lower or "reason about" in prompt_lower:
            if "join" in prompt_lower or "secondary" in prompt_lower or ("orders" in prompt_lower and "customers" in prompt_lower):
                return json.dumps({
                    "target_model": "fct_customer_orders",
                    "grain": "one row per order with customer attributes",
                    "sources": ["retail.orders", "retail.customers"],
                    "joins": [
                        {
                            "table": "retail.customers",
                            "type": "INNER JOIN",
                            "on": "orders.customer_id = customers.customer_id",
                            "reason": "Foreign key relationship verified in DataHub column metadata"
                        }
                    ],
                    "transformations": [
                        {
                            "expression": "quantity * unit_price",
                            "output": "order_value",
                            "reason": "Derived gross monetary value from order quantity and unit price"
                        },
                        {
                            "expression": "concat(first_name, ' ', last_name)",
                            "output": "customer_name",
                            "reason": "Joined customer full name from dimension table"
                        }
                    ],
                    "tests": [
                        {"column": "order_id", "test": "unique", "reason": "Primary key dataset identifier"},
                        {"column": "order_id", "test": "not_null", "reason": "Identifier cannot be null"},
                        {"column": "customer_id", "test": "not_null", "reason": "Foreign key reference"}
                    ],
                    "metadata_gaps": [
                        {
                            "gap_type": "UNDEFINED_CURRENCY",
                            "column": "unit_price",
                            "description": "Currency definition unavailable in DataHub metadata",
                            "action_taken": "No currency conversion applied",
                            "confidence": "High"
                        }
                    ],
                    "assumptions": [
                        "Assuming inner join on customer_id preserves valid transactions",
                        "Assuming unit_price is in local ledger currency"
                    ],
                    "explainability": [
                        {
                            "decision": "Join retail.orders and retail.customers on customer_id",
                            "evidence": "DataHub column metadata marks customer_id as Foreign Key targeting retail.customers",
                            "confidence": "High",
                            "section": "Join"
                        }
                    ]
                })

            elif "products" in prompt_lower:
                return json.dumps({
                    "target_model": "dim_products",
                    "grain": "one row per product SKU",
                    "sources": ["fiction_retail.products"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "(list_price - unit_cost) / list_price",
                            "output": "margin_percentage",
                            "reason": "Derived profit margin percentage from list_price and unit_cost"
                        }
                    ],
                    "tests": [
                        {"column": "product_id", "test": "unique", "reason": "Primary SKU identifier"},
                        {"column": "product_id", "test": "not_null", "reason": "Product ID cannot be null"}
                    ],
                    "metadata_gaps": [
                        {
                            "gap_type": "MISSING_DESCRIPTION",
                            "column": "supplier_id",
                            "description": "Column supplier_id lacks DataHub description",
                            "action_taken": "Preserved raw supplier_id key",
                            "confidence": "High"
                        }
                    ],
                    "assumptions": [
                        "Assuming list_price and unit_cost share identical currency ledger units"
                    ],
                    "explainability": [
                        {
                            "decision": "Calculate profit margin percentage",
                            "evidence": "Numeric fields list_price and unit_cost verified in DataHub schema",
                            "confidence": "High",
                            "section": "Transformation"
                        }
                    ]
                })

            elif "payments" in prompt_lower:
                return json.dumps({
                    "target_model": "fct_payments",
                    "grain": "one row per payment transaction",
                    "sources": ["fiction_retail.payments"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "amount",
                            "output": "settled_amount",
                            "reason": "Filtered payment transaction amount"
                        }
                    ],
                    "tests": [
                        {"column": "payment_id", "test": "unique", "reason": "Primary payment record identifier"},
                        {"column": "payment_id", "test": "not_null", "reason": "Payment ID cannot be null"}
                    ],
                    "metadata_gaps": [],
                    "assumptions": [
                        "Assuming payment_status SETTLED represents valid financial settlement"
                    ],
                    "explainability": [
                        {
                            "decision": "Add unique and not_null tests to payment_id",
                            "evidence": "DataHub column metadata identifies payment_id as primary key",
                            "confidence": "High",
                            "section": "Test"
                        }
                    ]
                })

            elif "stores" in prompt_lower:
                return json.dumps({
                    "target_model": "dim_stores",
                    "grain": "one row per retail store outlet",
                    "sources": ["fiction_retail.stores"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "concat(city, ', ', state)",
                            "output": "location_display",
                            "reason": "Formatted store city and state geographic display label"
                        }
                    ],
                    "tests": [
                        {"column": "store_id", "test": "unique", "reason": "Primary store identifier"},
                        {"column": "store_id", "test": "not_null", "reason": "Store ID cannot be null"}
                    ],
                    "metadata_gaps": [
                        {
                            "gap_type": "MISSING_DOMAIN",
                            "column": "domain",
                            "description": "Business domain classification missing in DataHub metadata",
                            "action_taken": "Assigned default Operations tag",
                            "confidence": "Medium"
                        }
                    ],
                    "assumptions": [
                        "Assuming store_status OPEN represents active retail location"
                    ],
                    "explainability": [
                        {
                            "decision": "Add unique test to store_id",
                            "evidence": "DataHub column metadata marks store_id as Primary Key",
                            "confidence": "High",
                            "section": "Test"
                        }
                    ]
                })

            elif "customer_lifetime_value" in prompt_lower:
                return json.dumps({
                    "target_model": "fct_customer_lifetime_value",
                    "grain": "one row per customer analytical cohort",
                    "sources": ["fiction_retail.customer_lifetime_value"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "total_spend / nullif(total_orders, 0)",
                            "output": "calculated_aov",
                            "reason": "Derived Average Order Value metric"
                        }
                    ],
                    "tests": [
                        {"column": "customer_id", "test": "unique", "reason": "Primary customer cohort identifier"},
                        {"column": "customer_id", "test": "not_null", "reason": "Customer ID cannot be null"}
                    ],
                    "metadata_gaps": [],
                    "assumptions": [
                        "Assuming total_spend represents net customer revenue"
                    ],
                    "explainability": [
                        {
                            "decision": "Derive calculated_aov metric",
                            "evidence": "DataHub column metadata definitions for total_spend and total_orders",
                            "confidence": "High",
                            "section": "Transformation"
                        }
                    ]
                })

            elif "customers" in prompt_lower:
                return json.dumps({
                    "target_model": "dim_customers",
                    "grain": "one row per customer",
                    "sources": ["fiction_retail.customers"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "concat(first_name, ' ', last_name)",
                            "output": "full_name",
                            "reason": "Derived full customer name from first_name and last_name"
                        },
                        {
                            "expression": "lower(email)",
                            "output": "clean_email",
                            "reason": "Standardized email address format"
                        }
                    ],
                    "tests": [
                        {"column": "customer_id", "test": "unique", "reason": "Primary key identifier"},
                        {"column": "customer_id", "test": "not_null", "reason": "Customer ID must not be null"}
                    ],
                    "metadata_gaps": [
                        {
                            "gap_type": "MISSING_DESCRIPTION",
                            "column": "country",
                            "description": "Column country lacks DataHub documentation description",
                            "action_taken": "Preserved raw ISO country code without transformation",
                            "confidence": "High"
                        }
                    ],
                    "assumptions": [
                        "Assuming country follows standard ISO-3166 2-letter country code format",
                        "Assuming ACTIVE customer_status represents active relationship"
                    ],
                    "explainability": [
                        {
                            "decision": "Add unique test to customer_id",
                            "evidence": "DataHub column metadata marks customer_id as Primary Key",
                            "confidence": "High",
                            "section": "Test"
                        }
                    ]
                })

            elif "monthly_revenue" in prompt_lower:
                return json.dumps({
                    "target_model": "monthly_revenue",
                    "grain": "one row per month and store",
                    "sources": ["fiction_retail.monthly_revenue"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "gross_revenue - discount_amount",
                            "output": "net_revenue",
                            "reason": "Calculate net revenue after deducting promotional discount"
                        }
                    ],
                    "tests": [
                        {"column": "month", "test": "not_null", "reason": "Cohort month cannot be null"},
                        {"column": "net_revenue", "test": "not_null", "reason": "Calculated net revenue metric"}
                    ],
                    "metadata_gaps": [],
                    "assumptions": [
                        "Assuming gross_revenue and discount_amount are in homogeneous local currency"
                    ],
                    "explainability": [
                        {
                            "decision": "Calculate net revenue as gross_revenue - discount_amount",
                            "evidence": "DataHub column definitions for gross_revenue and discount_amount",
                            "confidence": "High",
                            "section": "Transformation"
                        }
                    ]
                })

            else:
                # Default orders model
                return json.dumps({
                    "target_model": "fct_orders",
                    "grain": "one row per transaction order",
                    "sources": ["fiction_retail.orders"],
                    "joins": [],
                    "transformations": [
                        {
                            "expression": "quantity * unit_price",
                            "output": "order_value",
                            "reason": "Derived monetary value from available numeric quantity and unit_price fields"
                        }
                    ],
                    "tests": [
                        {"column": "order_id", "test": "unique", "reason": "Dataset identifier"},
                        {"column": "order_id", "test": "not_null", "reason": "Identifier cannot be null"}
                    ],
                    "metadata_gaps": [
                        {
                            "gap_type": "UNDEFINED_CURRENCY",
                            "column": "unit_price",
                            "description": "Currency definition unavailable in DataHub metadata",
                            "action_taken": "No currency conversion applied",
                            "confidence": "High"
                        }
                    ],
                    "assumptions": [
                        "No currency conversion applied because currency metadata is absent"
                    ],
                    "explainability": [
                        {
                            "decision": "Add unique and not_null tests to order_id",
                            "evidence": "DataHub column metadata identifies order_id as primary key identifier",
                            "confidence": "High",
                            "section": "Test"
                        }
                    ]
                })

        # 2. SQL Model Prompt
        if "model.sql" in prompt_lower or "dbt sql" in prompt_lower or "generate sql" in prompt_lower:
            if "join" in prompt_lower or "fct_customer_orders" in prompt_lower or ("orders" in prompt_lower and "customers" in prompt_lower):
                return """with orders as (

    select
        order_id,
        customer_id,
        order_date,
        quantity,
        unit_price,
        status
    from {{ source('fiction_retail', 'orders') }}

),

customers as (

    select
        customer_id,
        first_name,
        last_name,
        email,
        country
    from {{ source('fiction_retail', 'customers') }}

),

final as (

    select
        orders.order_id,
        orders.customer_id,
        concat(customers.first_name, ' ', customers.last_name) as customer_name,
        lower(customers.email) as clean_email,
        orders.order_date,
        orders.quantity,
        orders.unit_price,
        orders.quantity * orders.unit_price as order_value,
        orders.status,
        customers.country
    from orders
    inner join customers on orders.customer_id = customers.customer_id

)

select *
from final"""

            elif "products" in prompt_lower:
                return """with source_products as (

    select
        product_id,
        product_name,
        category,
        subcategory,
        brand,
        unit_cost,
        list_price,
        supplier_id,
        product_status
    from {{ source('fiction_retail', 'products') }}

),

final as (

    select
        product_id,
        product_name,
        category,
        subcategory,
        brand,
        unit_cost,
        list_price,
        (list_price - unit_cost) / list_price as margin_percentage,
        supplier_id,
        product_status
    from source_products
    where product_status = 'ACTIVE'

)

select *
from final"""

            elif "payments" in prompt_lower:
                return """with source_payments as (

    select
        payment_id,
        order_id,
        payment_method,
        payment_status,
        amount,
        payment_date,
        transaction_reference
    from {{ source('fiction_retail', 'payments') }}

),

final as (

    select
        payment_id,
        order_id,
        payment_method,
        payment_status,
        amount as settled_amount,
        payment_date,
        transaction_reference
    from source_payments
    where payment_status = 'SETTLED'

)

select *
from final"""

            elif "stores" in prompt_lower:
                return """with source_stores as (

    select
        store_id,
        store_name,
        city,
        state,
        country,
        region,
        store_type,
        opened_date,
        store_status
    from {{ source('fiction_retail', 'stores') }}

),

final as (

    select
        store_id,
        store_name,
        city,
        state,
        country,
        concat(city, ', ', state) as location_display,
        region,
        store_type,
        opened_date,
        store_status
    from source_stores
    where store_status = 'OPEN'

)

select *
from final"""

            elif "customer_lifetime_value" in prompt_lower:
                return """with source_clv as (

    select
        customer_id,
        first_order_date,
        last_order_date,
        total_orders,
        total_spend,
        average_order_value,
        lifetime_value
    from {{ source('fiction_retail', 'customer_lifetime_value') }}

),

final as (

    select
        customer_id,
        first_order_date,
        last_order_date,
        total_orders,
        total_spend,
        total_spend / nullif(total_orders, 0) as calculated_aov,
        lifetime_value
    from source_clv

)

select *
from final"""

            elif "customers" in prompt_lower:
                return """with source_customers as (

    select
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        signup_date,
        city,
        state,
        country,
        customer_status
    from {{ source('fiction_retail', 'customers') }}

),

final as (

    select
        customer_id,
        first_name,
        last_name,
        concat(first_name, ' ', last_name) as full_name,
        lower(email) as clean_email,
        phone,
        signup_date,
        city,
        state,
        country,
        customer_status
    from source_customers
    where customer_status = 'ACTIVE'

)

select *
from final"""

            elif "monthly_revenue" in prompt_lower:
                return """with source_monthly_revenue as (

    select
        month,
        store_id,
        total_orders,
        total_units,
        gross_revenue,
        discount_amount,
        net_revenue
    from {{ source('fiction_retail', 'monthly_revenue') }}

),

final as (

    select
        month,
        store_id,
        total_orders,
        total_units,
        gross_revenue,
        discount_amount,
        gross_revenue - discount_amount as net_revenue
    from source_monthly_revenue

)

select *
from final"""

            else:
                return """with source_orders as (

    select
        order_id,
        customer_id,
        product_id,
        store_id,
        order_date,
        quantity,
        unit_price,
        discount_amount,
        status
    from {{ source('fiction_retail', 'orders') }}

),

final as (

    select
        order_id,
        customer_id,
        product_id,
        store_id,
        order_date,
        quantity,
        unit_price,
        quantity * unit_price as order_value,
        discount_amount,
        status
    from source_orders

)

select *
from final"""

        # 3. schema.yml Prompt
        if "schema.yml" in prompt_lower or "yaml" in prompt_lower:
            return """version: 2

models:
  - name: fct_orders
    description: "Verified metadata-aware dbt model built from DataHub context."
    columns:
      - name: order_id
        description: "Primary key identifier"
        data_tests:
          - unique
          - not_null
      - name: customer_id
        description: "Foreign key reference targeting customers"
        data_tests:
          - not_null
      - name: order_value
        description: "Derived monetary order value"
"""

        # 4. README Prompt
        if "readme" in prompt_lower or "documentation" in prompt_lower:
            return """# dbt Model Documentation

## Model Overview
Verified dbt transformation model generated by **DataHub dbt Forge**.

## DataHub Metadata Quality & Gaps
- **UNDEFINED_CURRENCY**: Preserved native ledger numeric amounts.
"""

        return "OK"
