import { Store } from 'express-session';
import Database from 'better-sqlite3';

export class BetterSQLiteStore extends Store {
  private db: Database.Database;

  constructor(options: { db: Database.Database }) {
    super();
    this.db = options.db;

    // Create sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expired INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
    `);

    // Clean up expired sessions every hour
    setInterval(() => {
      const now = Date.now();
      this.db.prepare('DELETE FROM sessions WHERE expired < ?').run(now);
    }, 3600000);
  }

  get(sid: string, callback: (err?: any, session?: any) => void): void {
    try {
      const row = this.db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expired > ?')
        .get(sid, Date.now()) as { sess: string } | undefined;

      if (row) {
        callback(null, JSON.parse(row.sess));
      } else {
        callback();
      }
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, session: any, callback?: (err?: any) => void): void {
    try {
      const maxAge = session.cookie?.maxAge || 86400000; // 1 day default
      const expired = Date.now() + maxAge;
      const sess = JSON.stringify(session);

      this.db.prepare(`
        INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess = ?, expired = ?
      `).run(sid, sess, expired, sess, expired);

      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  touch(sid: string, session: any, callback?: (err?: any) => void): void {
    try {
      const maxAge = session.cookie?.maxAge || 86400000;
      const expired = Date.now() + maxAge;

      this.db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?')
        .run(expired, sid);

      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}
