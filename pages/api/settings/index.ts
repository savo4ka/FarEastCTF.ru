import { Response } from 'express';
import { MyRequest } from '../../../app/abstract/request';
import { Settings } from '../../../app/abstract/settings';
import { User } from '../../../app/abstract/user';

export const getSettings = (req: MyRequest): Settings[] => {
  const settings = req.db.settings.findOne();
  if (!settings) return [];

  const { _id, ...data } = settings;
  return [{
    id: _id,
    ...data,
  } as Settings];
};

const handler = async (req: MyRequest, res: Response) => {
  const user = req.user as User;
  if (!user?.admin) {
    res.status(401).end();
    return;
  }

  if (req.method == 'GET') {
    // GET MANY POSTS METHOD

    const posts = getSettings(req);

    res.setHeader('X-Total-Count', 1);
    res.status(200).json(posts);
  }
};

export default handler;
