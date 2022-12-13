const request = require("supertest");
const express = require("express");
const users = require('../../routes/users');
const communities = require('../../routes/communities');
import bcrypt from 'bcryptjs';
const initializeMongoServer = require('../../mongoConfigTesting');
import Community from '../../models/communityModel';
import User from '../../models/userModel';
import { ICommunity } from '../../types/models';

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/communities/", communities);
app.use("/users/", users)

let token: string;
let userId: string;
let mockCommunity: ICommunity;
let mockCommunity2: ICommunity;
let mockCommunityId: string;
let mockCommunity2Id: string;



// Add community to mock database
beforeAll(async () => {

  const hashedPassword = await bcrypt.hash('hashedPassword', 10);
  const regularUser = new User({
    username: 'mocka',
    email: 'mocka@mocka.com',
    password: hashedPassword,
    permission: "regular",
  });

  const user = await regularUser.save();

  const logIn = await request(app)
    .post("/users/log-in")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({
      username: "mocka",
      password: "hashedPassword",
    });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

  mockCommunity= new Community({
    name: "mockCommunity",
    subtitle: "Fake community",
    description: "This is a fake community created for testing purposes",
    creator: userId,
    users: [],
    posts: [],
  });

  mockCommunity2= new Community({
    name: "mockCommunity2",
    subtitle: "Fake community2",
    description: "This is a fake community created for testing purposes2",
    creator: userId,
    users: [],
    posts: [],
  }, { versionKey: false });

  const [community1, community2] = await Promise.all([
    mockCommunity.save(),
    mockCommunity2.save(),
  ]);
  mockCommunityId = community1._id.toString();
  mockCommunity2Id = community2._id.toString();
});

describe("GET communities", () => {

  test("Get all communities in database", async () => {
    const res = await request(app).get("/communities/");

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body.communities.length).toBe(2);
  });

  test("Get info about a particular community", async () => {
    const res = await request(app).get(`/communities/${mockCommunityId}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(mockCommunity.name);
    expect(res.body.community.subtitle).toBe(mockCommunity.subtitle);
    expect(res.body.community.description).toBe(mockCommunity.description);
    expect(res.body.community._id).toBe(mockCommunityId);
    expect(res.body.community.users).toEqual(mockCommunity.users);
    expect(res.body.community.posts).toEqual(mockCommunity.posts);
  });

  test("Looking for a non existing community returns an error", async () => {
    const res = await request(app).get(`/communities/12345`);

    expect(res.status).toEqual(400);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual('No community with id 12345 found');
  });
  });


describe("POST/create communities", () => {

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      // don't send authorization
      .send({
        name: "newMock",
        subtitle: "New fake community",
        description: "This is a new fake community created for testing purposes",
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only logged in users can create communities" }],
    });

  });

  test("Allowed for logged in regular user", async () => {
    const newCommunity = {
      name: "newMock",
      subtitle: "New fake community",
      description:
        "This is a new fake community created for testing purposes",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(newCommunity.name);
    expect(res.body.community.subtitle).toBe(newCommunity.subtitle);
    expect(res.body.community.description).toBe(newCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    expect(res.body.community.users).toEqual([]);
    expect(res.body.community.posts).toEqual([]);
  });

  test("Name allows letters, numbers and underscore", async () => {
    const newCommunity = {
      name: "newMock1234_",
      subtitle: "New fake community",
      description:
        "This is a new fake community created for testing purposes",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(newCommunity.name);
    expect(res.body.community.subtitle).toBe(newCommunity.subtitle);
    expect(res.body.community.description).toBe(newCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    expect(res.body.community.users).toEqual([]);
    expect(res.body.community.posts).toEqual([]);
  });


  test("Name doesn't allow other characters", async () => {
    const newCommunity = {
      name: "newMock*@",
      subtitle: "New fake community",
      description:
        "This is a new fake community created for testing purposes",
    }
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);


    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Only letters, numbers and underscore allowed in community name"
    );
  });
  
  test("Not allowed with short name", async () => {
    const newCommunity = {
      name: "ne",
      subtitle: "New fake community",
      description:
        "This is a new fake community created for testing purposes",
    }
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community name must be between 3 and 21 characters long");
  });

  test("Not allowed with long name", async () => {
    const newCommunity = {
      name: "newMockasfdasdfoqiuwoeruqowieruoqiwuoqwreqwe",
      subtitle: "New fake community",
      description:
        "This is a new fake community created for testing purposes",
    }
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community name must be between 3 and 21 characters long");
  });

  test("Not allowed with short subtitle", async () => {
    const newCommunity = {
      name: "newMock",
      subtitle: "Ne",
      description:
        "This is a new fake community created for testing purposes",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community subtitle must be between 3 and 100 characters long");
  });

  test("Not allowed with long subtitle", async () => {
    const newCommunity = {
      name: "newMock",
      subtitle: "Neqwueroiuqweiorqwoieroqwiruoqiwueoriquweoriqwoirquwoirqowireuoqwieroqiweuroiqweureoriquworriuqweoreiuqwoiruqowieroqiweurorqiwreoiqwueroiquwre",
      description:
        "This is a new fake community created for testing purposes",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community subtitle must be between 3 and 100 characters long");
  });

  test("Not allowed with short description", async () => {
    const newCommunity = {
      name: "newMock",
      subtitle: "New community",
      description:
        "Th",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community description must be between 3 and 300 characters long");
  });

  test("Require a unique name", async () => {
    const newCommunity = {
      name: "mockCommunity",
      subtitle: "New community",
      description:
        "Thasdfasfasf",
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

      // return Bad request error code
  expect(res.status).toEqual(400);
  // Return error if community name already exists
  expect(res.body.errors).not.toBe(undefined);
  expect(res.body.errors[0].msg).toEqual("Community name already exists");
  });

  test("Icon allowed but not required", async () => {
    const newCommunity = {
      name: "newMock2",
      subtitle: "New fake community2",
      description:
        "This is a new fake community created for testing purposes2",
      icon: "http://fake.com/img"
    }

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    console.log(res.body)
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.icon).toBe(newCommunity.icon);
  })
  });