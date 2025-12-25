import crypto from 'crypto';
import { postsDb, settingsDb, usersDb } from './database';

export function generate(
  { defaultUserPassword, secret }: { defaultUserPassword: string; secret: string },
): void {
  const existingSettings = settingsDb.findOne();

  if (!existingSettings) {
    settingsDb.insert({
      site: {
        title: { 'ru-RU': 'FarEastCTF', 'en-US': 'FarEastCTF' },
        description: { 'ru-RU': 'FarEastCTF', 'en-US': 'FarEastCTF' },
        url: process.env.NODE_HOST ?? 'http://localhost:3000',
        icon: '/icon.svg',
      },
      posts: {
        postsPerPage: 10,
      },
      about: {
        landingImage: {
          image: '/photos/image_9.png',
        },
        images: [
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_6.png' },
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_7.png' },
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_8.png' },
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_9.png' },
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_10.png' },
          { title: { 'ru-RU': 'ФОтография', 'en-US': 'Photo' }, image: '/photos/image_11.png' },
        ],
      },
      email: 'mail@fareastctf.ru',
      navigationLinks: [
        { title: { 'ru-RU': 'Главная', 'en-US': 'Home' }, url: '/' },
        { title: { 'ru-RU': 'О нас', 'en-US': 'About' }, url: '/about' },
        { title: { 'ru-RU': 'Спонсоры', 'en-US': 'Sponsors' }, url: '/sponsors' },
        { title: { 'ru-RU': 'Новости', 'en-US': 'News' }, url: '/posts' },
      ],
      slides: [{ id: 'p3dQtEBLjoGxzXGR' }, { id: 'K7WgVL5eaxsnBQIl' }],
      socials: [
        {
          title: { 'ru-RU': 'Телеграм', 'en-US': 'Telegram' },
          url: 'https://t.me/FarEastCTF',
        },
        {
          title: { 'ru-RU': 'ВКонтакте', 'en-US': 'VKontakte' },
          url: 'https://vk.com/fareastctf',
        },
        {
          title: { 'ru-RU': 'Инстаграм', 'en-US': 'Instagram' },
          url: 'https://www.instagram.com/fareastctf/',
        },
      ],
      sponsors: {
        list: [
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_1.png',
            main: true,
            url: '/',
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_2.png',
            url: '/',
            main: true,
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_3.png',
            url: '/',
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_4.png',
            url: '/',
            main: true,
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_5.png',
            url: '/',
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_6.png',
            url: '/',
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_7.png',
            url: '/',
          },
          {
            title: { 'ru-RU': 'Спонсор', 'en-US': 'Sponsor' },
            image: '/sponsors/sponsor_8.png',
            url: '/',
          },
        ],
        mainImage: {
          image: '/sponsors/rostelecom_main.png',
          url: '/',
        },
        landingImage: {
          image: '/sponsors/Rostelekom_2.jpg',
        },
      },
    } as any);
  }

  const existingPost = postsDb.findOne({});

  if (!existingPost) {
    postsDb.insert({
      _id: 'p3dQtEBLjoGxzXGR',
      slug: 'hello',
      title: {
        'ru-RU': 'Привет',
        'en-US': 'Hello',
      },
      description: { 'ru-RU': 'Описание', 'en-US': 'Description' },
      content: { 'en-US': '<p>awdawdawd</p>', 'ru-RU': '<p>фцвцфвфцвфц</p>' },
      date: 1766068064638,
      thumbnail: '/photos/image_8.png',
    } as any);

    postsDb.insert({
      slug: 'another_one',
      title: { 'ru-RU': 'Второй пост', 'en-US': 'Second Post' },
      description: { 'ru-RU': 'Описание поста', 'en-US': 'Desc of second post' },
      content: { 'ru-RU': '<p>Текст</p>', 'en-US': '<p>body bruh</p>' },
      thumbnail: '/photos/image_6.png',
      date: 1766068436896,
      _id: 'K7WgVL5eaxsnBQIl',
    } as any);
  }

  const existingUser = usersDb.findOne({ username: 'admin' });

  if (!existingUser) {
    const password = crypto.createHmac('sha256', secret).update(defaultUserPassword, 'utf-8').digest('hex');

    usersDb.insert({
      admin: true,
      username: 'admin',
      password,
    } as any);
  }
}
