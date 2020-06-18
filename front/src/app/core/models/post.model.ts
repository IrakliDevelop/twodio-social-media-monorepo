import {IUser} from '@core/models/user.model';

export interface IPost {
  id?: string;
  text?: string;
  iLike?: boolean;
  likeCount?: number;
  childrenCount?: number;
  created?: Date;
  updated?: Date;
  user: IUser;
}

type IPostResponse = IPost[];
