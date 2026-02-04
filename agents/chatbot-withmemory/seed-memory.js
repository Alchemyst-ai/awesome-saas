import 'dotenv/config';
import AlchemystAI from '@alchemystai/sdk';

const alchemystApiKey = process.env.ALCHEMYST_AI_API_KEY || '';
if (!alchemystApiKey) {
  console.error('Missing env var ALCHEMYST_AI_API_KEY.');
  process.exit(1);
}

const alchemyst = new AlchemystAI({ apiKey: alchemystApiKey });

const seedDocs = [
  {
    title: 'Razorpay Onboarding',
    content:
      'Merchants can sign up, complete KYC, and activate their account before accepting live payments. Test mode is available for integration and QA.'
  },
  {
    title: 'Payments and Refunds',
    content:
      'Refunds can be initiated from the dashboard or via API. Partial and full refunds are supported depending on payment method.'
  },
  {
    title: 'Subscriptions',
    content:
      'Subscriptions allow recurring billing. You can define plans, trial periods, and capture payments automatically on schedule.'
  },
  {
    title: 'Webhooks',
    content:
      'Webhooks notify your server about events like payment.captured, refund.processed, and subscription.charged. Secure with a secret and verify signatures.'
  },
  {
    title: 'Payouts',
    content:
      'Payouts let you transfer funds to vendors or customers. You can create contacts and fund accounts before initiating payouts.'
  }
];

async function seed() {
  const timestamp = new Date().toISOString();

  await alchemyst.v1.context.add({
    documents: seedDocs.map((doc) => ({
      content: `${doc.title}: ${doc.content}`,
    })),
    context_type: 'resource',
    source: `razorpay-demo-seed-${timestamp}`,
    scope: 'internal',
    metadata: {
      fileName: `razorpay-demo-seed-${timestamp}.txt`,
      fileType: 'text/plain',
      lastModified: timestamp,
      fileSize: seedDocs.reduce((sum, doc) => sum + doc.content.length, 0),
    },
  });

  console.log('Seeded Razorpay demo memory into Alchemyst AI.');
}

seed().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error: ${message}`);
  process.exit(1);
});
