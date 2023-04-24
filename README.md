This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## What is this project about?

This project represents an Instagram-Clone, which I am currently developing. It started of as a small project, but turned into a larger project. This application is not a barebone working Social Media-Clone, as it has many features:

- Authentication (implemented with [Next-Auth](https://next-auth.js.org/)) with Credentials, [Google](https://www.google.com), and [Facebook](https://www.facebook.com), two-factor authentication using email and SMS (with [Everify](https://everify.dev/blog/two-factor-authentication-for-nextjs), currently in sandbox mode)
  - I know two-factor authentication is not the most secure option, but sufficient enough for the purposes of this application.
- Post creation with an image editor, tagging people, using hashtags, enabling/disabling likes and comments, viewing profiles from others and specific posts, liking & commenting (as well as responding), a "For You" page that recommends posts from users that you follow, and everything is responsive. The design is very similar to the real Instagram, making the experience authentic.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Since this application employs a MySQL database, creating one of your own is necessary. The query for the database is provided in `/database/newInstagramDatabase.sql`. This query not only includes the structure of the database, but also tons of fake data, necessary for development purposes, created with [Faker.js](https://fakerjs.dev/)

## Upcoming Features

This project is still a work in progress, and there are several upcoming features that will be added in the near future. Some of these features include:
* Chat functionality using Socket.io
* Video call functionality using WebRTC
* logging in with real Instagram account and showing real Instagram data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Instagram](https://www.instagram.com/) for the inspiration and design
- [Next.js](https://nextjs.org/) for making building the application easier
- [NextAuth](https://next-auth.js.org/) for providing authentication functionality
- [MySQL](https://www.mysql.com/de/) for providing database functionality
- [Faker.js](https://fakerjs.dev/) for creating fake user data & post photos

