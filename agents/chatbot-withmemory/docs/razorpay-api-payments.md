# Payments APIs

Payments APIs are used to capture and fetch payments. You can also fetch payments based on orders and card details of payment.

## Handy Tips

You can use Payments API only to retrieve payment details or change the status from `authorized` to `captured` and **not** to collect payments. You can use our [products](https://razorpay.com/docs/payments/) to accept payments.

## Related Guides

- [About Payments](https://razorpay.com/docs/payments/)
- [Set Up Webhooks](https://razorpay.com/docs/webhooks/setup-edit-payments/)
- [Sample Payloads](https://razorpay.com/docs/webhooks/payments/)

## Endpoints

### 1. Capture a Payment
**POST** - Captures a payment.

[Documentation](https://razorpay.com/docs/api/payments/capture/)

### 2. Fetch a Payment With ID
**GET** - Retrieves details of a specific payment using id.

[Documentation](https://razorpay.com/docs/api/payments/fetch-with-id/)

### 3. Fetch a Payment With ID (Example 1)
**GET** - Retrieves details of all the payments that is created, with the `card` parameter.

[Documentation](https://razorpay.com/docs/api/payments/fetch-payment-expanded-card/)

### 4. Fetch All Payments
**GET** - Retrieves details of all payments.

[Documentation](https://razorpay.com/docs/api/payments/fetch-all-payments/)

### 5. Fetch All Payments (Example 1)
**GET** - Retrieves expanded card details of a payment.

[Documentation](https://razorpay.com/docs/api/payments/fetch-all-payments-with-expanded-card-details/)

### 6. Fetch Payments Based on Orders
**GET** - Retrieves payments linked to an Order.

[Documentation](https://razorpay.com/docs/api/payments/fetch-payments-orders/)

### 7. Fetch Card Details of a Payment
**GET** - Retrieves card details of a payment.

[Documentation](https://razorpay.com/docs/api/payments/fetch-card-details-payment/)

### 8. Update a Payment
**PATCH** - Edits an existing payment.

[Documentation](https://razorpay.com/docs/api/payments/update/)

---

## Related Resources

- [Payments Entity](https://razorpay.com/docs/api/payments/entity)
- [Downtime](https://razorpay.com/docs/api/payments/downtime)

---

**Source:** https://razorpay.com/docs/api/payments
