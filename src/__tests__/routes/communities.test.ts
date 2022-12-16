const request = require("supertest");
const express = require("express");
const users = require("../../routes/users");
const communities = require("../../routes/communities");
import bcrypt from "bcryptjs";
const initializeMongoServer = require("../../mongoConfigTesting");
import Community from "../../models/communityModel";
import User from "../../models/userModel";
import { ICommunity } from "../../types/models";

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/communities/", communities);
app.use("/users/", users);

let token: string;
let userId: string;
let token2: string;
let user2Id: string;
let adminToken: string;
let adminUserId: string;
let mockCommunity: ICommunity;
let mockCommunity2: ICommunity;
let mockCommunityWithIcon: ICommunity;
let mockCommunityWithPosts: ICommunity;
let mockCommunityId: string;
let mockCommunity2Id: string;
let mockCommunityWithPostsId: string;
let mockCommunityWithIconId: string;

describe("GET communities", () => {
  // Add communities and user to mock database
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });

    const user = await regularUser.save();

    const logIn = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    mockCommunity2 = new Community(
      {
        name: "mockCommunity2",
        subtitle: "Fake community2",
        description: "This is a fake community created for testing purposes2",
        creator: "123434asdfas",
        users: [],
        posts: [],
      },
      { versionKey: false }
    );

    mockCommunityWithIcon = new Community({
      name: "mockCommunityWithIcon",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
      icon: "http://fakeIcon.com/icon"
    });

    const [community1, community2, communityWithIcon] = await Promise.all([
      mockCommunity.save(),
      mockCommunity2.save(),
      mockCommunityWithIcon.save(),
    ]);
    mockCommunityId = community1._id.toString();
    mockCommunity2Id = community2._id.toString();
    mockCommunityWithIconId = communityWithIcon._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Community.findByIdAndDelete(mockCommunity2Id);
    await Community.findByIdAndDelete(mockCommunityWithIconId);
  });

  test("Get all communities in database", async () => {
    const res = await request(app).get("/communities/");

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body.communities.length).toBe(3);
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
    // It has timestamp
    expect(res.body.community.createdAt).not.toBe(undefined);
    // It has virtual properties
    expect(res.body.community.membersQuantity).toBe(0);
    expect(res.body.community.postsQuantity).toBe(0);
    // community has no icon
    expect(res.body.community.icon).toBe(undefined);
  });

  test("If community has icon, one is returned", async () => {
    const res = await request(app).get(`/communities/${mockCommunityWithIconId}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(mockCommunityWithIcon.name);
    expect(res.body.community.subtitle).toBe(mockCommunityWithIcon.subtitle);
    expect(res.body.community.description).toBe(mockCommunityWithIcon.description);
    expect(res.body.community._id).toBe(mockCommunityWithIconId);
    expect(res.body.community.users).toEqual(mockCommunityWithIcon.users);
    expect(res.body.community.posts).toEqual(mockCommunityWithIcon.posts);
    // community has no icon
    expect(res.body.community.icon).toBe(mockCommunityWithIcon.icon);
  });

  test("Looking for a non existing community returns an error", async () => {
    const res = await request(app).get(`/communities/123456789a123456789b1234`);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No community with id 123456789a123456789b1234 found"
    );
  });

  test("Looking for a community with a string that doesn't match an id doesn't return anything", async () => {
    const res = await request(app).get(`/communities/12345`);

    // Return not found status code
    expect(res.status).toEqual(404);
  });
});

// Create community
describe("POST/create communities", () => {
  // Create user and mock communities and add them to database
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });

    const user = await regularUser.save();

    const logIn = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    mockCommunity2 = new Community(
      {
        name: "mockCommunity2",
        subtitle: "Fake community2",
        description: "This is a fake community created for testing purposes2",
        creator: "123434asdfas",
        users: [],
        posts: [],
      },
      { versionKey: false }
    );

    const [community1, community2] = await Promise.all([
      mockCommunity.save(),
      mockCommunity2.save(),
    ]);
    mockCommunityId = community1._id.toString();
    mockCommunity2Id = community2._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Community.findByIdAndDelete(mockCommunity2Id);
  });

  test("Allowed for logged in regular user", async () => {
    const newCommunity = {
      name: "newMock",
      subtitle: "New fake community",
      description: "This is a new fake community created for testing purposes",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
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
    // community has no icon by default
    expect(res.body.community.icon).toBe(undefined);
  });

  test("Providing an icon, adds it to object", async () => {
    const newCommunity = {
      name: "newMockas",
      subtitle: "New fake community",
      description: "This is a new fake community created for testing purposes",
      icon: "http://fake.com/icon"
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
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
    // community has no icon by default
    expect(res.body.community.icon).toBe("http://fake.com/icon");
  });

  test("Not allowed if icon isn't a url", async () => {
    const newCommunity = {
      name: "newMockas2",
      subtitle: "New fake community",
      description: "This is a new fake community created for testing purposes",
      icon: "1234",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Icon can only be a URL"
    );
  });

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      // don't send authorization
      .send({
        name: "newMock",
        subtitle: "New fake community",
        description:
          "This is a new fake community created for testing purposes",
      });

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only logged in users can create communities" }],
    });
  });

  test("Name allows letters, numbers and underscore", async () => {
    const newCommunity = {
      name: "newMock1234_",
      subtitle: "New fake community",
      description: "This is a new fake community created for testing purposes",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
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
      description: "This is a new fake community created for testing purposes",
    };
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
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
      description: "This is a new fake community created for testing purposes",
    };
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community name must be between 3 and 21 characters long"
    );
  });

  test("Not allowed with long name", async () => {
    const newCommunity = {
      name: "newMockasfdasdfoqiuwoeruqowieruoqiwuoqwreqwe",
      subtitle: "New fake community",
      description: "This is a new fake community created for testing purposes",
    };
    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community name must be between 3 and 21 characters long"
    );
  });

  test("Not allowed with short subtitle", async () => {
    const newCommunity = {
      name: "newMockas",
      subtitle: "Ne",
      description: "This is a new fake community created for testing purposes",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community subtitle must be between 3 and 100 characters long"
    );
  });

  test("Not allowed with long subtitle", async () => {
    const newCommunity = {
      name: "newMockas",
      subtitle:
        "Neqwueroiuqweiorqwoieroqwiruoqiwueoriquweoriqwoirquwoirqowireuoqwieroqiweuroiqweureoriquworriuqweoreiuqwoiruqowieroqiweurorqiwreoiqwueroiquwre",
      description: "This is a new fake community created for testing purposes",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community subtitle must be between 3 and 100 characters long"
    );
  });

  test("Not allowed with short description", async () => {
    const newCommunity = {
      name: "newMockas",
      subtitle: "New community",
      description: "Th",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community description must be between 3 and 300 characters long"
    );
  });

  test("Require a unique name", async () => {
    const newCommunity = {
      name: "mockCommunity",
      subtitle: "New community",
      description: "Thasdfasfasf",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
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
      description: "This is a new fake community created for testing purposes2",
      icon: "http://fake.com/img",
    };

    const res = await request(app)
      .post("/communities/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.icon).toBe(newCommunity.icon);
  });
});

// Update community
describe("PUT/update communities", () => {
  // Add community to mock database
  beforeAll(async () => {
    // Log in as a regular user and as an administrator
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });

    const user = await regularUser.save();

    const adminUser = new User({
      username: "mockas",
      email: "mockas@mockas.com",
      password: hashedPassword,
      permission: "admin",
    });

    const adminUserData = await adminUser.save();

    const logIn = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    const logIn2 = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mockas",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    adminToken = logIn2.body.token;
    adminUserId = logIn2.body.user._id.toString();

    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    mockCommunity2 = new Community(
      {
        name: "mockCommunity2",
        subtitle: "Fake community2",
        description: "This is a fake community created for testing purposes2",
        creator: "123434asdfas",
        users: [],
        posts: [],
      },
      { versionKey: false }
    );

    mockCommunityWithPosts = new Community(
      {
        name: "mockCommunity2",
        subtitle: "Fake community2",
        description: "This is a fake community created for testing purposes2",
        creator: userId,
        users: [logIn.body.user._id],
        posts: [logIn.body.user._id],
      },
      { versionKey: false }
    );

    const [community1, community2, community3] = await Promise.all([
      mockCommunity.save(),
      mockCommunity2.save(),
      mockCommunityWithPosts.save(),
    ]);

    mockCommunityId = community1._id.toString();
    mockCommunity2Id = community2._id.toString();
    mockCommunityWithPostsId = community3._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await User.findByIdAndDelete(adminUserId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Community.findByIdAndDelete(mockCommunity2Id);
  });

  test("Allowed for logged in regular user which is the community creator", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(updatedCommunity.name);
    expect(res.body.community.subtitle).toBe(updatedCommunity.subtitle);
    expect(res.body.community.description).toBe(updatedCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    expect(res.body.community.users).toEqual([]);
    expect(res.body.community.posts).toEqual([]);
    // There should be no icon
    expect(res.body.community.icon).toBe(undefined);
  });

  test("Allowed for logged in regular user which is the community creator", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(updatedCommunity.name);
    expect(res.body.community.subtitle).toBe(updatedCommunity.subtitle);
    expect(res.body.community.description).toBe(updatedCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    expect(res.body.community.users).toEqual([]);
    expect(res.body.community.posts).toEqual([]);
    // There should be no icon
    expect(res.body.community.icon).toBe(undefined);
  });

  test("Updating keeps the same users and posts", async () => {
    const updatedCommunity = {
      name: "updatedMocka",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityWithPostsId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(updatedCommunity.name);
    expect(res.body.community.subtitle).toBe(updatedCommunity.subtitle);
    expect(res.body.community.description).toBe(updatedCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    // Keeps the same number of posts and users
    expect(res.body.community.membersQuantity).toBe(1);
    expect(res.body.community.postsQuantity).toBe(1);
  });

  test("Adding an icon updates the icon in original community", async () => {
    const updatedCommunity = {
      name: "updatedMockAgain",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
      icon: 'http://fake.com/icon'
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // There should be an icon
    expect(res.body.community.icon).toBe("http://fake.com/icon");
  });

  test("Updating another field keeps the icon", async () => {
    const updatedCommunity = {
      name: "updatedMockAgain2",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Icon should be the same
    expect(res.body.community.icon).toBe("http://fake.com/icon");

   });

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      // don't send authorization
      .send({
        name: "updatedMock",
        subtitle: "updated fake community",
        description:
          "This is a updated fake community created for testing purposes",
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only the community creator can update the community" }],
    });
  });

  test("Not allowed if user isn't the community creator", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunity2Id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "updatedMock",
        subtitle: "updated fake community",
        description:
          "This is a updated fake community created for testing purposes",
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only the community creator can update the community" }],
    });
  });



  test("Name allows letters, numbers and underscore", async () => {
    const updatedCommunity = {
      name: "updatedMock1234_",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.name).toBe(updatedCommunity.name);
    expect(res.body.community.subtitle).toBe(updatedCommunity.subtitle);
    expect(res.body.community.description).toBe(updatedCommunity.description);
    // assign current user to be the community creator
    expect(res.body.community.creator.toString()).toBe(userId);
    expect(res.body.community.users).toEqual([]);
    expect(res.body.community.posts).toEqual([]);
  });

  test("Name doesn't allow other characters", async () => {
    const updatedCommunity = {
      name: "updatedMock*@",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };
    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Only letters, numbers and underscore allowed in community name"
    );
  });

  test("Not allowed with short name", async () => {
    const updatedCommunity = {
      name: "ne",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };
    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community name must be between 3 and 21 characters long"
    );
  });

  test("Not allowed with long name", async () => {
    const updatedCommunity = {
      name: "updatedMockasfdasdfoqiuwoeruqowieruoqiwuoqwreqwe",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };
    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community name must be between 3 and 21 characters long"
    );
  });

  test("Not allowed with short subtitle", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "Ne",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community subtitle must be between 3 and 100 characters long"
    );
  });

  test("Not allowed with long subtitle", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle:
        "Neqwueroiuqweiorqwoieroqwiruoqiwueoriquweoriqwoirquwoirqowireuoqwieroqiweuroiqweureoriquworriuqweoreiuqwoiruqowieroqiweurorqiwreoiqwueroiquwre",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community subtitle must be between 3 and 100 characters long"
    );
  });

  test("Not allowed with short description", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "updated community",
      description: "Th",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Community description must be between 3 and 300 characters long"
    );
  });

  test("Require a unique name", async () => {
    const updatedCommunity = {
      name: "mockCommunity2",
      subtitle: "updated community",
      description: "Thasdfasfasf",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    // return Bad request error code
    expect(res.status).toEqual(400);
    // Return error if community name already exists
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community name already exists");
  });

  test("Icon allowed but not required", async () => {
    const updatedCommunity = {
      name: "newMock22",
      subtitle: "New fake community2",
      description: "This is a new fake community created for testing purposes2",
      icon: "http://fake.com/img",
    };

    const res = await request(app)
      .put(`/communities/${mockCommunityId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct community info
    expect(res.body.community.icon).toBe(updatedCommunity.icon);
  });

  test("Updating a non existing community returns an error", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put("/communities/123456789a123456789b1234")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No community with id 123456789a123456789b1234 found"
    );
  });

  test("Updating a  with a string that doesn't match an id doesn't return anything", async () => {
    const updatedCommunity = {
      name: "updatedMock",
      subtitle: "updated fake community",
      description:
        "This is a updated fake community created for testing purposes",
    };

    const res = await request(app)
      .put("/communities/12345")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedCommunity);

    expect(res.status).toEqual(404);
  });
});

// Delete a  community
describe("DELETE communities", () => {
  // Add community to mock database
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });

    const user = await regularUser.save();

    const regularUser2 = new User({
      username: "mockas",
      email: "mockas@mockas.com",
      password: hashedPassword,
      permission: "admin",
    });

    const user2 = await regularUser2.save();

    const logIn = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    const logIn2 = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mockas",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    adminToken = logIn2.body.token;
    adminUserId = logIn2.body.user._id.toString();

    // create mock communities
    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    mockCommunity2 = new Community(
      {
        name: "mockCommunity2",
        subtitle: "Fake community2",
        description: "This is a fake community created for testing purposes2",
        creator: "123434asdfas",
        users: [],
        posts: [],
      },
      { versionKey: false }
    );

    const [community1, community2] = await Promise.all([
      mockCommunity.save(),
      mockCommunity2.save(),
    ]);

    mockCommunityId = community1._id.toString();
    mockCommunity2Id = community2._id.toString();
  });

    // remove communities and user from database
    afterAll(async () => {
      await User.findByIdAndDelete(userId);
      await User.findByIdAndDelete(adminUserId);
      await Community.findByIdAndDelete(mockCommunityId);
      await Community.findByIdAndDelete(mockCommunity2Id);
    });

  test("Allowed for logged in regular user which is the community creator", async () => {
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}`)
      .set("Authorization", `Bearer ${token}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return delete message
    expect(res.body.msg).toBe(`Community ${mockCommunityId} deleted`);

    // Look for community, it shouldn't be there
    const community = await Community.findById(mockCommunityId);
    expect(community).toBe(null);
  });

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app).delete(`/communities/${mockCommunityId}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only the community creator can delete the community" }],
    });
  });

  test("Not allowed if user isn't the community creator", async () => {
    const res = await request(app).delete(`/communities/${mockCommunity2Id}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock communities
    expect(res.body).toEqual({
      errors: [{ msg: "Only the community creator can delete the community" }],
    });
  });

  test("Deleting a non existing community returns an error", async () => {
    const res = await request(app)
      .delete("/communities/123456789a123456789b1234")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No community with id 123456789a123456789b1234 found"
    );
  });

  test("Deleting a community with a string that doesn't match and id doesn't return anything", async () => {
    const res = await request(app)
      .delete("/communities/12345")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(404);
  });
});


// Manage subscriptions
describe("Subscribe/unsubscribe user to community", () => {
  // Add community to mock database
  beforeAll(async () => {
    // Log in as a regular user and as an administrator
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });

    const user = await regularUser.save();

    // user
    const adminUser = new User({
      username: "mockas",
      email: "mockas@mockas.com",
      password: hashedPassword,
      permission: "regular",
    });

    const adminUserData = await adminUser.save();

    const logIn = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    token = logIn.body.token;
    userId = logIn.body.user._id.toString();

    const logIn2 = await request(app)
      .post("/users/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mockas",
        password: "hashedPassword",
      });


    token2 = logIn2.body.token;
    user2Id = logIn2.body.user._id.toString();

    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
    });

    const community = await mockCommunity.save();

    mockCommunityId = community._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await User.findByIdAndDelete(adminUserId);
    await Community.findByIdAndDelete(mockCommunityId);
  });

  test("Subscribing updates both the community and user", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    
    console.log(res.body.user);
    console.log(res.body.community);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.message).toEqual(`User ${userId} subscribed to community ${mockCommunityId}`);
    // Updates user
    expect(res.body.user.communities.length).toBe(1);
    expect(res.body.user.communities[0].toString()).toBe(mockCommunityId);
    // Updates community
    expect(res.body.community.users.length).toBe(1);
    expect(res.body.community.users[0].toString()).toBe(userId);
  });

  test("Subscribing twice keeps a single subscription", async () => {
    const res1 = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.message).toEqual(`User ${userId} subscribed to community ${mockCommunityId}`);
    // Updates user
    expect(res.body.user.communities.length).toBe(1);
    expect(res.body.user.communities[0].toString()).toBe(mockCommunityId);
    // Updates community
    expect(res.body.community.users.length).toBe(1);
    expect(res.body.community.users[0].toString()).toBe(userId);
  });


  test("Unsubscribing updates both the community and user", async () => {
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.message).toEqual(`User ${userId} unsubscribed from community ${mockCommunityId}`);
    // Updates user
    expect(res.body.user.communities.length).toBe(0);
    // Updates community
    expect(res.body.community.users.length).toBe(0);
  }
  );

  test("Subscribing twice keeps a single subscription", async () => {
    const res1 = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.message).toEqual(`User ${userId} unsubscribed from community ${mockCommunityId}`);
    // Updates user
    expect(res.body.user.communities.length).toBe(0);
    // Updates community
    expect(res.body.community.users.length).toBe(0);
  });


  test("Subscribe not allowed if user isn't authorized", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can subscribe');
  });

  test("Subscribe not allowed if user trying to subscribe is another one", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token2}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can subscribe');
  });

  test("Unsubscribe not allowed if user isn't authorized", async () => {
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/${userId}`);

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can unsubscribe');
  });

  test("Unsubscribe not allowed if user trying to subscribe is another one", async () => {
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token2}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can unsubscribe');
  });
  
  test("Subscribe Not allowed if invalid community id", async () => {
    const res = await request(app)
      .put(`/communities/123456789a123456789b1234/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    // return unauthorized status and json
    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.error).toEqual(
      "No community with id 123456789a123456789b1234 found"
    );
  });

  test("Subscribe Not allowed if invalid user id", async () => {
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/123456789a123456789b1234`)
      .set("Authorization", `Bearer ${token}`);
    console.log(res.body);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can subscribe');
  });

  test("Unsubscribe Not allowed if invalid community id", async () => {
    const res = await request(app)
      .put(`/communities/123456789a123456789b1234/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    // return unauthorized status and json
    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.error).toEqual(
      "No community with id 123456789a123456789b1234 found"
    );
  });

  test("Unsubscribe Not allowed if invalid user id", async () => {
    const res = await request(app)
      .delete(`/communities/${mockCommunityId}/subscription/123456789a123456789b1234`)
      .set("Authorization", `Bearer ${token}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.errors[0].msg).toEqual('Only the user itself can unsubscribe');
  });


  test("Multiple users can subscribe", async () => {
    const res1 = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .put(`/communities/${mockCommunityId}/subscription/${user2Id}`)
      .set("Authorization", `Bearer ${token2}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // Returns message
    expect(res.body.message).toEqual(`User ${user2Id} subscribed to community ${mockCommunityId}`);
    // Updates user
    expect(res.body.user.communities.length).toBe(1);
    expect(res.body.user.communities[0].toString()).toBe(mockCommunityId);
    // Updates community
    expect(res.body.community.users.length).toBe(2);
    expect(res.body.community.users[1].toString()).toBe(user2Id);
  });
})