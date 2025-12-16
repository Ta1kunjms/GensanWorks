import request from "supertest";
import { app } from "../../server/index";
import { generateToken } from "../../server/auth";

describe("Jobs endpoints", () => {
  const adminToken = generateToken({ id: "admin-1", email: "admin@test.com", role: "admin", name: "Admin" });
  let jobId: string;

  it("admin creates a job", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        positionTitle: "Integration Job",
        description: "APIs",
        location: "City",
        salaryMin: 1000,
        salaryMax: 2000,
        salaryPeriod: "monthly",
        employerId: "emp-1",
      })
      .expect(201);
    jobId = res.body.job.id;
  });

  it("public lists jobs", async () => {
    const res = await request(app).get("/api/jobs").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejects apply when unauthenticated", async () => {
    await request(app).post(`/api/jobs/${jobId}/apply`).send({ coverLetter: "Hi" }).expect(401);
  });
});
