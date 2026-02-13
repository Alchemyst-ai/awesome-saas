# Update an Order

**PATCH** `/v1/orders/:id`

Use this endpoint to update an Order.

- You can modify an existing order to update the `Notes` field **only**.
- Notes can be used to record additional information about the order.
- A key-value store, the `notes` field can have a maximum of 15 key-value pairs, each of 256 characters (maximum).

## Path Parameters

**id** `string` *(required)* - Unique identifier of the order in which the `Notes` field must be updated.

## Request Parameters

**notes** `json object` *(required)* - Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PATCH https://api.razorpay.com/v1/orders/order_DaaS6LOUAASb7Y \
-d '{
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

**currency** `string` *(required)* - ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

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
  "id": "order_DaaS6LOUAASb7Y",
  "entity": "order",
  "amount": 2200,
  "amount_paid": 0,
  "amount_due": 2200,
  "currency": "",
  "receipt": "Receipt #211",
  "offer_id": null,
  "status": "attempted",
  "attempts": 1,
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1572505143
}
```

## Common Errors

**The API <key/secret> provided is invalid** - Error Status: 400  
The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:
- Different keys for test mode and live modes.
- Expired API key.

**id is not a valid id** - Error Status: 400  
The `order_id` passed is invalid.

**The id provided does not exist** - Error Status: 400  
The `order_id` does not exist or does not belong to the requestor.

---

**Source:** https://razorpay.com/docs/api/orders/update
