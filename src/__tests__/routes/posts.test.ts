const request = require("supertest");
const express = require("express");
const users = require("../../routes/users");
const communities = require("../../routes/communities");
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
app.use("/posts/", communities);
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
  // Add communities and user to mock database
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


});