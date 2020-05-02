export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
};

export interface AuthData {
  id: Scalars['ID'];
  provider: AuthProvider;
  sub: Scalars['String'];
  user?: Maybe<User>;
}

export interface AuthProvider {
  id: Scalars['ID'];
  name: Scalars['String'];
}


export interface Post {
  id: Scalars['ID'];
  text?: Maybe<Scalars['String']>;
  created: Scalars['DateTime'];
  updated: Scalars['DateTime'];
  user: User;
  likes?: Maybe<Array<User>>;
}

export interface User {
  id: Scalars['ID'];
  email: Scalars['String'];
  username: Scalars['String'];
  fullName: Scalars['String'];
  authData?: Maybe<AuthData>;
  follows?: Maybe<Array<User>>;
  followers?: Maybe<Array<User>>;
  posts?: Maybe<Array<Maybe<Post>>>;
}

