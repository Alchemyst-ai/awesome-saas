export type DocSectionMeta = {
  id: string;
  title: string;
  fileName: string;
  description: string;
  directory?: 'docs' | 'merchant-docs';
};

export const DOC_FILES: DocSectionMeta[] = [
  {
    id: 'understand',
    title: 'Understand Razorpay APIs',
    fileName: 'razorpay-api-understand.md',
    description: 'API basics, REST conventions, status codes, and pagination.',
  },
  {
    id: 'payments',
    title: 'Payments APIs',
    fileName: 'razorpay-api-payments.md',
    description: 'Capture and fetch payments, including expanded details and related resources.',
  },
  {
    id: 'orders',
    title: 'Orders APIs',
    fileName: 'razorpay-api-orders.md',
    description: 'Create, update, and fetch orders along with order-linked payments.',
  },
  {
    id: 'orders-create',
    title: 'Orders Create',
    fileName: 'razorpay-api-orders-create.md',
    description: 'Create new orders for payment collection.',
    directory: 'merchant-docs',
  },
  {
    id: 'orders-fetch-all',
    title: 'Orders Fetch All',
    fileName: 'razorpay-api-orders-fetch-all.md',
    description: 'Fetch all orders with filtering options.',
    directory: 'merchant-docs',
  },
  {
    id: 'orders-update',
    title: 'Orders Update',
    fileName: 'razorpay-api-orders-update.md',
    description: 'Update existing orders and their details.',
    directory: 'merchant-docs',
  },
  {
    id: 'payments-capture',
    title: 'Payments Capture',
    fileName: 'razorpay-api-payments-capture.md',
    description: 'Capture authorized payments.',
    directory: 'merchant-docs',
  },
  {
    id: 'payments-fetch-all',
    title: 'Payments Fetch All',
    fileName: 'razorpay-api-payments-fetch-all-payments.md',
    description: 'Fetch all payments for an account.',
    directory: 'merchant-docs',
  },
  {
    id: 'payments-fetch-all-expanded-card',
    title: 'Payments Fetch All Expanded Card',
    fileName: 'razorpay-api-payments-fetch-all-payments-expanded-card.md',
    description: 'Fetch payments with expanded card details.',
    directory: 'merchant-docs',
  },
  {
    id: 'payments-fetch-with-id',
    title: 'Payments Fetch With ID',
    fileName: 'razorpay-api-payments-fetch-with-id.md',
    description: 'Fetch a single payment by its ID.',
    directory: 'merchant-docs',
  },
  {
    id: 'payments-update',
    title: 'Payments Update',
    fileName: 'razorpay-api-payments-update.md',
    description: 'Update payment notes and metadata.',
    directory: 'merchant-docs',
  },
  {
    id: 'refunds-create-normal',
    title: 'Refunds Create',
    fileName: 'razorpay-api-refunds-create-normal.md',
    description: 'Create refunds for successful payments.',
    directory: 'merchant-docs',
  },
  {
    id: 'refunds-fetch-all',
    title: 'Refunds Fetch All',
    fileName: 'razorpay-api-refunds-fetch-all.md',
    description: 'Fetch all refunds with query filters.',
    directory: 'merchant-docs',
  },
  {
    id: 'refunds-update',
    title: 'Refunds Update',
    fileName: 'razorpay-api-refunds-update.md',
    description: 'Update refund notes and metadata.',
    directory: 'merchant-docs',
  },
];
