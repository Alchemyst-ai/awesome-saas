# Update a Refund

**PATCH** `/v1/refunds/:id/`

Use this endpoint to update the `notes` parameter for a refund. You can modify an existing refund to update the `notes` field **only**.

- Notes can be used to record additional information about the payment.
- You can add up to 15 key-value pairs with each value of the key not exceeding 256 characters.

## Path Parameters

**id** `string` *(required)* - Unique identifier of the refund for which the `notes` field should be updated.

## Request Parameters

**notes** `json object` *(required)* - Additional information to be modified or added as part of `notes` field in key-pair format. Know more about [notes](https://razorpay.com/docs/api/understand/#notes).

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PATCH https://api.razorpay.com/v1/refunds/rfnd_DfjjhJC6eDvUAi \
-H 'Content-Type: application/json' \
-d '{
"notes": {
"notes_key_1":"Beam me up Scotty.",
"notes_key_2":"Engage"
}
}'
```

## Response Parameters

**id** `string` - The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

**entity** `string` - Indicates the type of entity. Here, it is `refund`.

**amount** `integer` - The amount to be refunded (in the smallest unit of currency). For example, if the refund value is $30, it will be `3000`.

**currency** `string` - The currency of payment amount for which the refund is initiated.

**payment_id** `string` - The unique identifier of the payment for which a refund is initiated. For example, `pay_FgR9UMzgmKDJRi`.

**created_at** `integer` - Unix timestamp at which the refund was created. For example, `1600856650`.

**batch_id** `string` - This parameter is populated if the refund was created as part of a batch upload. For example, `batch_00000000000001`.

**notes** `json object` - Key-value store for storing your reference data. A maximum of 15 key-value pairs can be included. For example, `"note_key": "Beam me up Scotty"`.

**receipt** `string` - A unique identifier provided by you for your internal reference.

**acquirer_data** `array` - A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

**status** `string` - Indicates the state of the refund. Possible values:
- `pending`: This state indicates that Razorpay is attempting to process the refund.
- `processed`: This is the final state of the refund.
- `failed`: A refund can attain the failed state in the following scenarios: Refund is not possible for a payment which is more than 6 months old.

**speed_requested** `string` - The processing mode of the refund seen in the refund response. This attribute is seen in the refund response only if the `speed` parameter is set in the refund request. Possible value is `normal`, which indicates that the refund will be processed via the normal speed. The refund will take 5-7 working days.

**speed_processed** `string` - This is a parameter in the response which describes the mode used to process a refund. This attribute is seen in the refund response only if the `speed` parameter is set in the refund request. Possible value is `normal`, which indicates that the refund has been processed by the payment processing partner. The refund will take 5-7 working days.

## Sample Response

```json
{
  "id": "rfnd_DfjjhJC6eDvUAi",
  "entity": "refund",
  "amount": 300100,
  "currency": "",
  "payment_id": "pay_FIKOnlyii5QGNx",
  "notes": {
    "notes_key_1": "Beam me up Scotty.",
    "notes_key_2": "Engage"
  },
  "receipt": null,
  "acquirer_data": {
    "arn": "10000000000000"
  },
  "created_at": 1597078124,
  "batch_id": null,
  "status": "processed",
  "speed_processed": "normal",
  "speed_requested": "normal"
}
```

## Common Errors

**The API {key/secret} provided is invalid** - Error Status: 4xx  
The API credentials passed in the API call differ from the ones generated on the Dashboard.

**The requested URL was not found on the server** - Error Status: 400  
Possible reasons:
- A PATCH API is executed by POST method.
- The URL is wrong or is missing something.
- The refund id is not entered.

**{rfnd_id} is not a valid id** - Error Status: 400  
The refund id entered is invalid or incomplete.

**The notes field is required** - Error Status: 400  
The request body does not include the `notes` parameter.

---

**Source:** https://razorpay.com/docs/api/refunds/update
