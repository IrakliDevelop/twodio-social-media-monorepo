import {IUser} from '@core/models/user.model';

export interface IPost {
  id?: string;
  text?: string;
  iLike?: boolean;
  likeCount?: number;
  created?: string;
  user: IUser;
}

type IPostResponse = IPost[];
