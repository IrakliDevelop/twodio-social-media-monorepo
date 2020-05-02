export interface IUser {
  id?: string;
  email?: string;
  username?: string;
  fullName?: string;
  followsCount?: number;
  followerCount?: number;
  postsCount?: number;
}

export interface IUserSearchResponse {
  byUsername?: IUser[];
  byFullName?: IUser[];
}
