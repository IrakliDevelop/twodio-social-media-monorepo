import { injectable } from 'tsyringe';
import { DgraphClient, Mutation, Request as DgraphRequest } from 'dgraph-js';
import * as R from 'ramda';
import { RequireOnly, User, Post } from '../types';
import {
  ProjectionType,
  Query,
  setVarsForRequest,
  extractPath,
} from './utils';

interface CreatePostArg extends Omit<Post, 'id' | 'user'> {
  user: RequireOnly<User, 'id'>;
}
type UpdatePostArg = RequireOnly<Omit<Post, 'user'>, 'id'>;

@injectable()
export class PostModel {

  constructor(
    private client: DgraphClient
  ) { }

  async fetchByID(id: string, projection: ProjectionType, queryName = 'q') {
    const query = new Query('post', queryName)
      .func('eq(Post.uid, $id)')
      .project(projection)
      .vars({ id: ['string', id] });

    return this.client
      .newTxn()
      .queryWithVars(query.toString(), query.queryVarsObj)
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
        'Post.user': { uid: userID },
      },
    });

    request.addMutations(mu);
    request.setCommitNow(true);

    const txn = this.client.newTxn();

    const result = await txn.doRequest(request);

    return !!R.path(['q', 0, 'posts', 0, 'uid'], result.getJson());
  }
}
