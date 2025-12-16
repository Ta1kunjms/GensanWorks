import request from "supertest";
import { app } from "../../server/index";
import { generateToken } from "../../server/auth";

describe("Messages endpoints", () => {
  const userToken = generateToken({ id: "user-1", email: "u@test.com", role: "jobseeker", name: "User" });

  it("rejects send without content", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ receiverId: "emp-1", content: "" });
    expect([400, 422]).toContain(res.status);
  });
});
