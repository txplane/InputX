const modelPriceMap = {
  'gpt-4o': process.env.PRICE_ID_GPT4O,
  'gpt-3.5-turbo': process.env.PRICE_ID_GPT3,
  'gpt-4': process.env.PRICE_ID_GPT4,
  'llama3': process.env.PRICE_ID_LOCAL,
  'mistral': process.env.PRICE_ID_LOCAL,
  'gemma': process.env.PRICE_ID_LOCAL,
  'codellama': process.env.PRICE_ID_LOCAL,
};

const apiKeyToStripeItem = {
  'testkey1': {
    'gpt-4o': 'si_gpt4o_testkey1',
    'gpt-3.5-turbo': 'si_gpt3_testkey1',
    'gpt-4': 'si_gpt4_testkey1',
    'llama3': 'si_local_testkey1',
  },
};

export async function reportUsageToStripe(apiKey, model, tokensUsed) {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const itemMap = apiKeyToStripeItem[apiKey];

  if (!itemMap || !itemMap[model]) {
    console.warn(`Missing Stripe subscription item for API key: ${apiKey}, model: ${model}`);
    return;
  }

  const subscriptionItemId = itemMap[model];

  await stripe.usageRecords.create(subscriptionItemId, {
    quantity: Math.ceil(tokensUsed / 1000),
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  });

  console.log(`Reported ${tokensUsed} tokens (~${Math.ceil(tokensUsed / 1000)}K) for ${apiKey} [${model}] to Stripe`);
}
