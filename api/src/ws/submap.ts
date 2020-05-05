import { TypedEmitter } from 'tiny-typed-emitter';
import { injectable } from 'tsyringe';

function addToMapSet<K, V>(
  map: Map<K, Set<V>>,
  key: K,
  val: V
) {
  let set = map.get(key);
  if (!set) map.set(key, (set = new Set()));
  set.add(val);
}

export interface SubMapEvents<T> {
  'add_sub': (sub: string, o: T) => void;
  'delete_sub': (sub: string) => void;
}

@injectable()
export class SubMap<T> extends TypedEmitter<SubMapEvents<T>> {
  private subToWs = new Map<string, Set<T>>();
  private wsToSubs = new Map<T, Set<string>>();

  getWsList(sub: string) {
    return Array.from(this.subToWs.get(sub) || []);
  }

  /**
   * @returns if sub was new
   */
  add(ws: T, sub: string) {
    const hadSub = this.subToWs.has(sub);
    addToMapSet(this.subToWs, sub, ws);
    addToMapSet(this.wsToSubs, ws, sub);
    if (hadSub) this.emit('add_sub', sub, ws);
    return !hadSub;
  }

  deleteWs(ws: T) {
    const subs = Array.from(this.wsToSubs.get(ws) || []);

    subs.forEach(sub => {
      const wsList = this.subToWs.get(sub) || new Set();
      if (wsList.has(ws) && wsList.size === 1) {
        this.subToWs.delete(sub);
        this.emit('delete_sub', sub);
      }
      wsList.delete(ws);
    });
    this.wsToSubs.delete(ws);
  }
}
