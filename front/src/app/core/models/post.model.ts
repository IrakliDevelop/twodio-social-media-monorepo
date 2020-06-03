import {IUser} from '@core/models/user.model';

export interface IPost {
  id?: string;
  text?: string;
  likeCount?: number;
  created?: string;
  user: IUser;
}

export interface IPostResponse {
  posts: IPost[];
}
