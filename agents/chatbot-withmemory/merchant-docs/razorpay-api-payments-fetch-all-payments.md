# Fetch All Payments

**GET** `/v1/payments`

Use this endpoint to retrieve details of all the payments. By default, only the last 10 records are displayed. You can use the `count` and `skip` parameters to retrieve the specific number of records that you need.

## Query Parameters

**from** `integer` - UNIX timestamp, in seconds, from when payments are to be fetched.

**to** `integer` - UNIX timestamp, in seconds, till when payments are to be fetched.

**count** `integer` - Number of payments to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination, in combination with the `skip` parameter.

**skip** `integer` - Number of records to be skipped while fetching the payments.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/payments?from=1593320020&to=1624856020&count=2&skip=1
```

## Response Parameters

**id** `string` - Unique identifier of the payment.

**entity** `string` - Indicates the type of entity.

**amount** `integer` - The payment amount in currency subunits. For example, for an amount of $1 enter 100.

**currency** `string` - The currency in which the payment is made.

**status** `string` - The status of the payment. Possible values: `created`, `authorized`, `captured`, `refunded`, `failed`

**method** `string` - The payment method used for making the payment. Possible values: `card`, `ach`

**order_id** `string` - Order id, if provided. Know more about [Orders](https://razorpay.com/docs/payments/orders/).

**description** `string` - Description of the payment, if any.

**international** `boolean` - Indicates whether the payment is done via an international card or a domestic one.

**refund_status** `string` - The refund status of the payment. Possible values: `null`, `partial`, `full`

**amount_refunded** `integer` - The amount refunded in currency subunits. For example, if `amount_refunded = 100`, it is equal to $1.

**captured** `boolean` - Indicates if the payment is captured.

**email** `string` - Customer email address used for the payment.

**contact** `string` - Customer contact number used for the payment.

**fee** `integer` - Fee (including tax) charged by Razorpay.

**tax** `integer` - Tax charged for the payment.

**error_code** `string` - Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

**error_description** `string` - Description of the error that occurred during payment.

**error_source** `string` - The point of failure. For example, `customer`.

**error_step** `string` - The stage where the transaction failure occurred.

**error_reason** `string` - The exact error reason. For example, `incorrect_otp`.

**notes** `json object` - Contains user-defined fields, stored for reference purposes.

**created_at** `integer` - Timestamp, in UNIX format, on which the payment was created.

**card_id** `string` - The unique identifier of the card used by the customer to make the payment.

**upi** `object` - Details of the UPI payment received. Only applicable if `method` is `upi`.

**bank** `string` - The 4-character bank code which the customer's account is associated with. For example, `UTIB` for Axis Bank.

**vpa** `string` - The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, `gauravkumar@exampleupi`.

**wallet** `string` - The name of the wallet used by the customer to make the payment. For example, `payzapp`.

**acquirer_data** `array` - A dynamic array consisting of a unique reference numbers.

**issuer** `string` - The card issuer. The 4-character code denotes the issuing bank. This attribute will not be set for the card issued by a foreign bank.

**emi** `boolean` - Indicates whether the card can be used for EMI payment method.

**sub_type** `string` - The sub-type of the customer's card. Possible values: `customer`, `business`. Know how to accept payments made by customers using [corporate cards](https://razorpay.com/docs/payments/payment-methods/cards/corporate-cards/).

## Sample Response

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_KbCFyQ0t9Lmi1n",
      "entity": "payment",
      "amount": 1000,
      "currency": "",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "ach",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "email": "john.smith@example.com",
      "contact": "+11234567890",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "5733649"
      },
      "created_at": 1667397881
    },
    {
      "id": "pay_KbCEDHh1IrU4RJ",
      "entity": "payment",
      "amount": 1000,
      "currency": "",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "card",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "email": "john.smith@example.com",
      "contact": "+11234567890",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "230901495295"
      },
      "created_at": 1667397781
    }
  ]
}
```

## Common Errors

**The API {key/secret} provided is invalid** - Error Status: 4xx  
The API credentials passed in the API call differ from the ones generated on the Dashboard.

**from must be between 946684800 and 4765046400** - Error Status: 400  
The time range entered is invalid.

---

**Source:** https://razorpay.com/docs/api/payments/fetch-all-payments
