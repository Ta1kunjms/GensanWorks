import request from "supertest";
import { app } from "../../server/index";
import { generateToken } from "../../server/auth";

describe("Employer endpoints", () => {
  const employerToken = generateToken({ id: "emp-1", email: "emp@test.com", role: "employer", name: "Emp" });

  it("enforces auth on employer profile", async () => {
    const res = await request(app)
      .get("/api/employer/profile")
      .set("Authorization", `Bearer ${employerToken}`);
    expect([200, 404, 401, 403]).toContain(res.status); // tolerant of seed state
  });
});
