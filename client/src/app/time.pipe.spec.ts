import {MINUTE, next, SECOND} from "./time.pipe";

describe("time.pipe", () => {
  it("next()", () => {
    expect(next(SECOND)).toBe(SECOND, "1");
    expect(next(SECOND * 2)).toBe(SECOND, "2");
    expect(next(SECOND * 3)).toBe(SECOND, "3");
    expect(next(SECOND * 30)).toBe(SECOND, "4");
    expect(next(SECOND * 59)).toBe(SECOND, "5");
    
    expect(next(MINUTE)).toBe(SECOND, "6");
    expect(next(MINUTE + SECOND)).toBe(SECOND, "7");
    expect(next(MINUTE + SECOND * 2)).toBe(SECOND * 2, "8");
    expect(next(MINUTE + SECOND * 5)).toBe(SECOND * 5, "9");
    expect(next(MINUTE + SECOND * 30)).toBe(SECOND * 30, "10");
    expect(next(MINUTE + SECOND * 59)).toBe(SECOND * 59, "11");
    
    expect(next(MINUTE * 2)).toBe(MINUTE, "12");
  });
});
