# Orders APIs

You can create [Orders](https://razorpay.com/docs/payments/orders/) and link them to payments. Orders APIs are used to create, update and retrieve details of Orders. Also, you can retrieve details of payments made towards these Orders.

## Related Guides

- [About Orders](https://razorpay.com/docs/payments/orders/)
- [Set Up Webhooks](https://razorpay.com/docs/webhooks/setup-edit-payments/)
- [Webhook Payloads](https://razorpay.com/docs/webhooks/orders/)

## Endpoints

### 1. Create an Order
**POST** - Creates an order by providing basic details such as amount and currency.

[Documentation](https://razorpay.com/docs/api/orders/create/)

### 2. Fetch All Orders
**GET** - Retrieves details of all the orders.

[Documentation](https://razorpay.com/docs/api/orders/fetch-all/)

### 3. Fetch All Orders (Example 1)
**GET** - Retrieves details of all the orders and expands the payments object.

[Documentation](https://razorpay.com/docs/api/orders/fetch-all-expanded-payments/)

### 4. Fetch All Orders (Example 2)
**GET** - Retrieves details of all the orders and expands cards parameter in the payments object.

[Documentation](https://razorpay.com/docs/api/orders/fetch-all-expanded-card-payments/)

### 5. Fetch Order With ID
**GET** - Retrieves details of a particular order.

[Documentation](https://razorpay.com/docs/api/orders/fetch-with-id/)

### 6. Fetch All Payments for an Order
**GET** - Retrieves all the payments made for an order.

[Documentation](https://razorpay.com/docs/api/orders/fetch-payments/)

### 7. Update an Order
**PATCH** - Modifies an existing order.

[Documentation](https://razorpay.com/docs/api/orders/update/)

---

## Related Resources

- [Orders Entity](https://razorpay.com/docs/api/orders/entity)

---

**Source:** https://razorpay.com/docs/api/orders
