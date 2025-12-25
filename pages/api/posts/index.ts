import { Response } from 'express';
import { Post } from '../../../app/abstract/post';
import { MyRequest } from '../../../app/abstract/request';
import { User } from '../../../app/abstract/user';

export const getPosts = (req: MyRequest, q?: Record<string, any>): Post[] => {
  const {
    _sort = 'date',
    _order = 'DESC',
    _start = '0',
    _end = '10',
  } = {
    ...req.query,
    ...q,
  };

  const sortObj = { [_sort as string]: _order == 'DESC' ? -1 : 1 };
  const skip = parseInt(_start as string, 10);
  const limit = parseInt(_end as string, 10);

  const posts = req.db.posts.find({
    sort: sortObj,
    skip,
    limit: limit > 0 ? limit : undefined,
  });

  return posts.map((post) => {
    const { _id, ...data } = post;
    return {
      id: _id,
      ...data,
    };
  });
};

export const countPosts = (req: MyRequest): number => {
  return req.db.posts.count();
};

export const createPost = (req: MyRequest): Post => {
  const { _id, ...data } = req.body;
  const currentDate = new Date().getTime();

  const post = req.db.posts.insert({ ...data, date: currentDate } as any);
  const { _id: id, ...rest } = post;

  return {
    id,
    ...rest,
  };
};

const handler = async (req: MyRequest, res: Response) => {
  const user = req.user as User;

  if (req.method == 'GET') {
    // GET MANY POSTS METHOD

    const posts = getPosts(req);

    res.setHeader('X-Total-Count', countPosts(req));
    res.status(200).json(posts);
  } else if (req.method == 'POST') {
    if (!user?.admin) res.status(401).end();
    // CREATE ONE POST METHOD

    const post = createPost(req);

    res.status(200).json(post);
  }
};

export default handler;
