import { IPost } from '@core/models';

export * from './auth.interceptor.service';

export function mergePosts(list1: IPost[], list2: IPost[] = []) {
  return Array.from(
    new Map(
      list1.concat(list2).map(x => [x.id, x])
    ).values()
  ).sort((a: any, b: any) => b.created - a.created);
}
