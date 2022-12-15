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
describe("POST/create comments", () => {
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
    await Comment.findByIdAndDelete(mockComment2Id);
  });

  test("Allowed for logged in regular user", async () => {

    const res = await request(app)
      .post(`/posts/${mockPostId}/comments/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "New fake comment",
      });

    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct  info
    expect(res.body.comment.text).toBe("New fake comment");
    // assign current user to be the comment creator
    expect(res.body.comment.user.toString()).toBe(userId);
    // upvotes is 0
    expect(res.body.comment.upVotes).toBe(0);
    // responses is an empty array
    expect(res.body.comment.responses).toEqual([]);
  });

  test("Not allowed if user isn't logged in", async () => {

    const res = await request(app)
    .post(`/posts/${mockPostId}/comments/`)
      .set("Content-Type", "application/json")
      // don't send authorization
      .send({
        text: "New fake comment",
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // return both mock posts
    expect(res.body).toEqual({
      errors: [{ msg: "Only logged in users can add comments" }],
    });
  });

  test("Not allowed with no text", async () => {

    const res = await request(app)
    .post(`/posts/${mockPostId}/comments/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Comment text can't be empty");
  });

  test("Adding a comment without parent adds it to the post", async () => {
    // Get previous number of comments
    const postPreviously = await Post.findById(mockPostId) as IPost;
    
    const res = await request(app)
    .post(`/posts/${mockPostId}/comments/`)
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send({
      text: "New fake comment",
    });

    // get post after adding comments
    const postAfter = await Post.findById(mockPostId) as IPost;

  expect(res.status).toEqual(200);
  expect(/.+\/json/.test(res.type)).toBe(true);

  expect(postAfter).not.toBe(null);
  expect(postPreviously).not.toBe(null);
  // check if a response was added
  expect(postAfter.comments.length).toBe(postPreviously.comments.length + 1);
  });

  test("Comments can be added as responses by setting a parent", async () => {
        // Get previous number of responses in comment
        const commentPreviously = await Comment.findById(mockCommentId) as IComment;
    
        const res = await request(app)
        .post(`/posts/${mockPostId}/comments/`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "New fake comment",
          parent: mockCommentId
        });
    
      // get comment after adding response
      const commentAfter = await Comment.findById(mockCommentId) as IComment;

      expect(res.status).toEqual(200);
      expect(/.+\/json/.test(res.type)).toBe(true);
      expect(commentAfter.responses.length).toBe(
        commentPreviously.responses.length + 1
      );
  });

  test("Not allowed if parent doesn't exist", async () => {
    // Get previous number of responses in comment
    const commentPreviously = await Comment.findById(mockCommentId) as IComment;

    const res = await request(app)
    .post(`/posts/${mockPostId}/comments/`)
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send({
      text: "New fake comment",
      parent: '123456789a123456789b1234'
    });

  // get comment after adding response
  const commentAfter = await Comment.findById(mockCommentId);

  expect(res.status).toEqual(400);
  expect(res.body.errors[0].msg).toEqual("Parent comment doesn't exist");
});

test("Not allowed if parent isn't a valid id", async () => {
  // Get previous number of responses in comment
  const commentPreviously = await Comment.findById(mockCommentId) as IComment;

  const res = await request(app)
  .post(`/posts/${mockPostId}/comments/`)
  .set("Content-Type", "application/json")
  .set("Authorization", `Bearer ${token}`)
  .send({
    text: "New fake comment",
    parent: '1234'
  });

// get comment after adding response
const commentAfter = await Comment.findById(mockCommentId);

expect(res.status).toEqual(400);
expect(res.body.errors[0].msg).toEqual("Parent comment doesn't exist");
});
});



// Update comments
describe("PUT/update comments", () => {
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
    const community = await mockCommunity.save(); 
    mockCommunityId = community._id.toString();


    mockComment = new Comment({
      text: "Mock comment",
      user: userId,
      upVotes: 1
    });

    mockComment2 = new Comment({
      text: "Mock comment2",
      user: adminUserId,
      upVotes: 13,
      responses: [mockCommentId]
    });

    const [comment1, comment2] = await Promise.all([mockComment.save(), mockComment2.save()]);


    mockCommentId = comment1._id.toString();
    mockComment2Id = comment2._id.toString();

    mockPost = new Post({
      title: "Mock post",
      text: "This is a mock post made for testing purposes",
      user: userId,
      community: mockCommunityId,
      comments: [mockComment2Id]
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
    await Comment.findByIdAndDelete(mockComment2Id);
  });

  test("Allowed for logged in regular user which is the comment creator", async () => {

    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/${mockCommentId}/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "This is an updated comment",
      });


    expect(res.status).toEqual(200);
    expect(/.+\/json/.test(res.type)).toBe(true);

    // Return the correct comment info
    expect(res.body.comment.text).toBe("This is an updated comment");
    expect(res.body.comment.upVotes).toBe(mockComment.upVotes);
    expect(res.body.comment.responses).toEqual(mockComment.responses);
    // assign current user to be the comment creator
    expect(res.body.comment.user.toString()).toBe(userId);
  });

  test("Not allowed if user isn't logged in", async () => {

    const res = await request(app)
    .put(`/posts/${mockPostId}/comments/${mockCommentId}/`)
    .set("Content-Type", "application/json")
    // No authorization
    .send({
      text: "This is an updated post",
    });

    // return unauthorized status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the comment creator can update it" }],
    });
  });

  test("Not allowed if user isn't the comment creator", async () => {
    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/${mockComment2Id}/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "This is an updated post",
      });

    // return ok status and json
    expect(res.status).toEqual(403);
    expect(/.+\/json/.test(res.type)).toBe(true);
    expect(res.body).toEqual({
      errors: [{ msg: "Only the comment creator can update it" }],
    });
  });

  test("Updating keeps the same upvotes, and responses", async () => {
    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/${mockComment2Id}/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        text: "This is an updated post",
      });

    expect(res.body.comment.upVotes).toBe(mockComment2.upVotes);
    expect(res.body.comment.responses).toEqual(mockComment2.responses);
  });

  test("Not allowed with no text", async () => {

    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/${mockCommentId}/`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    // return Bad request error code
    expect(res.status).toEqual(400);
    expect(res.body.errors).not.toBe(undefined);
    expect(res.body.errors[0].msg).toEqual("Comment text can't be empty");
  });

  test("Parents can't be changed", async () => {
    // Get previous number of responses in comment
    const commentPreviously = await Comment.findById(mockComment2Id) as IComment;

    const res = await request(app)
    .put(`/posts/${mockPostId}/comments/${mockCommentId}/`)
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send({
      text: "New fake comment",
      parent: mockComment2Id
    });

  // get comment after adding response
  const commentAfter = await Comment.findById(mockComment2Id) as IComment;

  expect(res.status).toEqual(200);
  expect(/.+\/json/.test(res.type)).toBe(true);
  // Parent responses shouldn't change
  expect(commentAfter.responses.length).toBe(
    commentPreviously.responses.length
  );
});

  test("Updating a non existing post returns an error", async () => {
    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/123456789a123456789b1234`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        text: "New fake comment",
      });

    expect(res.status).toEqual(404);
    expect(/.+\/json/.test(res.type)).toBe(true);
    // returns error if user is not authorized
    expect(res.body.error).toEqual(
      "No comment with id 123456789a123456789b1234 found"
    );
  });

  test("Updating a  with a string that doesn't match an id doesn't return anything", async () => {
    const res = await request(app)
      .put(`/posts/${mockPostId}/comments/12345`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        text: "New fake comment",
      });

    expect(res.status).toEqual(404);
  });
  
});