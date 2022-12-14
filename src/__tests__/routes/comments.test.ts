const request = require("supertest");
import express, { Request, Response, NextFunction } from 'express';
const users = require("../../routes/users");
const comments = require("../../routes/comments");
import bcrypt from "bcryptjs";
const initializeMongoServer = require("../../mongoConfigTesting");
import Community from "../../models/communityModel";
import Post from '../../models/postModel';
import User from "../../models/userModel";
import Comment from '../../models/commentModel';
import { ExtendedRequest } from "../../types/extendedRequest";
import { IComment, ICommunity } from "../../types/models";
import { IPost } from "../../types/models";

const app = express();

initializeMongoServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  "/posts/:postId/comments/",
  (req: ExtendedRequest, res: Response, next: NextFunction) => {
    req.postId = req.params.postId;
    next();
  },
 comments 
);
app.use("/users/", users);

let token: string;
let userId: string;
let adminToken: string;
let adminUserId: string;
let mockCommunity: ICommunity;
let mockCommunity2: ICommunity;
let mockCommunityId: string;
let mockCommunity2Id: string;
let mockPost: IPost;
let mockPostId: string;
let mockPost2: IPost;
let mockPost2Id: string;
let mockComment: IComment;
let mockCommentId: string;
let mockComment2: IComment;
let mockComment2Id: string;
let mockCommentResponse: IComment;
let mockCommentResponseId: string;
let mockCommentResponse2: IComment;
let mockCommentResponse2Id: string;

describe("GET comments", () => {
  // Add communities, user and comments to mock database
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
    const community = await mockCommunity.save(); 
    mockCommunityId = community._id.toString();


    // Create mock response to be inserted into mockResponse
    mockCommentResponse2 = new Comment({
      text: "Mock response",
      user: userId,
      upVotes: 3
    });

    const commentResponse2 = await mockCommentResponse2.save();
    mockCommentResponse2Id = commentResponse2._id.toString();

    // Create mock Response inserted into mockComment
    mockCommentResponse = new Comment({
      text: "Mock response",
      user: userId,
      upVotes: 3,
      responses: [mockCommentResponse2Id]
    });

    const commentResponse = await mockCommentResponse.save();
    mockCommentResponseId = commentResponse._id.toString(); 

    mockComment = new Comment({
      text: "Mock comment",
      user: userId,
      upVotes: 1,
      responses: [mockCommentResponse]
    });


    const comment = await mockComment.save();


    mockCommentId = comment._id.toString();

    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      comments: [mockCommentId]
    });

    const post = await mockPost.save();

    mockPostId = post._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
    await Comment.findByIdAndDelete(mockCommentId);
  });

  test("Get all comments in a post", async () => {
    const res = await request(app).get(`/posts/${mockPostId}/comments`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock comments
    expect(res.body.comments.length).toBe(1);
    expect(res.body.comments[0].text).toBe(mockComment.text)
  });

  

  test("Comment responses are populated", async () => {
    const res = await request(app).get(`/posts/${mockPostId}/comments`);

    // return ok status and json
    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);
    console.log(res.body.comments[0].responses[0].responses);
    // return populated mock comment
    expect(res.body.comments[0].responses.length).toBe(1);
    expect(res.body.comments[0].responses[0].text).toBe(mockCommentResponse.text);
    expect(res.body.comments[0].responses[0].responses[0].text).toBe(mockCommentResponse2.text);
  });

  test("Get a particular comment", async () => {
    const res = await request(app).get(
      `/posts/${mockPostId}/comments/${mockCommentId}`
    );

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct comment info
    expect(res.body.comment.text).toBe(mockComment.text);
    expect(res.body.comment.user).toBe(userId);
    expect(res.body.comment.upVotes).toBe(mockComment.upVotes);
  });

  test("Get nested comment (response) ", async () => {
    const res = await request(app).get(
      `/posts/${mockPostId}/comments/${mockCommentResponseId}`
    );

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct comment info
    expect(res.body.comment.text).toBe(mockCommentResponse.text);
    expect(res.body.comment.user).toBe(userId);
    expect(res.body.comment.upVotes).toBe(mockCommentResponse.upVotes);
  });

  test("Looking for a non existing comment returns an error", async () => {
    const res = await request(app).get(
      `/posts/${mockPostId}/comments/123456789a123456789b1234`
    );

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No comment with id 123456789a123456789b1234 found"
    );
  });

  test("Looking for a comment with a string that doesn't match an id doesn't return anything", async () => {
    const res = await request(app).get(`/posts/${mockPostId}/comments/12345`);

    // Return not found status code
    expect(res.status).toEqual(404);
  });
});

// create comments
describe.skip("POST/create comments", () => {
  // Add communities, user and comments to mock database
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
    const community = await mockCommunity.save(); 
    mockCommunityId = community._id.toString();


    mockComment = new Comment({
      text: "Mock comment",
      user: userId,
      upVotes: 1
    });

    mockComment2 = new Comment({
      text: "Mock comment2",
      user: userId,
      upVotes: 1
    });

    const [comment1, comment2] = await Promise.all([mockComment.save(), mockComment2.save()]);


    mockCommentId = comment1._id.toString();
    mockComment2Id = comment2._id.toString();

    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      comments: [mockCommentId, mockComment2Id]
    });

    const post = await mockPost.save();

    mockPostId = post._id.toString();
  });

  // remove communities and user from database
  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Community.findByIdAndDelete(mockCommunityId);
    await Post.findByIdAndDelete(mockPostId);
    await Comment.findByIdAndDelete(mockCommentId);
  });

  test("Allowed for logged in regular user", async () => {
    const newComment = {
      text: "New fake comment",
      user: userId,
    };

    const res = await request(app)
      .post(`/posts/${mockPostId}/comments/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(newComment);

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct  info
    expect(res.body.post.text).toBe(newComment.text);
    // assign current user to be the post creator
    expect(res.body.post.user.toString()).toBe(userId);
    // upvotes is 0
    expect(res.body.post.upVotes).toBe(0);
    // responses is an empty array
    expect(res.body.post.responses).toEqual([]);
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


  test("Not allowed with no text", async () => {
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

  test("Not allowed without post", async () => {
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

  test("Not allowed if post doesn't exist", async () => {
    const newPost = {
      title: "newMock",
      text: "New post",
      community: "123456789a123456789b1234"
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

  test("Adding a comment updates the post", async () => {
  });

  test("Upvotes are 0 by default", async () => {
  });

  test("Comments without parent are added to post", async () => {
  });

  test("Comments can be added as responses by setting a parent", async () => {
  });
});