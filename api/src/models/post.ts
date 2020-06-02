import { injectable } from 'tsyringe';
import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import * as R from 'ramda';
import { RequireOnly, User, Post } from '../types';
import {
  Projection,
  Query,
  Edge,
  setVarsForRequest,
  extractPath,
} from './utils';

interface CreatePostArg extends Omit<Post, 'id' | 'user'> {
  user: RequireOnly<User, 'id'>;
}
type UpdatePostArg = RequireOnly<Omit<Post, 'user'>, 'id'>;

interface AddCommentArg extends Omit<Post, 'id' | 'user' | 'parent'> {
  user: RequireOnly<User, 'id'>;
  parent: RequireOnly<Post, 'id'>;
}

export const postProjections = {
  general: {
    id: 1,
    text: 1,
    created: 1,
    updated: 1,
    likeCount: 'count(Post.likes)',
  },
};

@injectable()
export class PostModel {

  constructor(
    private client: DgraphClient
  ) { }

  async runQueries(...queries: Query[]) {
    return Query.run(this.client, ...queries)
      .then(x => x.getJson());
  }

  async runQuery(query: Query) {
    return this.runQueries(query);
  }

  async fetchByUserID(userID: string, projection: Projection, {
    queryName = 'q',
    first = 20,
    offset = 0,
    after = '',
    orderAsc = '',
    orderDesc = '',
    maxCount = 20,
  } = {}): Promise<any> {
    return new Query('user', queryName)
      .func('uid($userID)')
      .project({
        posts: Edge.fromRaw('post', projection)
          .filter('NOT has(Post.parent)')
          .first(Math.min(maxCount, first))
          .offset(offset)
          .after(after)
          .orderAsc(orderAsc)
          .orderDesc(orderDesc),
      })
      .vars({ userID: ['string', userID] })
      .run(this.client)
      .then(extractPath([queryName, 0, 'posts']));
  }

  async fetchByID(id: string, projection: Projection, {
    queryName = 'q',
  } = {}): Promise<any> {
    return new Query('post', queryName)
      .func('uid($id)')
      .project(projection)
      .vars({ id: ['string', id] })
      .run(this.client)
      .then(extractPath([queryName, 0]));
  }

  async create(post: CreatePostArg) {
    const mu = new Mutation();
    mu.setSetJson({
      'uid': post.user.id,
      'User.posts': {
        'dgraph.type': 'Post',
        'uid': '_:post',
        'Post.text': post.text,
        'Post.created': post.created,
        'Post.updated': post.updated,
        'Post.user': { uid: post.user.id },
      },
    });

    const txn = this.client.newTxn();
    const result = await txn.mutate(mu);
    await txn.commit();

    return result.getUidsMap().get('post');
  }

  /**
   * @returns `true` if post was found for user, else `false`
   */
  async update(userID: string, post: UpdatePostArg) {
    const request = new DgraphRequest();

    const query = new Query('user', 'q')
      .func('uid($userID)')
      .vars({
        userID: ['string', userID],
        postID: ['string', post.id],
      })
      .project({
        uid: 1,
        posts: 'User.posts @filter(uid($postID)) { postID as uid }',
      });
    request.setQuery(query.toString());

    setVarsForRequest(request.getVarsMap(), query.queryVarsObj);

    const mu = new Mutation();
    // only update if post found for the user
    mu.setCond('@if(eq(len(postID), 1))');
    mu.setSetJson({
      'uid': userID,
      'User.posts': {
        'uid': 'uid(postID)',
        'dgraph.type': 'Post',
        'Post.text': post.text,
        'Post.created': post.created,
        'Post.updated': post.updated,
        'Post.user': { uid: userID },
      },
    });

    request.addMutations(mu);
    request.setCommitNow(true);

    const txn = this.client.newTxn();

    const result = await txn.doRequest(request);

    return !!R.path(['q', 0, 'posts', 0, 'uid'], result.getJson());
  }

  async addComment(comment: AddCommentArg) {
    const mu = new Mutation();
    mu.setSetJson({
      'uid': comment.parent.id,
      'Post.children': {
        'dgraph.type': 'Post',
        'uid': '_:comment',
        'Post.text': comment.text,
        'Post.created': comment.created,
        'Post.updated': comment.updated,
        'Post.parent': { uid: comment.parent.id },
        'Post.user': { uid: comment.user.id },
      },
    });

    const txn = this.client.newTxn();
    const result = await txn.mutate(mu);
    await txn.commit();

    return result.getUidsMap().get('comment');
  }

  async setLike(userID: string, postID: string, flag = true) {
    const mu = new Mutation();
    mu[flag ? 'setSetJson' : 'setDeleteJson']({
      'uid': postID,
      'Post.likes': { uid: userID },
    });

    const txn = this.client.newTxn();
    const result = await txn.mutate(mu);
    await txn.commit();

    return result.getUidsMap().get('post');
  }

  async like(userID: string, postID: string) {
    return this.setLike(userID, postID, true);
  }

  async unlike(userID: string, postID: string) {
    return this.setLike(userID, postID, false);
  }
}

