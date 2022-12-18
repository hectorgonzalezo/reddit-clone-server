const request = require("supertest");
const express = require("express");
const users = require("../../routes/users");
import bcrypt from "bcryptjs";
const initializeMongoServer = require("../../mongoConfigTesting");
import User from "../../models/userModel";
import Community from '../../models/communityModel';
import Post from '../../models/postModel';
import { ICommunity, IPost } from "../../types/models";

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", users);

let fakeCommunity: ICommunity;
let fakeCommunityId: string;
let adminUserId: string;
let regularUserId: string;
let userWithIconId: string;
let mockPost: IPost;
let mockPostId: string;
let mockPost2: IPost;
let mockPost2Id: string;



describe("User GET", () => {
  // Add user to mock database
beforeAll(async () => {
  const hashedPassword = await bcrypt.hash("hashedPassword", 10);

  const adminUser = new User({
    username: "mock",
    email: "mock@mock.com",
    password: hashedPassword,
    permission: "admin",
  });

  const regularUser = new User({
    username: "mocka",
    email: "mocka@mocka.com",
    password: hashedPassword,
    permission: "regular",
  });

  const userWithIcon = new User({
    username: "mockWithIcon",
    email: "mockIcon@mocka.com",
    password: hashedPassword,
    icon: "http://fakeurl.com/icon",
    permission: "regular",
  });

  const users = await Promise.all([
    adminUser.save(),
    regularUser.save(),
    userWithIcon.save(),
  ]);
  adminUserId = users[0]._id.toString();
  regularUserId = users[1]._id.toString();
  userWithIconId = users[2]._id.toString();

  fakeCommunity = new Community({
    name: "mockCommunity",
    subtitle: "Fake community",
    description: "This is a fake community created for testing purposes",
    creator: regularUserId,
    users: [adminUserId],
    posts: [],
  });

  const community = await fakeCommunity.save();
  fakeCommunityId = community._id.toString();

  mockPost = new Post({
    title: "Mock post",
    text: "This is a mock post made for testing purposes",
    user: regularUserId,
    community: fakeCommunityId,
  });

  mockPost2 = new Post({
    title: "Another mock post",
    text: "This is a mock post made for testing purposes",
    user: regularUserId,
    community: fakeCommunityId,
  });

  const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);

  mockPostId = post._id.toString();
  mockPost2Id = post2._id.toString();
});

afterAll(async () => {
  await User.findByIdAndDelete(adminUserId);
  await User.findByIdAndDelete(regularUserId);
  await User.findByIdAndDelete(userWithIconId);
  await Post.findByIdAndDelete(mockPostId);
  await Post.findByIdAndDelete(mockPost2Id);
})

  test("Get info about a user", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPassword",
      });

    const { token } = logIn.body;
    const userId = logIn.body.user._id;

    // query user with admin token
    const res = await request(app)
      .get(`/${userId}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body.user._id).toBe(userId);
    expect(res.body.user.username).toBe("mock");
    // votes should be empty
    expect(res.body.user.votes).toEqual({});
    // User should have timestamp
    expect(res.body.user.createdAt).not.toBe(undefined);
    // communities should be empty
    expect(res.body.user.communities).toEqual([]);
    // user doesn't have icon
    expect(res.body.user.icon).toBe(undefined);
  });

  test("If user has icon, it is returned", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPassword",
      });

    const { token } = logIn.body;
    const userId = logIn.body.user._id;

    // query user with admin token
    const res = await request(app)
      .get(`/${userWithIconId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body.user._id).toBe(userWithIconId);
    expect(res.body.user.username).toBe("mockWithIcon");
    // user doesn't have icon
    expect(res.body.user.icon).toBe("http://fakeurl.com/icon");
  });
});

describe("User update", () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
  
    const adminUser = new User({
      username: "mock",
      email: "mock@mock.com",
      password: hashedPassword,
      permission: "admin",
    });
  
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });
  
    const userWithIcon = new User({
      username: "mockWithIcon",
      email: "mockIcon@mocka.com",
      password: hashedPassword,
      icon: "http://fakeurl.com/icon",
      permission: "regular",
    });
  
    const users = await Promise.all([
      adminUser.save(),
      regularUser.save(),
      userWithIcon.save(),
    ]);
    adminUserId = users[0]._id.toString();
    regularUserId = users[1]._id.toString();
    userWithIconId = users[2]._id.toString();
  
    fakeCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: regularUserId,
      users: [adminUserId],
      posts: [],
    });
  
    const community = await fakeCommunity.save();
    fakeCommunityId = community._id.toString();
  
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    mockPost2 = new Post({
      title: "Another mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
  
    mockPostId = post._id.toString();
    mockPost2Id = post2._id.toString();
  });
  
  afterEach(async () => {
    await User.findByIdAndDelete(adminUserId);
    await User.findByIdAndDelete(regularUserId);
    await User.findByIdAndDelete(userWithIconId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  })

  test("Update a user allowed with admin permission", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${adminUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updated",
        email: "updated@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("updated");
    expect(res.body.user.email).toBe("updated@mock.com");
    expect(res.body.user.permission).toBe("regular");
    expect(res.body.user.votes).toEqual({});
    expect(res.body.user.communities).toEqual([]);
    expect(res.body.user.icon).toBe(undefined);

    // As user it not signed it, no token should be returned
    expect(res.body).not.toHaveProperty("token");
  });

  test("Update a user allowed if logged in", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updated1",
        email: "updated1@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("updated1");
    expect(res.body.user.email).toBe("updated1@mock.com");
    expect(res.body.user.permission).toBe("regular");
    expect(res.body.user.votes).toEqual({});
    expect(res.body.user.communities).toEqual([]);
    expect(res.body.user.icon).toBe(undefined);

  });

  test("Update a user not allowed without permission", async () => {
    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "updated2",
        email: "updated2@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the user itself can update it" }],
    });
  });

  test("Update a user not allowed if trying to update another user", async () => {
        // log in and get token
        const logIn = await request(app)
        .post("/log-in")
        .set("Content-Type", "application/json")
        .send({
          username: "mocka",
          password: "hashedPassword",
        });
  
      const { token } = logIn.body;

    const res = await request(app)
      .put(`/${adminUserId}`)
      .set("Content-Type", "application/json")
      .send({
        username: "updated",
        email: "updated@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the user itself can update it" }],
    });
  });
 

  test("Update icon possible", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        icon: "http://fakeIcon.com/icon"
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("mocka");
    expect(res.body.user.permission).toBe("regular");
    expect(res.body.user.communities).toEqual([]);
    expect(res.body.user.icon).toBe("http://fakeIcon.com/icon");

    // As user it not signed it, no token should be returned
    expect(res.body).not.toHaveProperty("token");

    // updating another field keeps icon
    const res2 = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updated2",
        email: "updated2@mock.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    expect(res2.body.user.icon).toBe("http://fakeIcon.com/icon");
  });

  test("Not allowed if icon isn't a url", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updated7",
        email: "updated7@mock.com",
        password: "123456",
        passwordConfirm: "123456",
        icon: "1234"
      });

     // return Bad request error code
     expect(res.status).toEqual(400);
     // returns error if user is too short
     expect(res.body.errors).not.toBe(undefined);
     expect(res.body.errors[0].msg).toEqual(
       "Icon can only be a URL"
     );
  });


  // invalid username
  test("Not allowed with short username", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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
    expect(res.body.errors[0].msg).toEqual(
      "Username must be between 3 and 25 characters long"
    );
  });

  test("Not allowed with already existing username", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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
  test("Not allowed with invalid email", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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

  test("Not allowed with already existing email", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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
  test("Not allowed with short password", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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
    expect(res.body.errors[0].msg).toEqual(
      "Password must be at least 6 characters long"
    );
  });

  test("Not allowed with short password confirm", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")

      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
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
    expect(res.body.errors[0].msg).toEqual(
      "Password must be at least 6 characters long"
    );
  });

  // Different passwords
  test("Not allowed with non matching passwords", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")

      .set("Authorization", `Bearer ${token}`)
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
  test("Multiple error sent", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")

      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}`)
      .set("Content-Type", "application/json")

      .set("Authorization", `Bearer ${token}`)
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
});


describe("User DELETE", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
  
    const adminUser = new User({
      username: "mock",
      email: "mock@mock.com",
      password: hashedPassword,
      permission: "admin",
    });
  
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });
  
    const userWithIcon = new User({
      username: "mockWithIcon",
      email: "mockIcon@mocka.com",
      password: hashedPassword,
      icon: "http://fakeurl.com/icon",
      permission: "regular",
    });
  
    const users = await Promise.all([
      adminUser.save(),
      regularUser.save(),
      userWithIcon.save(),
    ]);
    adminUserId = users[0]._id.toString();
    regularUserId = users[1]._id.toString();
    userWithIconId = users[2]._id.toString();
  
    fakeCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: regularUserId,
      users: [adminUserId],
      posts: [],
    });
  
    const community = await fakeCommunity.save();
    fakeCommunityId = community._id.toString();
  
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    mockPost2 = new Post({
      title: "Another mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
  
    mockPostId = post._id.toString();
    mockPost2Id = post2._id.toString();
  });
  
  afterAll(async () => {
    await User.findByIdAndDelete(adminUserId);
    await User.findByIdAndDelete(regularUserId);
    await User.findByIdAndDelete(userWithIconId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  })

  test("Delete a user not allow without admin permission", async () => {
    const res = await request(app).delete(`/${regularUserId}`);

    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only administrators can delete users" }],
    });
  });

  test("Delete a user with admin permission", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    // query user with admin token
    const res = await request(app)
      .delete(`/${regularUserId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      response: `deleted user ${regularUserId}`,
    });
  });
});

describe("User log in", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
  
    const adminUser = new User({
      username: "mock",
      email: "mock@mock.com",
      password: hashedPassword,
      permission: "admin",
    });
  
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });
  
    const userWithIcon = new User({
      username: "mockWithIcon",
      email: "mockIcon@mocka.com",
      password: hashedPassword,
      icon: "http://fakeurl.com/icon",
      permission: "regular",
    });
  
    const users = await Promise.all([
      adminUser.save(),
      regularUser.save(),
      userWithIcon.save(),
    ]);
    adminUserId = users[0]._id.toString();
    regularUserId = users[1]._id.toString();
    userWithIconId = users[2]._id.toString();
  
    fakeCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: regularUserId,
      users: [adminUserId],
      posts: [],
    });
  
    const community = await fakeCommunity.save();
    fakeCommunityId = community._id.toString();
  
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    mockPost2 = new Post({
      title: "Another mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
  
    mockPostId = post._id.toString();
    mockPost2Id = post2._id.toString();
  });
  
  afterAll(async () => {
    await User.findByIdAndDelete(adminUserId);
    await User.findByIdAndDelete(regularUserId);
    await User.findByIdAndDelete(userWithIconId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  })

  test("Login successfully when writing right credentials", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPassword",
      });

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("mock");
    expect(res.body.user.email).toBe("mock@mock.com");
    expect(res.body.user.permission).toBe("admin");
    expect(res.body.user.communities).toEqual([]);
    // user has no icon
    expect(res.body.user.icon).toBe(undefined);

    expect(res.body).toHaveProperty("token");
  });

  test("Login successfully returns icon if user has one", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mockWithIcon",
        password: "hashedPassword",
      });

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("mockWithIcon");
    expect(res.body.user.email).toBe("mockIcon@mocka.com");
    expect(res.body.user.permission).toBe("regular");
    expect(res.body.user.communities).toEqual([]);
    // user has no icon
    expect(res.body.user.icon).toBe("http://fakeurl.com/icon");

    expect(res.body).toHaveProperty("token");
  });

  // Username is too short
  test("Short username", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mo",
        password: "123456",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Username must be between 3 and 25 characters long"
    );
  });

  // If trying to log in using an invalid username
  test("Invalid username", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mockas",
        password: "hashedPassword",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Incorrect username or password");
  });

  // password is too short
  test("Short password", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "12",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Password must be at least 6 characters long"
    );
  });

  // If trying to log in using an invalid password
  test("Invalid password", async () => {
    const res = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mock",
        password: "hashedPasswordWrong",
      });

    // return Bad request error code
    expect(res.status).toEqual(400);
    // returns error if user is too short
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Incorrect username or password");
  });


});

describe("User sign up", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
  
    const adminUser = new User({
      username: "mock",
      email: "mock@mock.com",
      password: hashedPassword,
      permission: "admin",
    });
  
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });
  
    const userWithIcon = new User({
      username: "mockWithIcon",
      email: "mockIcon@mocka.com",
      password: hashedPassword,
      icon: "http://fakeurl.com/icon",
      permission: "regular",
    });
  
    const users = await Promise.all([
      adminUser.save(),
      regularUser.save(),
      userWithIcon.save(),
    ]);
    adminUserId = users[0]._id.toString();
    regularUserId = users[1]._id.toString();
    userWithIconId = users[2]._id.toString();
  
    fakeCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: regularUserId,
      users: [adminUserId],
      posts: [],
    });
  
    const community = await fakeCommunity.save();
    fakeCommunityId = community._id.toString();
  
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    mockPost2 = new Post({
      title: "Another mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
  
    mockPostId = post._id.toString();
    mockPost2Id = post2._id.toString();
  });
  
  afterAll(async () => {
    await User.findByIdAndDelete(adminUserId);
    await User.findByIdAndDelete(regularUserId);
    await User.findByIdAndDelete(userWithIconId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  });

  // Correct sign up!
  test("Correctly sign up", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
      .send({
        username: "juan",
        email: "juan@juan.com",
        password: "123456",
        passwordConfirm: "123456",
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("juan");
    expect(res.body.user.email).toBe("juan@juan.com");
    expect(res.body.user.permission).toBe("regular");
    expect(res.body.user.votes).toEqual({});
    expect(res.body.user.communities).toEqual([]);

    expect(res.body).toHaveProperty("token");
  });
  
  // invalid username
  test("Not allowed with short username", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
    expect(res.body.errors[0].msg).toEqual(
      "Username must be between 3 and 25 characters long"
    );
  });

  test("Not allowed with already existing username", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
  test("Not allowed with invalid email", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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

  test("Not allowed with already existing email", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
  test("Not allowed with short password", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
    expect(res.body.errors[0].msg).toEqual(
      "Password must be at least 6 characters long"
    );
  });

  test("Not allowed with short password confirm", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
    expect(res.body.errors[0].msg).toEqual(
      "Password must be at least 6 characters long"
    );
  });

  // Different passwords
  test("Not allowed with non matching passwords", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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
  test("Not allowed with non matching passwords", async () => {
    const res = await request(app)
      .post("/sign-up")
      .set("Content-Type", "application/json")
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

});


describe("Vote for a particular community", () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("hashedPassword", 10);
  
    const adminUser = new User({
      username: "mock",
      email: "mock@mock.com",
      password: hashedPassword,
      permission: "admin",
    });
  
    const regularUser = new User({
      username: "mocka",
      email: "mocka@mocka.com",
      password: hashedPassword,
      permission: "regular",
    });
  
    const userWithIcon = new User({
      username: "mockWithIcon",
      email: "mockIcon@mocka.com",
      password: hashedPassword,
      icon: "http://fakeurl.com/icon",
      permission: "regular",
    });
  
    const users = await Promise.all([
      adminUser.save(),
      regularUser.save(),
      userWithIcon.save(),
    ]);
    adminUserId = users[0]._id.toString();
    regularUserId = users[1]._id.toString();
    userWithIconId = users[2]._id.toString();
  
    fakeCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: regularUserId,
      users: [adminUserId],
      posts: [],
    });
  
    const community = await fakeCommunity.save();
    fakeCommunityId = community._id.toString();
  
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    mockPost2 = new Post({
      title: "Another mock post",
      text: "This is a mock post made for testing purposes",
      user: regularUserId,
      community: fakeCommunityId,
    });
  
    const [post, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
  
    mockPostId = post._id.toString();
    mockPost2Id = post2._id.toString();
  });
  
  afterAll(async () => {
    await User.findByIdAndDelete(adminUserId);
    await User.findByIdAndDelete(regularUserId);
    await User.findByIdAndDelete(userWithIconId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  })

  test("Voting allowed by sending the vote field with id and vote type", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote",
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.votes[mockPostId]).toBe("upVote");

  });

  test("Neutral vote allowed", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "",
      });

    // return ok status code
    expect(res.status).toEqual(200);

    // return user and token
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.votes[mockPostId]).toBe("");

  });

  test("Voting twice for the same post leaves only the last vote", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res1 = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote",
      });

    const res2 = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "downVote",
      });

    // return ok status code
    expect(res2.status).toEqual(200);

    // return user and token
    expect(res2.body.user.votes[mockPostId]).toBe("downVote");
  });

  test("Can vote for multiple posts", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res1 = await request(app)
      .put(`/${regularUserId}/vote/${mockPost2Id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote"
      });

    const res2 = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "downVote"
      });

    // return ok status code
    expect(res2.status).toEqual(200);

    // console.log(res2.body.user)
    // return user and token
    expect(res2.body.user.votes[mockPostId]).toBe("downVote");
    expect(res2.body.user.votes[mockPost2Id]).toBe("upVote");
  });

  test("Voting not allowed if user isn't logged in", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .send({
        vote: "upVote"
      });

    expect(res.status).toEqual(403);

    expect(res.body.errors[0].msg).toEqual("Only the user itself can vote");
  });

  test("Voting not allowed if user is another one", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${adminUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote"
      });

    expect(res.status).toEqual(403);

    expect(res.body.errors[0].msg).toEqual("Only the user itself can vote");
  });

  test("Throw error if vote type is invalid", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVot",
      });

    expect(res.status).toEqual(400);

    expect(res.body.errors[0].msg).toEqual(
      "Invalid vote format"
    );
  });


  test("Throw error if vote is missing vote type", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toEqual(400);

    expect(res.body.errors[0].msg).toEqual(
      "Invalid vote format"
    );
  });

  test("Throw error if vote id is invalid", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/1234`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote",
      });

    // return ok status code
    expect(res.status).toEqual(404);
  });

  test("Throw error if post id doesn't exist", async () => {
    // log in and get token
    const logIn = await request(app)
      .post("/log-in")
      .set("Content-Type", "application/json")
      .send({
        username: "mocka",
        password: "hashedPassword",
      });

    const { token } = logIn.body;

    const res = await request(app)
      .put(`/${regularUserId}/vote/123456789a123456789b1234`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vote: "upVote",
      });

    // return ok status code
    expect(res.status).toEqual(400);

    expect(res.body.errors[0].msg).toEqual("Post doesn't exist");
  });
});