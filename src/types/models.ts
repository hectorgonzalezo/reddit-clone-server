import { Document, ObjectId } from "mongodb";

export type Vote = "upVote" | "downVote" | "";

interface Votes {
  [index: string]: Vote;
}

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  permission: "regular" | "admin";
  icon?: string;
  communities: [] | ObjectId[] | ICommunity[];
  _id?: string | ObjectId;
  createdAt?: string;
  updatedAt?: string;
  votes: Votes;
}

export interface IPost extends Document {
  title: string;
  text?: string;
  user: ObjectId;
  community: ObjectId | ICommunity;
  upVotes: number;
  comments: [] | ObjectId[] | IComment[];
  url?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  commentsNum?: number;
}

export interface IComment extends Document {
  text: string;
  user: ObjectId | IUser;
  upVotes: number;
  responses: [] | ObjectId[] | IComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICommunity extends Document {
  name: string;
  subtitle: string;
  description: string;
  creator: ObjectId | IUser;
  users: [] | ObjectId[] | IUser[];
  posts: [] | ObjectId[] | IPost[];
  membersQuantity?: number;
  postsQuantity?: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}
