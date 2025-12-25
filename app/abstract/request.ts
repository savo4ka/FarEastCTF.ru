import { IncomingMessage } from 'http';
import { Request } from 'express';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { PassportStatic } from 'passport';
import { postsDb, settingsDb, usersDb } from '../server/database';

type MyRequest = Request & IncomingMessage & {
  cookies: NextApiRequestCookies;
} & {
  db: {
    posts: typeof postsDb
    settings: typeof settingsDb
    users: typeof usersDb
  },
  passport: PassportStatic,
}

export type { MyRequest };
