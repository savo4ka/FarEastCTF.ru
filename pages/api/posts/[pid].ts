import { Response } from 'express';
import { Post } from '../../../app/abstract/post';
import { MyRequest } from '../../../app/abstract/request';
import { User } from '../../../app/abstract/user';

export const getPost = (req: MyRequest, pid: string): Post | null => {
  const post = req.db.posts.findOne({ _id: pid });
  if (!post) return null;

  const { _id, ...data } = post;
  return {
    id: _id,
    ...data,
  };
};

export const getPostBySlug = (req: MyRequest, pid: string): Post | null => {
  const post = req.db.posts.findOne({ slug: pid });
  if (!post) return null;

  const { _id, ...data } = post;
  return {
    id: _id,
    ...data,
  };
};

export const deletePost = (req: MyRequest, pid: string): number => {
  return req.db.posts.remove({ _id: pid });
};

export const updatePost = (req: MyRequest, pid: string): Post | null => {
  const { _id, ...data } = req.body;

  const updated = req.db.posts.update({ _id: pid }, { $set: data });
  if (!updated) return null;

  const { _id: id, ...rest } = updated;
  return {
    id,
    ...rest,
  };
};

const handler = async (req: MyRequest, res: Response) => {
  const {
    query: { pid },
  } = req;
  const user = req.user as User;

  if (req.method == 'GET') {
    // GET ONE POST METHOD

    const post = getPost(req, pid as string);
    if (!post) {
      res.status(404).json({ id: null });
      return;
    }

    res.status(200).json(post);
  } else if (req.method == 'PUT') {
    if (!user?.admin) res.status(401).end();
    const updatedPosts = updatePost(req, pid as string);

    res.status(200).json(updatedPosts);
  } else if (req.method == 'DELETE') {
    if (!user?.admin) res.status(401).end();
    const deletedPosts = deletePost(req, pid as string);

    res.status(200).json(deletedPosts);
  }
};

export default handler;
