import * as bcrypt from 'bcrypt';

export class Hashing {
  static async hash(str: string) {
    return bcrypt.hash(str, await bcrypt.genSalt(8));
  }

  static async compare(hash: string, str: string) {
    return bcrypt.compare(str, hash);
  }
}
