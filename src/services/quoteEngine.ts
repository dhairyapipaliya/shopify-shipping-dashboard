import type { ProviderQuote } from "./providers/types.js";

export type RankedQuote = ProviderQuote & {
  totalCost: number;
  tags: string[];
};

export const rankQuotes = (quotes: ProviderQuote[]) => {
  const ranked: RankedQuote[] = quotes
    .map((quote) => {
      const totalCost = quote.shippingCost + quote.codCharges;
      return { ...quote, totalCost, tags: [] };
    })
    .sort((a, b) => a.totalCost - b.totalCost);

  if (!ranked.length) {
    return { ranked, cheapest: null, savingsAmount: 0 };
  }

  const cheapest = ranked[0];
  cheapest.tags.push("cheapest");

  const highestCost = ranked[ranked.length - 1].totalCost;
  const savingsAmount = Number((highestCost - cheapest.totalCost).toFixed(2));

  return { ranked, cheapest, savingsAmount };
};
