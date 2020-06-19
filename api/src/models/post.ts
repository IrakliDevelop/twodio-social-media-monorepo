import { injectable } from 'tsyringe';
import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import * as R from 'ramda';
import { RequireOnly, User, Post } from '../types';
import {
  Projection,
  Query,
  Edge,
  setVarsForRequest,
} from '../dgraph';
import { BaseModel } from './base-model';
import { QueryOptions, withArgs } from './utils';
import * as queries from './queries';

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
    childrenCount: 'count(Post.children)',
  },
};

/**
 * @param userID uid or param name
 */
export function iLikeProjection(userID: string) {
  return {
    iLikesCount: `iLikesCount as count(Post.likes @filter(uid(${userID})))`,
    iLike: 'math(iLikesCount > 0)',
  };
}

@injectable()
export class PostModel extends BaseModel {
  constructor(
    client: DgraphClient
  ) {
    super('post', client);
  }

  async fetchByUserID(
    userID: string,
    projection: Projection,
    opts: Partial<QueryOptions> = {}
  ): Promise<any> {
    return queries.fetchByID(
        'user',
        {
          posts: Edge.fromRaw('post', projection)
            .apply(withArgs(opts))
            .filter('NOT has(Post.parent)'),
        },
        {},
        userID
      )
      .call(this.runExtract(0, 'posts'));
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

  async fetchComments(
    postID: string,
    projection: Projection,
    opts: Partial<QueryOptions> = {}
  ): Promise<any> {
    return this.fetchByIDQuery(
        postID,
        {
          children: Edge.fromRaw('post', projection)
            .apply(withArgs(opts)),
        },
        opts
      )
      .call(this.runExtract(0, 'children'));
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

