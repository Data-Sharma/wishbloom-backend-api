export interface EcommerceSearchOptions {
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
}

export interface EcommerceProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  source: string; // e.g. "amazon", "flipkart"
}

export interface EcommerceProvider {
  name: string;
  search(query: string, options?: EcommerceSearchOptions): Promise<EcommerceProduct[]>;
}

class MockEcommerceProvider implements EcommerceProvider {
  name = "mock";

  async search(query: string, options?: EcommerceSearchOptions): Promise<EcommerceProduct[]> {
    const limit = options?.limit ?? 10;
    return Array.from({length: limit}).map((_, idx) => ({
      id: `mock-${idx + 1}`,
      title: `Sample gift for '${query}' #${idx + 1}`,
      description: "Mock product. Replace provider with real Amazon/Flipkart integration.",
      price: 999 + idx * 100,
      currency: "INR",
      imageUrl: undefined,
      productUrl: "https://example.com/product/mock",
      affiliateUrl: undefined,
      source: this.name,
    }));
  }
}

const mockProvider = new MockEcommerceProvider();

function getActiveProvider(): EcommerceProvider {
  const providerName = (process.env.AFFILIATE_PROVIDER || "mock").toLowerCase();
  // In future, switch on providerName to return Amazon/Flipkart/Myntra providers.
  switch (providerName) {
  default:
    return mockProvider;
  }
}

export async function searchEcommerceProducts(
  query: string,
  options?: EcommerceSearchOptions
): Promise<{ query: string; provider: string; results: EcommerceProduct[] }> {
  const provider = getActiveProvider();
  const results = await provider.search(query, options);
  return {
    query,
    provider: provider.name,
    results,
  };
}
