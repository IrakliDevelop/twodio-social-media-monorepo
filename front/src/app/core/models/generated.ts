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
  provider: AuthProvider;
  sub: Scalars['String'];
  user?: Maybe<User>;
}

export interface AuthProvider {
  name: Scalars['String'];
}

export interface User {
  id: Scalars['ID'];
  email: Scalars['String'];
  authData?: Maybe<AuthData>;
}

