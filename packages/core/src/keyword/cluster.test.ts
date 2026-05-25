import { describe, expect, it } from "vitest";
import { groupByCosine } from "./cluster";

describe("groupByCosine", () => {
  it("groups similar vectors", () => {
    const result = groupByCosine(
      ["seo", "search optimization", "ads"],
      [
        [1, 0],
        [0.95, 0.05],
        [0, 1],
      ],
      0.8,
    );
    expect(result.seo).toEqual(["seo", "search optimization"]);
    expect(result.ads).toEqual(["ads"]);
  });
});
