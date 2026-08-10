with source_transactions as (

    select
        transaction_id,
        account_id,
        transaction_timestamp,
        gross_amount,
        tax_amount,
        discount_amount,
        payment_method
    from {{ source('finance', 'transactions') }}

),

final as (

    select
        date_trunc('month', transaction_timestamp) as revenue_month,
        payment_method,
        count(distinct transaction_id) as total_transactions,
        sum(gross_amount) as gross_revenue,
        sum(coalesce(discount_amount, 0)) as total_discounts,
        sum(gross_amount - coalesce(discount_amount, 0)) as net_revenue
    from source_transactions
    group by 1, 2

)

select *
from final
