# Capture a Payment

**POST** `/v1/payments/:id/capture`

Use this endpoint to change the payment status from `authorized` to `captured`. Attempting to capture a payment whose status is not `authorized` will produce an error.

- After the customer's bank authorises the payment, you must verify if the authorised amount deducted from the customer's account is the same as the amount paid by the customer on your website or app.
- You can [configure automatic capture](https://razorpay.com/docs/payments/payments/capture-settings/#auto-capture-all-payments) of payments on the Dashboard.

## Path Parameters

**id** `string` *(required)* - Unique identifier of the payment to be captured.

## Request Parameters

**amount** `integer` *(required)* - The amount to be captured (should be equal to the order amount, in the smallest unit of the currency). While creating a capture request, in the `amount` field, enter only the amount associated with the order that is stored in your database.

**currency** `string` *(required)* - ISO code of the currency in which the payment was made.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-X POST https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/capture \
-d '{
"amount": 1000,
"currency": ""
}'
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

**card** `object` - Details of the card used to make the payment.

**bank** `string` - The 4-character bank code which the customer's account is associated with.

**wallet** `string` - The name of the wallet used by the customer to make the payment.

**acquirer_data** `array` - A dynamic array consisting of a unique reference numbers.

## Sample Response

```json
{
  "id": "pay_LPpN6ssnoEVNv0",
  "entity": "payment",
  "amount": 1000,
  "currency": "",
  "status": "captured",
  "order_id": null,
  "invoice_id": null,
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": true,
  "description": "Test Transaction",
  "card_id": "card_LPpN6ubeosLH4g",
  "card": {
    "id": "card_LPpN6ubeosLH4g",
    "entity": "card",
    "name": "",
    "last4": "0153",
    "network": "Visa",
    "type": "debit",
    "issuer": null,
    "international": false,
    "sub_type": "consumer",
    "token_iin": null
  },
  "bank": null,
  "wallet": null,
  "email": "john.smith@example.com",
  "contact": "+11234567890",
  "notes": {
    "address": "Corporate Office"
  },
  "fee": 100,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "error_source": null,
  "error_step": null,
  "error_reason": null,
  "acquirer_data": {
    "auth_code": "878694"
  },
  "created_at": 1678452635
}
```

## Common Errors

**The API <key/secret> provided is invalid** - Error Status: 4xx  
The API credentials passed in the API call differ from the ones generated on the Dashboard.

**Capture amount must be equal to the amount authorized** - Error Status: 400  
The capture amount is incorrect or differs from the authorised amount.

**Your payment has been declined as the order is already paid** - Error Status: 400  
This payment has already been captured.

**The id provided does not exist** - Error Status: 400  
The `payment_id` provided is incorrect.

**The requested URL was not found on the server** - Error Status: 400  
The URL is incorrect.

**The amount must be an integer** - Error Status: 400  
The amount specified is incorrect.

---

**Source:** https://razorpay.com/docs/api/payments/capture
