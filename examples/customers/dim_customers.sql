with source_customers as (

    select
        customer_id,
        first_name,
        last_name,
        email,
        signup_date,
        country_code,
        account_status
    from {{ source('retail', 'customers') }}

),

final as (

    select
        customer_id,
        concat(first_name, ' ', last_name) as full_name,
        lower(email) as clean_email,
        signup_date,
        country_code,
        account_status
    from source_customers

)

select *
from final
