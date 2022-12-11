const users = require('../../routes/users');
const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", users);


describe("All users", () => {
  test("GET Returns a list of all users in database", (done) => {
    request(app)
      .get('/')
      .expect("Content-Type", /json/)
      .expect({ users: "users" })
      .expect(200, done);
  });
});

describe("Single user", () => {
  test("Return a list of all users in database", async () => {
    const res = await request(app).get('/1234');
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({ user: "User 1234" });
  });
});