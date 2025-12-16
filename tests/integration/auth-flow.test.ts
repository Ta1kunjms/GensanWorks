import request from "supertest";
import { app } from "../../server/index";

describe("Auth flow (signup → login → me)", () => {
  const email = `user-${Date.now()}@example.com`;
  const password = "Str0ng!Pass123";
  let token: string;

  it("signs up a jobseeker", async () => {
    const res = await request(app)
      .post("/api/auth/signup/jobseeker")
      .send({ firstName: "Test", lastName: "User", email, password, role: "jobseeker" })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    token = res.body.token;
  });

  it("logs in with the new account", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    token = res.body.token;
  });

  it("returns current user via /api/auth/me", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe("jobseeker");
  });
});
