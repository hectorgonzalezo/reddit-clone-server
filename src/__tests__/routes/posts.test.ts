const request = require("supertest");
const express = require("express");
const users = require("../../routes/users");
const posts = require("../../routes/posts");
import bcrypt from "bcryptjs";
const initializeMongoServer = require("../../mongoConfigTesting");
import Community from "../../models/communityModel";
import Post from "../../models/postModel";
import Comment from "../../models/commentModel";
import User from "../../models/userModel";
import { ICommunity, IPost } from "../../types/models";

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/posts/", posts);
app.use("/users/", users);

let token: string;
let userId: string;
let adminToken: string;
let adminUserId: string;
let mockCommunity: ICommunity;
let mockCommunityId: string;
let mockPost: IPost;
let mockPostId: string;
let mockPost2: IPost;
let mockPost2Id: string;

describe("GET posts", () => {
  // Add communities, posts and user to mock database
  beforeAll(async () => {
    // Log user in
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

    // Add fake community
    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    const community = await mockCommunity.save();
    mockCommunityId = community._id.toString();

    // Create two posts
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
    });

    mockPost2 = new Post({
      title: "Mock post 2",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      url: 'http://mock.com'
    });

    const [post1, post2] = await Promise.all([
      mockPost.save(),
      mockPost2.save(),
    ]);
    mockPostId = post1._id.toString();
    mockPost2Id = post2._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  });

  test("Get all posts in database", async () => {
    const res = await request(app).get("/posts/");

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock posts
    expect(res.body.posts.length).toBe(2);
  });

  test("Get info about a particular post", async () => {
    const res = await request(app).get(`/posts/${mockPostId}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct post info
    expect(res.body.post.title).toBe(mockPost.title);
    expect(res.body.post.text).toBe(mockPost.text);
    expect(res.body.post.user.toString()).toBe(userId);
    // virtual property
    expect(res.body.post.commentsNum).toBe(0);
    expect(res.body.post.community.toString()).toEqual(mockCommunityId);
    // It has timestamp
    expect(res.body.post.createdAt).not.toBe(undefined);
    // It has no url
    expect(res.body.post.url).toBe(undefined); 
  });

  test("If post has url, return it", async () => {
    const res = await request(app).get(`/posts/${mockPost2Id}`);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // It has url
    expect(res.body.post.url).toBe(mockPost2.url); 
  });

  test("Looking for a non existing post returns an error", async () => {
    const res = await request(app).get(`/posts/123456789a123456789b1234`);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No post with id 123456789a123456789b1234 found"
    );
  });

  test("Looking for a post with a string that doesn't match an id doesn't return anything", async () => {
    const res = await request(app).get(`/posts/12345`);

    // Return not found status code
    expect(res.status).toEqual(404);
  });
});

// Create posts
describe("POST/create posts", () => {
  // Add communities, posts and user to mock database
  beforeAll(async () => {
    // Log user in
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

    // Add fake community
    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    const community = await mockCommunity.save();
    mockCommunityId = community._id.toString();

    // Create two posts
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
    });

    const post = await mockPost.save();
    mockPostId = post._id.toString();
  });

  // remove communities, users and posts from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
  });

  test("Allowed for logged in regular user", async () => {
    const newPost = {
      title: "New mock post",
      text: "New fake post",
      community: mockCommunityId,
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct  info
    expect(res.body.post.title).toBe(newPost.title);
    expect(res.body.post.text).toBe(newPost.text);
    expect(res.body.post.community).toBe(newPost.community);
    // assign current user to be the post creator
    expect(res.body.post.user.toString()).toBe(userId);
    // upvotes is 0
    expect(res.body.post.upVotes).toBe(0);
    // comments is an empty array
    expect(res.body.post.comments).toEqual([]);
    // it has no url
    expect(res.body.post.url).toBe(undefined);
  });

  test("URL is optional", async () => {
    const newPost = {
      title: "New mock post",
      text: "New fake post",
      community: mockCommunityId,
      url: 'http://fake.com/fake'
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct  info
    expect(res.body.post.title).toBe(newPost.title);
    expect(res.body.post.text).toBe(newPost.text);
    expect(res.body.post.community).toBe(newPost.community);
    // assign current user to be the post creator
    expect(res.body.post.user.toString()).toBe(userId);
    // upvotes is 0
    expect(res.body.post.upVotes).toBe(0);
    // comments is an empty array
    expect(res.body.post.comments).toEqual([]);
    // it has url
    expect(res.body.post.url).toBe('http://fake.com/fake');

  });

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      // don't send authorization
      .send({
        title: "New mock post",
        text: "New fake post is here",
        community: mockCommunityId,
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock posts
    expect(res.body).toEqual({
      errors: [{ msg: "Only logged in users can create posts" }],
    });
  });

  test("Not allowed with short title", async () => {
    const newPost = {
      title: "ne",
      text: "New fake post",
      community: mockCommunityId,
    };
    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Post title must be between 3 and 300 characters long"
    );
  });

  test("Not allowed with long title", async () => {
    const newPost = {
      title: `newMockasfdasdfoqiuwoeruqowieruoqiwuoqwreqweqwuerioquewroruqweiru
      qwieoruqoiweurqoiwueroqiuwroiquweroiquweporiuqweioruqwoeiruqowiruqowiruqo
      iweurqoiweuoiqwuroiquwroiquwopiuqworuoqwiuoiwqurpoiwqer123quweprquweporiu
      qpwoireuqwoeirupqowierupoqiwureoiquwepoiquweroirupqwoieruoqiweuropqiwuepo
      riquweropiquwopreupqworeiuqworieuqpwoeeupqoiwer`,
      text: "New fake post",
      community: mockCommunityId,
    };
    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Post title must be between 3 and 300 characters long"
    );
  });

  test("Not allowed with short text", async () => {
    const newPost = {
      title: "newMock",
      text: "",
      community: mockCommunityId,
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Post text can't be empty");
  });

  test("Not allowed without community", async () => {
    const newPost = {
      title: "newMock",
      text: "New post",
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community doesn't exist");
  });

  test("Not allowed if community doesn't exist", async () => {
    const newPost = {
      title: "newMock",
      text: "New post",
      community: "123456789a123456789b1234",
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community doesn't exist");
  });

  test("Not allowed if URL isn't valid", async () => {
    const newPost = {
      title: "newMock",
      text: "New post",
      community: mockCommunityId,
      url: '1234'
    };

    const res = await request(app)
      .post("/posts/")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("URL isn't valid");
  });
});

//  Update posts
describe("PUT/update posts", () => {
  // Add communities, posts and user to mock database
  beforeAll(async () => {
    // Log user in
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

    // Add fake community
    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    const community = await mockCommunity.save();
    mockCommunityId = community._id.toString();

    // Create comment
    const mockComment = new Comment({
      text: "Mock Comment",
      user: userId,
      upVotes: 0,
    });

    const comment = await mockComment.save();

    // Create post with upvotes and comment
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      upVotes: 13,
      comments: [comment._id],
    });

    mockPost2 = new Post({
      title: "Mock post 2",
      text: "This is a mock post made for testing purposes",
      user: "123456789b123456789c1234",
      community: mockCommunityId,
    });

    const [post1, post2] = await Promise.all([
      mockPost.save(),
      mockPost2.save(),
    ]);
    mockPostId = post1._id.toString();
    mockPost2Id = post2._id.toString();
  });

  // remove communities, users and posts from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await User.findByIdAndDelete(adminUserId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
    await Post.findByIdAndDelete(mockPost2Id);
  });

  test("Allowed for logged in regular user which is the post creator", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct post info
    expect(res.body.post.title).toBe(updatedPost.title);
    expect(res.body.post.text).toBe(updatedPost.text);
    expect(res.body.post.community).toBe(mockCommunityId);
    // assign current user to be the post creator
    expect(res.body.post.user.toString()).toBe(userId);
  });

  test("Not allowed if user isn't logged in", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      // don't send authorization
      .send(updatedPost);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the post creator can update the post" }],
    });
  });

  test("Not allowed if user isn't the post creator", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPost2Id}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the post creator can update the post" }],
    });
  });

  test("Updating keeps the same upvotes, comments and community", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    expect(res.body.post.community).toBe(mockCommunityId);
    expect(res.body.post.upVotes).toEqual(13);
    expect(res.body.post.comments.length).toEqual(1);
  });

  test("Not allowed with short title", async () => {
    const updatedPost = {
      title: "An",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Post title must be between 3 and 300 characters long"
    );
  });

  test("Not allowed with long title", async () => {
    const updatedPost = {
      title: `newMockasfdasdfoqiuwoeruqowieruoqiwuoqwreqweqwuerioquewroruqweiru
      qwieoruqoiweurqoiwueroqiuwroiquweroiquweporiuqweioruqwoeiruqowiruqowiruqo
      iweurqoiweuoiqwuroiquwroiquwopiuqworuoqwiuoiwqurpoiwqer123quweprquweporiu
      qpwoireuqwoeirupqowierupoqiwureoiquwepoiquweroirupqwoieruoqiweuropqiwuepo
      riquweropiquwopreupqworeiuqworieuqpwoeeupqoiwer`,
      text: "New fake post",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")

      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual(
      "Post title must be between 3 and 300 characters long"
    );
  });

  test("Not allowed with short text", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Post text can't be empty");
  });

  test("Not allowed if community doesn't exist", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
      community: "123456789a123456789b1234",
    };

    const res = await request(app)
      .put(`/posts/${mockPostId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedPost);

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Community doesn't exist");
  });

  test("Updating a non existing post returns an error", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put("/posts/123456789a123456789b1234")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedPost);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No post with id 123456789a123456789b1234 found"
    );
  });

  test("Updating a  with a string that doesn't match an id doesn't return anything", async () => {
    const updatedPost = {
      title: "An updated mock post",
      text: "An updated fake post",
    };

    const res = await request(app)
      .put("/posts/12345")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedPost);

    expect(res.status).toEqual(404);
  });
});

//  Delete posts
describe("DELETE posts", () => {
  // Add communities, posts and user to mock database
  beforeAll(async () => {
    // Log user in
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

    // Add fake community
    mockCommunity = new Community({
      name: "mockCommunity",
      subtitle: "Fake community",
      description: "This is a fake community created for testing purposes",
      creator: userId,
      users: [],
      posts: [],
    });

    const community = await mockCommunity.save();
    mockCommunityId = community._id.toString();

    // Create comment
    const mockComment = new Comment({
      text: "Mock Comment",
      user: userId,
      upVotes: 0,
    });

    const comment = await mockComment.save();

    // Create post with upvotes and comment
    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      upVotes: 13,
      comments: [comment._id],
    });

    mockPost2 = new Post({
      title: "Mock post 2",
      text: "This is a mock post made for testing purposes",
      user: "123456789b123456789c1234",
      community: mockCommunityId,
    });

    const [post1, post2] = await Promise.all([
      mockPost.save(),
      mockPost2.save(),
    ]);
    mockPostId = post1._id.toString();
    mockPost2Id = post2._id.toString();
  });

  // remove communities, users and posts from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
  });

  test("Allowed for logged in regular user which is the post creator", async () => {
    const res = await request(app)
      .delete(`/posts/${mockPostId}`)
      .set("Authorization", `Bearer ${token}`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return delete message
    expect(res.body.msg).toBe(`Post ${mockPostId} deleted`);

    // Look for post, it shouldn't be there
    const post = await Post.findById(mockPostId);
    expect(post).toBe(null);
  });

  test("Not allowed if user isn't logged in", async () => {
    const res = await request(app).delete(`/posts/${mockPostId}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock posts
    expect(res.body).toEqual({
      errors: [{ msg: "Only the post creator can delete the post" }],
    });
  });

  test("Not allowed if user isn't the post creator", async () => {
    const res = await request(app)
      .delete(`/posts/${mockPost2Id}`)
      .set("Authorization", `Bearer ${token}`);

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock posts
    expect(res.body).toEqual({
      errors: [{ msg: "Only the post creator can delete the post" }],
    });
  });

  test("Deleting a non existing post returns an error", async () => {
    const res = await request(app)
      .delete("/posts/123456789a123456789b1234")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No post with id 123456789a123456789b1234 found"
    );
  });

  test("Deleting a post with a string that doesn't match and id doesn't return anything", async () => {
    const res = await request(app)
      .delete("/posts/12345")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(404);
  });
});
