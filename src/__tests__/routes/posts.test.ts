const request = require("supertest");
const express = require("express");
const users = require("../../routes/users");
const posts = require("../../routes/posts");
import bcrypt from "bcryptjs";
const initializeMongoServer = require("../../mongoConfigTesting");
import Community from "../../models/communityModel";
import Post from '../../models/postModel';
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
let mockCommunity: ICommunity;
let mockCommunityId: string;
let mockPost: IPost;
let mockPostId: IPost;
let mockPost2: IPost;
let mockPost2Id: IPost;


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
      .set("Accept", "application/json")
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
      text:  "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
    });

    mockPost2 = new Post({
      title: "Mock post 2",
      text:  "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
    });

    const [post1, post2] = await Promise.all([mockPost.save(), mockPost2.save()]);
    mockPostId = post1._id.toString();
    mockPost2Id = post2._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
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
    expect(res.body.post.community.toString()).toEqual(mockCommunityId);
  });

  test("Looking for a non existing post returns an error", async () => {
    const res = await request(app).get(`/posts/123456789a123456789b1234`);

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual("No post with id 123456789a123456789b1234 found");
  });

  test("Looking for a post with a string that doesn't match an id doesn't return anything", async () => {
    const res = await request(app).get(`/posts/12345`);

    // Return not found status code
    expect(res.status).toEqual(404);
  });
});