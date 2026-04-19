import { describe, expect, it } from "vitest";
import { getSharedOrderById } from "../src/data/sharedOrders.js";
import { getDispatchRateOptions, getDispatchRateProviderGroups } from "../src/services/dispatchRates.js";

describe("dispatch rate provider groups", () => {
  it("returns grouped provider columns for direct and aggregator options", () => {
    const order = getSharedOrderById("gid://shopify/Order/6100001001");
    expect(order).toBeDefined();

    const groups = getDispatchRateProviderGroups(order!);
    expect(groups.map((group) => group.provider_group_id)).toEqual(["direct_delhivery", "shipmozo"]);

    const directGroup = groups.find((group) => group.provider_group_id === "direct_delhivery");
    const shipmozoGroup = groups.find((group) => group.provider_group_id === "shipmozo");

    expect(directGroup?.options).toHaveLength(1);
    expect(shipmozoGroup?.options.length ?? 0).toBeGreaterThan(1);
    expect(shipmozoGroup?.options.every((option) => option.source_name === "shipmozo")).toBe(true);
  });

  it("preserves flat options for selection lookup", () => {
    const order = getSharedOrderById("gid://shopify/Order/6100001002");
    expect(order).toBeDefined();

    const groups = getDispatchRateProviderGroups(order!);
    const flattened = groups.flatMap((group) => group.options).map((option) => option.option_id);
    const options = getDispatchRateOptions(order!).map((option) => option.option_id);

    expect(options).toEqual(flattened);
  });
});
