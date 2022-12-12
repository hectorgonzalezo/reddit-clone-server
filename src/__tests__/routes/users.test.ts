const request = require("supertest");
const express = require("express");
const users = require('../../routes/users');
const initializeMongoServer = require('../../mongoConfigTesting');
import User from '../../models/userModel';

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", users);


beforeAll(async () => {
  const newUser = new User({
    username: 'mock',
    email: 'mock@mock.com',
    password: 'hashedPassword',
    permission: "regular",
});
  // and save it to database
  await newUser.save();
  return 1234;
});


describe("User", () => {
  test("Get info about a user impossible without authorization", async () => {
    const res = await request(app).get('/1234');
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body).toEqual({
      errors: [{ msg: "Only administrators can get info about users" }],
    });
  });

  test.skip("Get info about a user if authorized", async () => {
    const res = await request(app).get('/1234');
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body).toEqual({
      errors: [{ msg: "Only administrators can get info about users" }],
    });
  });

  test("Update a user", async () => {
    const res = await request(app)
      .put("/1234")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        username: "lertir",
        email: "mock@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });
;
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({ user: "User 1234 updated" });
  });

  test("Delete a user", async () => {
    const res = await request(app).delete('/1234');
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({ user: "User 1234 deleted" });
  });
});

describe("User log in", () => {
  // If trying to log in using an invalid username
  test.skip("Invalid username", async () => {
    const res = await request(app).post('/log-in');
  });

  // If trying to log in using an invalid password
  test.skip("Invalid password", async () => {
    const res = await request(app).post('/log-in');
  });

  test.skip("Correct log in", async () => {
    const res = await request(app).post('/log-in');
  });
})

describe("User sign up", () => {  

  // invalid username
  test("Sign up user with short username", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        username: "ju",
        email: "mock@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Username must be between 3 and 25 characters long");
  });

  test("Sign up user with already existing username", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "mock",
      email: "mock1@mock1.com",
      password: "123456",
      passwordConfirm: "123456",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Username already exists");
  });


  // invalid email
  test("Sign up user with invalid email", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "juan",
      email: "mockmock",
      password: "123456",
      passwordConfirm: "123456",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Invalid email");
  });

  test.only("Sign up user with already existing email", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "mock1",
      email: "mock@mock.com",
      password: "123456",
      passwordConfirm: "123456",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Email already exists");
  });


  // invalid password
  test("Sign up user with short password", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "juanpa",
      email: "mock@mock.com",
      password: "1234",
      passwordConfirm: "1234",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Password must be at least 6 characters long");
  });

  test("Sign up user with short password confirm", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "juanpa",
      email: "mock@mock.com",
      password: "123456",
      passwordConfirm: "1234",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Password must be at least 6 characters long");
  });

  // Different passwords
  test("Sign up user with non matching passwords", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "juanpa",
      email: "mock@mock.com",
      password: "123456",
      passwordConfirm: "1234567",
    });

  // return Bad request error code
  expect(res.status).toEqual(400);
  // returns error if user is too short
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Passwords don't match");
  });

  // Send multiple errors 
  test("Sign up user with non matching passwords", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        username: "ju",
        email: "mock",
        password: "123",
        passwordConfirm: "12",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors.length).toBe(5);
  });

  // Correct sign up!
  test("Correctly sign up", async () => {
    const res = await request(app)
    .post("/sign-up")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "juan",
      email: "juan@juan.com",
      password: "123456",
      passwordConfirm: "123456",
    });

  // return ok status code
  expect(res.status).toEqual(200);

  // return user and token
  expect(res.body).toHaveProperty('user');
  expect(res.body.user.username).toBe('juan');
  expect(res.body.user.email).toBe('juan@juan.com');
  expect(res.body.user.permission).toBe('regular');
  expect(res.body.user.communities).toEqual([]);

  expect(res.body).toHaveProperty('token');
  });

})