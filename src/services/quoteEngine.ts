import type { ProviderQuote } from "./providers/types.js";

export type RankedQuote = ProviderQuote & {
  tags: string[];
  recommendationText: string;
};

export const rankQuotes = (quotes: ProviderQuote[]) => {
  const ranked: RankedQuote[] = quotes
    .map((quote) => ({
      ...quote,
      tags: [],
      recommendationText: "Manual selection required"
    }))
    .sort((a, b) => a.totalCost - b.totalCost);

  if (!ranked.length) {
    return { ranked, cheapest: null, savingsAmount: 0 };
  }

  const cheapest = ranked[0];
  cheapest.tags.push("recommended");
  cheapest.recommendationText = "Advisory: lowest cost option";

  const savingsAmount = Number((ranked[ranked.length - 1].totalCost - cheapest.totalCost).toFixed(2));
  return { ranked, cheapest, savingsAmount };
};
