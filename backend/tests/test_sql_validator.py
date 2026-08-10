import pytest
from app.datahub.client import DataHubClient
from app.agents.metadata_agent import MetadataAgent
from app.validation.sql_validator import SQLValidator

def test_valid_sql_validation():
    client = DataHubClient()
    agent = MetadataAgent(client)
    metadata = agent.analyze_dataset("urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)")
    
    valid_sql = """
    with orders as (
        select order_id, customer_id, quantity, unit_price
        from {{ source('retail', 'orders') }}
    )
    select order_id, customer_id, quantity * unit_price as order_value
    from orders
    """
    
    validator = SQLValidator()
    result = validator.validate_sql(valid_sql, metadata, allowed_derived_columns=["order_value"])
    
    assert result.is_valid is True
    assert result.syntax_valid is True
    assert result.columns_valid is True
    assert result.sources_valid is True

def test_hallucinated_column_detection():
    client = DataHubClient()
    agent = MetadataAgent(client)
    metadata = agent.analyze_dataset("urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)")
    
    # SQL references fake column `fake_discount_amount`
    bad_sql = """
    with orders as (
        select order_id, customer_id, fake_discount_amount
        from {{ source('retail', 'orders') }}
    )
    select * from orders
    """
    
    validator = SQLValidator()
    result = validator.validate_sql(bad_sql, metadata)
    
    assert result.is_valid is False
    assert result.columns_valid is False
    assert any("fake_discount_amount" in err for err in result.errors)

def test_hallucinated_table_detection():
    client = DataHubClient()
    agent = MetadataAgent(client)
    metadata = agent.analyze_dataset("urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)")
    
    # SQL joins unverified table `unauthorized_vendor_table`
    bad_sql = """
    select o.order_id, v.vendor_name
    from {{ source('retail', 'orders') }} o
    join {{ source('external', 'unauthorized_vendor_table') }} v on o.order_id = v.order_id
    """
    
    validator = SQLValidator()
    result = validator.validate_sql(bad_sql, metadata)
    
    assert result.is_valid is False
    assert result.sources_valid is False
    assert any("unauthorized_vendor_table" in err for err in result.errors)
