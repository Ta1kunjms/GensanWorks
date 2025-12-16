import { describe, it, expect, jest } from "@jest/globals";
import { authMiddleware } from "../../server/middleware";
import { generateToken } from "../../server/auth";

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authMiddleware", () => {
  it("rejects when Authorization header is missing", () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a valid bearer token", () => {
    const token = generateToken({ id: "u1", email: "user@test.com", role: "admin", name: "Admin" });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.email).toBe("user@test.com");
  });
});
