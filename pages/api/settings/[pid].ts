import { Response } from 'express';
import { MyRequest } from '../../../app/abstract/request';
import { Settings } from '../../../app/abstract/settings';
import { User } from '../../../app/abstract/user';

export const getSettings = (req: MyRequest): Settings | null => {
  const settings = req.db.settings.findOne();
  if (!settings) return null;

  const { _id, ...data } = settings;
  return {
    id: _id,
    ...data,
  } as Settings;
};

export const updateSettings = (req: MyRequest, pid: string): Settings | null => {
  const { _id, ...data } = req.body;

  const updated = req.db.settings.update({ _id: pid }, { $set: data });
  if (!updated) return null;

  const { _id: id, ...rest } = updated;
  return {
    id,
    ...rest,
  } as Settings;
};

const handler = async (req: MyRequest, res: Response) => {
  const {
    query: { pid },
  } = req;
  const user = req.user as User;
  if (!user?.admin) {
    res.status(401).end();
    return;
  }

  if (req.method == 'GET') {
    // GET ONE POST METHOD

    const post = getSettings(req);
    if (!post) {
      res.status(404).json({ id: null });
      return;
    }

    res.status(200).json(post);
  } else if (req.method == 'PUT') {
    const updatedPosts = updateSettings(req, pid as string);

    res.status(200).json(updatedPosts);
  }
};

export default handler;
