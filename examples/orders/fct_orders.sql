with orders as (

    select
        order_id,
        customer_id,
        order_date,
        quantity,
        unit_price,
        status,
        shipping_address
    from {{ source('retail', 'orders') }}

),

final as (

    select
        order_id,
        customer_id,
        order_date,
        quantity,
        unit_price,
        quantity * unit_price as order_value,
        status,
        shipping_address
    from orders

)

select *
from final
