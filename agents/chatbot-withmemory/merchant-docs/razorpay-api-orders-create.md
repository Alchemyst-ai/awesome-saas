# Create an Order

**POST** `/v1/orders`

Use this endpoint to create an order with basic details such as amount and currency.

## Request Parameters

**amount** `integer` *(required)* - The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`. Payment can only be made for this amount against the Order.

**currency** `string` *(required)* - ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

**receipt** `string` - Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

**notes** `json object` - Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

**partial_payment** `boolean` - Indicates whether the customer can make a partial payment. Possible values:
- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

**first_payment_min_amount** `integer` - Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of $700 is to be received from the customer in two installments of #1 - $500, #2 - $200, then you can set this value as `50000`. This parameter should be passed only if `partial_payment` is `true`.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json" \
-d '{
"amount": 5000,
"currency": "",
"receipt": "receipt#1",
"notes": {
"key1": "value3",
"key2": "value2"
}
}'
```

## Response Parameters

**id** `string` - The unique identifier of the order.

**amount** `integer` - The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`.

**entity** `string` - Name of the entity. Here, it is `order`.

**amount_paid** `integer` - The amount paid against the order.

**amount_due** `integer` - The amount pending against the order.

**currency** `string` - ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

**receipt** `string` - Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

**status** `string` - The status of the order. Possible values:
- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

**attempts** `integer` - The number of payment attempts, successful and failed, that have been made against this order.

**notes** `json object` - Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

**created_at** `integer` - Indicates the Unix timestamp when this order was created.

## Sample Response

```json
{
  "amount": 5000,
  "amount_due": 5000,
  "amount_paid": 0,
  "attempts": 0,
  "created_at": 1756455561,
  "currency": "INR",
  "entity": "order",
  "id": "order_RB58MiP5SPFYyM",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "offer_id": null,
  "receipt": "receipt#1",
  "status": "created"
}
```

## Common Errors

**Authentication failed** - Error Status: 400  
The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:
- Different keys for test mode and live modes.
- Expired API key.

**Order amount less than minimum amount allowed** - Error Status: 400  
The amount specified is less than the minimum amount, that is `10`.

**The field name is required** - Error Status: 400  
A mandatory field is missing.

---

**Source:** https://razorpay.com/docs/api/orders/create/
