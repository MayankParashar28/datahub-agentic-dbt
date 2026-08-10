"""
Seed metadata snapshots for DataHub dbt Forge.
Used in Demo Mode or when local DataHub instance is unreachable.
"""

DEMO_DATASETS = {
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)",
        "name": "retail.orders",
        "platform": "snowflake",
        "description": "Raw transaction orders table containing customer purchase details, quantities, unit pricing, and status.",
        "columns": [
            {
                "name": "order_id",
                "data_type": "NUMBER",
                "description": "Unique identifier for each transaction order",
                "tags": ["Primary_Key"],
                "glossary_terms": ["Order_ID"],
                "is_primary_key": True,
                "is_foreign_key": False
            },
            {
                "name": "customer_id",
                "data_type": "NUMBER",
                "description": "Unique reference to purchasing customer",
                "tags": ["Foreign_Key"],
                "glossary_terms": ["Customer_ID"],
                "is_primary_key": False,
                "is_foreign_key": True,
                "foreign_key_target": "retail.customers.customer_id"
            },
            {
                "name": "order_date",
                "data_type": "TIMESTAMP",
                "description": "Timestamp when order was placed",
                "tags": ["Event_Time"],
                "glossary_terms": ["Order_Timestamp"]
            },
            {
                "name": "quantity",
                "data_type": "NUMBER",
                "description": "Number of item units purchased",
                "tags": ["Metric"]
            },
            {
                "name": "unit_price",
                "data_type": "DECIMAL(12,2)",
                "description": "Unit price of item purchased in cents/local value",
                "tags": ["Monetary"]
            },
            {
                "name": "status",
                "data_type": "VARCHAR(20)",
                "description": None,
                "tags": ["Status_Flag"]
            },
            {
                "name": "shipping_address",
                "data_type": "VARCHAR(255)",
                "description": "Customer delivery street address",
                "tags": ["PII"]
            }
        ],
        "upstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:postgres,raw_pos.transactions,PROD)",
                "name": "raw_pos.transactions",
                "platform": "postgres",
                "relationship_type": "UPSTREAM"
            }
        ],
        "downstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.fct_orders,PROD)",
                "name": "analytics.fct_orders",
                "platform": "snowflake",
                "relationship_type": "DOWNSTREAM"
            }
        ],
        "glossary_terms": ["Order_Management", "Financial_Transaction"],
        "tags": ["Tier-1", "PII"],
        "owners": ["alex.dataengineer@company.com", "analytics-team"],
        "domain": "E-Commerce"
    },
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.customers,PROD)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.customers,PROD)",
        "name": "retail.customers",
        "platform": "snowflake",
        "description": "Customer dimension metadata storing customer contact info, signup date, and account status.",
        "columns": [
            {
                "name": "customer_id",
                "data_type": "NUMBER",
                "description": "Primary key for customer account",
                "tags": ["Primary_Key"],
                "glossary_terms": ["Customer_ID"],
                "is_primary_key": True
            },
            {
                "name": "first_name",
                "data_type": "VARCHAR(50)",
                "description": "Customer given first name",
                "tags": ["PII"]
            },
            {
                "name": "last_name",
                "data_type": "VARCHAR(50)",
                "description": "Customer surname / last name",
                "tags": ["PII"]
            },
            {
                "name": "email",
                "data_type": "VARCHAR(100)",
                "description": "Customer primary contact email address",
                "tags": ["PII", "Sensitive"]
            },
            {
                "name": "signup_date",
                "data_type": "DATE",
                "description": "Account registration date",
                "tags": []
            },
            {
                "name": "country_code",
                "data_type": "VARCHAR(2)",
                "description": None,
                "tags": []
            },
            {
                "name": "account_status",
                "data_type": "VARCHAR(20)",
                "description": "Account status (ACTIVE, INACTIVE, SUSPENDED)",
                "tags": []
            }
        ],
        "upstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:postgres,raw_crm.users,PROD)",
                "name": "raw_crm.users",
                "platform": "postgres",
                "relationship_type": "UPSTREAM"
            }
        ],
        "downstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.dim_customers,PROD)",
                "name": "analytics.dim_customers",
                "platform": "snowflake",
                "relationship_type": "DOWNSTREAM"
            }
        ],
        "glossary_terms": ["Customer_360", "CRM"],
        "tags": ["Tier-1", "PII", "GDPR"],
        "owners": ["sara.crmlead@company.com"],
        "domain": "Customer Insights"
    },
    "urn:li:dataset:(urn:li:dataPlatform:snowflake,finance.transactions,PROD)": {
        "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,finance.transactions,PROD)",
        "name": "finance.transactions",
        "platform": "snowflake",
        "description": "Ledger transaction records for financial reporting and monthly revenue aggregation.",
        "columns": [
            {
                "name": "transaction_id",
                "data_type": "VARCHAR(64)",
                "description": "Unique ledger item transaction UUID",
                "tags": ["Primary_Key"],
                "glossary_terms": ["Transaction_ID"],
                "is_primary_key": True
            },
            {
                "name": "account_id",
                "data_type": "NUMBER",
                "description": "Chart of accounts reference ID",
                "tags": ["Foreign_Key"]
            },
            {
                "name": "transaction_timestamp",
                "data_type": "TIMESTAMP",
                "description": "Execution timestamp of transaction",
                "tags": ["Event_Time"]
            },
            {
                "name": "gross_amount",
                "data_type": "DECIMAL(14,2)",
                "description": "Gross total monetary transaction amount",
                "tags": ["Monetary"]
            },
            {
                "name": "tax_amount",
                "data_type": "DECIMAL(14,2)",
                "description": "Tax portion of transaction",
                "tags": ["Monetary"]
            },
            {
                "name": "discount_amount",
                "data_type": "DECIMAL(14,2)",
                "description": None,
                "tags": ["Monetary"]
            },
            {
                "name": "payment_method",
                "data_type": "VARCHAR(30)",
                "description": "Payment channel (CREDIT_CARD, WIRE, PAYPAL)",
                "tags": []
            }
        ],
        "upstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:kafka,payments.events,PROD)",
                "name": "payments.events",
                "platform": "kafka",
                "relationship_type": "UPSTREAM"
            }
        ],
        "downstream": [
            {
                "urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.monthly_revenue,PROD)",
                "name": "analytics.monthly_revenue",
                "platform": "snowflake",
                "relationship_type": "DOWNSTREAM"
            }
        ],
        "glossary_terms": ["Revenue_Recognition", "General_Ledger"],
        "tags": ["SOX_Audit", "Finance_Core"],
        "owners": ["david.finance@company.com"],
        "domain": "Finance & Accounting"
    }
}
