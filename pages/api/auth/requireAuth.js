import { getToken } from "next-auth/jwt";

export default async function requireAuth(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session) {
    res.status(401).json({ error: "You are not authorized for this action!" });
    return null;
  }

  return session.name;
}
