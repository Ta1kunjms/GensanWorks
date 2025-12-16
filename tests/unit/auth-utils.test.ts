import { describe, it, expect } from "@jest/globals";
import {
  validateEmail,
  validatePassword,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "../../server/auth";

describe("auth utils", () => {
  it("accepts valid emails and rejects invalid ones", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("bad@com")).toBe(false);
    expect(validateEmail("missing-at.example.com")).toBe(false);
  });

  it("enforces password complexity", () => {
    const good = validatePassword("Str0ng!Pass123");
    expect(good.isValid).toBe(true);

    const bad = validatePassword("weak");
    expect(bad.isValid).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Str0ng!Pass123");
    expect(hash).not.toEqual("Str0ng!Pass123");
    expect(await verifyPassword("Str0ng!Pass123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("issues and verifies JWTs", () => {
    const token = generateToken({ id: "u1", email: "a@b.com", role: "admin", name: "Admin" });
    const payload = verifyToken(token);
    expect(payload?.email).toBe("a@b.com");
    expect(payload?.role).toBe("admin");
  });
});
