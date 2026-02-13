# Fetch All Orders

**GET** `/v1/orders`

Use this endpoint to retrieve the details of all the orders you created. In this example, **count and skip query parameters** have been used. You can invoke this API without these query parameters as well.

## Query Parameters

**authorized** `integer` - Possible values:
- `1`: Retrieves Orders for which payments have been authorized. Payment and order states differ. Know more about [payment states](https://razorpay.com/docs/payments/payments/#payment-life-cycle).
- `0`: Retrieves orders for which payments have not been authorized.

**receipt** `string` - Retrieves the orders that contain the provided value for receipt.

**from** `integer` - Timestamp (in Unix format) from when the orders should be fetched.

**to** `integer` - Timestamp (in Unix format) up till when orders are to be fetched.

**count** `integer` - The number of orders to be fetched. The default value is 10. The maximum value is 100. This can be used for pagination, in combination with `skip`.

**skip** `integer` - The number of orders to be skipped. The default value is `0`. This can be used for pagination, in combination with `count`.

**expand[]** `array` - Used to retrieve additional information about the payment. Using this parameter will cause a sub-entity to be added to the response. Supported values are:
- `payments`: Returns a collection of all payments made for each order.
- `payments.card`: Returns the card details of each payment made for each order.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/orders?count=2&skip=1
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
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "order_EKzX2WiEWbMxmx",
      "entity": "order",
      "amount": 1234,
      "amount_paid": 0,
      "amount_due": 1234,
      "currency": "",
      "receipt": "Receipt No. 1",
      "offer_id": null,
      "status": "created",
      "attempts": 0,
      "notes": [],
      "created_at": 1582637108
    },
    {
      "id": "order_EAI5nRfThga2TU",
      "entity": "order",
      "amount": 100,
      "amount_paid": 0,
      "amount_due": 100,
      "currency": "",
      "receipt": "Receipt No. 1",
      "offer_id": null,
      "status": "created",
      "attempts": 0,
      "notes": [],
      "created_at": 1580300731
    }
  ]
}
```

## Common Errors

**The API <key/secret> provided is invalid** - Error Status: 400  
The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:
- Different keys for test mode and live modes.
- Expired API key.

---

**Source:** https://razorpay.com/docs/api/orders/fetch-all
