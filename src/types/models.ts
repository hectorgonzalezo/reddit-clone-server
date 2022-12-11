import { Document, ObjectId } from "mongodb";

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  permission: "regular" | "admin";
  icon?: string;
  communities: [] | ObjectId[] | ICommunity[];
}

export interface IPost extends Document {
  title: string;
  text: string;
  user: ObjectId;
  community: ObjectId;
  upVotes: number;
  comments: [] | ObjectId[] | IComment[];
}

export interface IComment extends Document {
  text: string;
  user: ObjectId | IUser;
  upVotes: number;
}

export interface ICommunity extends Document {
  name: string;
  subtitle: string;
  description: string;
  users: [] | ObjectId[] | IUser[];
  posts: [] | ObjectId[] | IPost[];
  membersQuantity: number;
  postsQuantity: number;
  icon?: string;
}