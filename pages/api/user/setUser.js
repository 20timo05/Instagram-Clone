import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "PUT")
    return res.status(405).json({ error: "This method requires PUT!" });

  const name = await requireAuth(req, res);
  if (!name) return;

  const { full_name, username, email, description, phoneNumber, dialCode } =
    req.body;

  if (!email && !phoneNumber)
    return res
      .status(422)
      .json({ error: "Please enter E-Mail and/ or PhoneNumber" });

  const query = `
    UPDATE users
    SET
      full_name = ?,
      username = ?,
      description = ?,
      email = ?,
      dialCode = ?,
      phoneNumber = ?
    WHERE username = ?;
    `;
  const result = await executeQuery({
    query,
    values: [
      full_name,
      username,
      description,
      email,
      dialCode,
      phoneNumber,
      name,
    ],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }

  if (username !== name) {
    // signout
    res.status(200).json({ todo: "logout" });
  } else {
    res.status(200).json({ message: `User updated!` });
  }
}
