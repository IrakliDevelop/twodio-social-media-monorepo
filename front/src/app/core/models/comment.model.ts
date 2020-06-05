import {IUser} from '@core/models/user.model';

export interface IComment {
  id?: string;
  iLike?: boolean;
  ILikesCount?: number;
  likeCount?: number;
  text?: string;
  created?: number;
  updated?: number;
  user?: IUser;
}
