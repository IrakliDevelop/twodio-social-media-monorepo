export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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
  user: User;
}

export interface User {
  id: Scalars['ID'];
  email: Scalars['String'];
  authData?: Maybe<AuthData>;
  posts?: Maybe<Array<Maybe<Post>>>;
}

