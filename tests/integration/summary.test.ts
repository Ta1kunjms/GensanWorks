import request from "supertest";
import { app } from "../../server/index";

describe("Summary/health endpoints", () => {
  it("health is ok", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns summary data", async () => {
    const res = await request(app).get("/api/summary").expect(200);
    expect(res.body).toBeDefined();
  });
});
