import Database from 'better-sqlite3';
import { DatabasePost } from '../abstract/post';
import { Settings } from '../abstract/settings';
import { DatabaseUser } from '../abstract/user';

const db = new Database('database/app.db');
db.pragma('journal_mode = WAL');

export { db as dbConnection };

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    _id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    content_ru TEXT,
    content_en TEXT,
    date INTEGER NOT NULL,
    thumbnail TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    _id TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    _id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    admin INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
  CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);

// Posts
export const postsDb = {
  findOne: (query: { _id?: string; slug?: string }) => {
    if (query._id) {
      const row = db.prepare('SELECT * FROM posts WHERE _id = ?').get(query._id) as any;
      if (!row) return null;
      return {
        _id: row._id,
        slug: row.slug,
        title: { 'ru-RU': row.title_ru, 'en-US': row.title_en },
        description: { 'ru-RU': row.description_ru, 'en-US': row.description_en },
        content: { 'ru-RU': row.content_ru, 'en-US': row.content_en },
        date: row.date,
        thumbnail: row.thumbnail,
      } as DatabasePost;
    }
    if (query.slug) {
      const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(query.slug) as any;
      if (!row) return null;
      return {
        _id: row._id,
        slug: row.slug,
        title: { 'ru-RU': row.title_ru, 'en-US': row.title_en },
        description: { 'ru-RU': row.description_ru, 'en-US': row.description_en },
        content: { 'ru-RU': row.content_ru, 'en-US': row.content_en },
        date: row.date,
        thumbnail: row.thumbnail,
      } as DatabasePost;
    }
    const row = db.prepare('SELECT * FROM posts LIMIT 1').get() as any;
    if (!row) return null;
    return {
      _id: row._id,
      slug: row.slug,
      title: { 'ru-RU': row.title_ru, 'en-US': row.title_en },
      description: { 'ru-RU': row.description_ru, 'en-US': row.description_en },
      content: { 'ru-RU': row.content_ru, 'en-US': row.content_en },
      date: row.date,
      thumbnail: row.thumbnail,
    } as DatabasePost;
  },

  find: (options: { sort?: Record<string, number>; skip?: number; limit?: number } = {}) => {
    let query = 'SELECT * FROM posts';
    const params: any[] = [];

    if (options.sort) {
      const sortKey = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortKey] === -1 ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortKey} ${sortOrder}`;
    }

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.skip) {
      query += ' OFFSET ?';
      params.push(options.skip);
    }

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => ({
      _id: row._id,
      slug: row.slug,
      title: { 'ru-RU': row.title_ru, 'en-US': row.title_en },
      description: { 'ru-RU': row.description_ru, 'en-US': row.description_en },
      content: { 'ru-RU': row.content_ru, 'en-US': row.content_en },
      date: row.date,
      thumbnail: row.thumbnail,
    })) as DatabasePost[];
  },

  count: () => {
    const result = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
    return result.count;
  },

  insert: (post: DatabasePost) => {
    const id = post._id || generateId();
    db.prepare(`
      INSERT INTO posts (_id, slug, title_ru, title_en, description_ru, description_en, content_ru, content_en, date, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      post.slug,
      post.title['ru-RU'],
      post.title['en-US'],
      post.description?.['ru-RU'] || '',
      post.description?.['en-US'] || '',
      post.content?.['ru-RU'] || '',
      post.content?.['en-US'] || '',
      post.date,
      post.thumbnail || null
    );
    return { ...post, _id: id };
  },

  update: (query: { _id: string }, update: { $set: Partial<DatabasePost> }) => {
    const post = postsDb.findOne(query);
    if (!post) return null;

    const updated = { ...post, ...update.$set };
    db.prepare(`
      UPDATE posts
      SET slug = ?, title_ru = ?, title_en = ?, description_ru = ?, description_en = ?,
          content_ru = ?, content_en = ?, date = ?, thumbnail = ?
      WHERE _id = ?
    `).run(
      updated.slug,
      updated.title['ru-RU'],
      updated.title['en-US'],
      updated.description?.['ru-RU'] || '',
      updated.description?.['en-US'] || '',
      updated.content?.['ru-RU'] || '',
      updated.content?.['en-US'] || '',
      updated.date,
      updated.thumbnail || null,
      query._id
    );
    return updated;
  },

  remove: (query: { _id: string }) => {
    const result = db.prepare('DELETE FROM posts WHERE _id = ?').run(query._id);
    return result.changes;
  },
};

// Settings
export const settingsDb = {
  findOne: () => {
    const row = db.prepare('SELECT * FROM settings LIMIT 1').get() as any;
    if (!row) return null;
    const data = JSON.parse(row.data);
    return { _id: row._id, ...data } as Settings;
  },

  insert: (settings: Settings) => {
    const id = generateId();
    const { _id, ...data } = settings;
    db.prepare('INSERT INTO settings (_id, data) VALUES (?, ?)').run(id, JSON.stringify(data));
    return { _id: id, ...data };
  },

  update: (query: { _id: string }, update: { $set: Partial<Settings> }) => {
    const current = settingsDb.findOne();
    if (!current) return null;

    const updated = { ...current, ...update.$set };
    const { _id, ...data } = updated;
    db.prepare('UPDATE settings SET data = ? WHERE _id = ?').run(JSON.stringify(data), query._id);
    return updated;
  },
};

// Users
export const usersDb = {
  findOne: (query: { _id?: string; username?: string; password?: string }) => {
    if (query._id) {
      const row = db.prepare('SELECT * FROM users WHERE _id = ?').get(query._id) as any;
      if (!row) return null;
      return {
        _id: row._id,
        username: row.username,
        password: row.password,
        admin: row.admin === 1,
      } as DatabaseUser;
    }
    if (query.username && query.password) {
      const row = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(query.username, query.password) as any;
      if (!row) return null;
      return {
        _id: row._id,
        username: row.username,
        password: row.password,
        admin: row.admin === 1,
      } as DatabaseUser;
    }
    if (query.username) {
      const row = db.prepare('SELECT * FROM users WHERE username = ?').get(query.username) as any;
      if (!row) return null;
      return {
        _id: row._id,
        username: row.username,
        password: row.password,
        admin: row.admin === 1,
      } as DatabaseUser;
    }
    return null;
  },

  insert: (user: DatabaseUser) => {
    const id = generateId();
    db.prepare('INSERT INTO users (_id, username, password, admin) VALUES (?, ?, ?, ?)').run(
      id,
      user.username,
      user.password,
      user.admin ? 1 : 0
    );
    return { ...user, _id: id };
  },
};

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default db;
