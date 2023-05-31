import validatePassword from "../../../lib/validate/password";
import { hashPassword } from "../../../lib/auth";
import requireAuth from "../auth/requireAuth";
import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "This method requires PATCH!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { newPassword } = req.body;

  // validate password
  const [valid, passwordErrors] = validatePassword(newPassword);

  if (!valid)
    return res.status(403).json({
      error: "Password does not meet constraints!",
      errorMessages: passwordErrors,
    });

  // hash password
  const hashedPassword = await hashPassword(newPassword);

  const updatePasswordQuery = `
    UPDATE users
    SET password = ?
    WHERE username = ?
  `;

  const result = await executeQuery({
    query: updatePasswordQuery,
    values: [hashedPassword, username],
  });

  if (result.error)
    return res
      .status(500)
      .json({ error: "An Error occured while changing password!" });

  if (result.length === 0)
    return res
      .status(404)
      .json({ error: `Not User found for username: ${username}` });

  return res.status(200).json({ message: "Password changed!" });
}
