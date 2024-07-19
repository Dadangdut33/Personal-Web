import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generatePassword, seedUser } from "drizzle/scripts/seedUser";

describe("generatePassword", () => {
  it("should generate a password of default length 32", () => {
    const password = generatePassword();
    expect(password).toHaveLength(32);
  });

  it("should generate a password of specified length", () => {
    const password = generatePassword(16);
    expect(password).toHaveLength(16);
  });
});

describe("seedUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should seed user and profile", async () => {
    const test_temp_user = "temp_test_user";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await seedUser(test_temp_user, true);

    expect(consoleSpy).toHaveBeenNthCalledWith(1, "⏳ Seeding...");
    expect(consoleSpy).toHaveBeenNthCalledWith(2, "**NOTES**");
    expect(consoleSpy).toHaveBeenNthCalledWith(3, `Created user ${test_temp_user}`);
    expect(consoleSpy).toHaveBeenNthCalledWith(4, expect.stringContaining("Password:"));
    expect(consoleSpy).toHaveBeenNthCalledWith(5, "✅ Seeding completed in", expect.any(Number), "ms");
    expect(consoleSpy).toHaveBeenNthCalledWith(6, "Deleting user that was added for testing");
    expect(consoleSpy).toHaveBeenNthCalledWith(7, "Deleted user that was added for testing");

    consoleSpy.mockRestore();
  });
});
