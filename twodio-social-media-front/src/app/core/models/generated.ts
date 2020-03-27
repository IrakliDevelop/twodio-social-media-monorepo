export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export interface IUser {
  id: Scalars['ID'];
  username: Scalars['String'];
  email: Scalars['String'];
  name: Scalars['String'];
}

