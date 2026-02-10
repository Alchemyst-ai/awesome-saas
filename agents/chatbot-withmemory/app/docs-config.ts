export type DocSectionMeta = {
  id: string;
  title: string;
  fileName: string;
  description: string;
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
];
