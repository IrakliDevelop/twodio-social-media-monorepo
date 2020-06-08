export interface IUser {
  id?: string;
  email?: string;
  username?: string;
  fullName?: string;
  iFollow?: boolean;
  followsCount?: number;
  followersCount?: number;
  postsCount?: number;
}

export interface IUserSearchResponse {
  byUsername?: IUser[];
  byFullName?: IUser[];
}
