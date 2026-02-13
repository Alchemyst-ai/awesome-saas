# Create a Normal Refund

**POST** `/v1/payments/:id/refund`

Use this endpoint to create a normal refund for a payment.

## Path Parameters

**id** `string` *(required)* - The unique identifier of the payment which needs to be refunded.

## Request Parameters

**amount** `integer` - The amount to be refunded. Amount should be in the smallest unit of the currency in which the payment was made.

**speed** `string` - The speed at which the refund is to be processed. The default value is `normal`. Refund will be processed via the normal speed, and the customer will receive the refund within 5-7 working days.

**notes** `json object` - Key-value pairs used to store additional information. A maximum of 15 key-value pairs can be included.

**receipt** `string` - A unique identifier provided by you for your internal reference.

## Sample Request

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/refund \
-H 'Content-Type: application/json' \
-d '{
"amount": 500100
}'
```

## Response Parameters

**id** `string` - The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

**entity** `string` - Indicates the type of entity. Here, it is `refund`.

**amount** `integer` - The amount to be refunded (in the smallest unit of currency). For example, if the refund value is $30 it will be `3000`.

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
  "id": "rfnd_FP8QHiV938haTz",
  "entity": "refund",
  "amount": 500100,
  "receipt": "Receipt No. 31",
  "currency": "",
  "payment_id": "pay_29QQoUBi66xm2f",
  "notes": [],
  "receipt": null,
  "acquirer_data": {
    "arn": null
  },
  "created_at": 1597078866,
  "batch_id": null,
  "status": "processed",
  "speed_processed": "normal",
  "speed_requested": "normal"
}
```

## Common Errors

**The API {key/secret} provided is invalid** - Error Status: 4xx  
The API credentials passed in the API call differ from the ones generated on the Dashboard.

**{Payment_id} is not a valid id** - Error Status: 400  
The `payment_id` provided is invalid.

**The requested URL was not found on the server** - Error Status: 400  
Possible reasons:
- The URL is wrong or is missing something.
- A POST API is executed by GET method.

**{any Extra field} is/are not required and should not be sent** - Error Status: 400  
An additional or unrequired parameter is passed.

**The refund amount provided is greater than amount captured** - Error Status: 400  
The refund amount entered is more than the amount captured.

**The amount must be atleast USD 1.00** - Error Status: 400  
The refund amount entered is less than $1.

**The payment has been fully refunded already** - Error Status: 400  
The `payment_id` has already been refunded fully.

---

**Source:** https://razorpay.com/docs/api/refunds/create-normal
