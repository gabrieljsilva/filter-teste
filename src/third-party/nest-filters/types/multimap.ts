export class MultiMap<Key, Value> {
  private readonly from: Map<Key, Set<Value>>;
  private readonly to: Map<Value, Key>;

  constructor() {
    this.from = new Map();
    this.to = new Map();
  }

  set(key: Key, value: Value) {
    this.deleteByValue(value);
    const set = this.from.get(key) || new Set<Value>();
    if (set.size === 0) {
      this.from.set(key, set);
    }
    set.add(value);
    this.to.set(value, key);
  }

  deleteByKey(key: Key) {
    this.from.delete(key);
    const set = this.from.get(key);
    set?.forEach((key) => this.to.delete(key));
  }

  deleteByValue(value: Value) {
    const key = this.to.get(value);
    if (key) {
      const set = this.from.get(key);
      set?.delete(value);
      const isSetEmpty = set?.size === 0;
      if (isSetEmpty) {
        this.from.delete(key);
      }
    }
    this.to.delete(value);
  }

  getValuesByKey(key: Key) {
    return Array.from(this.from.get(key) || []);
  }

  getKeyByValue(value: Value) {
    return this.to.get(value);
  }

  keys() {
    return Array.from(this.from.keys() || []);
  }

  values() {
    return Array.from(this.to.keys() || []);
  }

  getKeysByValue() {
    return this.to.entries();
  }
}
