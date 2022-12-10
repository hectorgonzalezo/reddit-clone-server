export interface IUser {
  email: string;
  username: string;
  password: string;
  permission: "regular" | "admin";
  icon?: string;
  communities?: string[];
}
