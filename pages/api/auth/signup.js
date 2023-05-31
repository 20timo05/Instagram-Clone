import executeQuery from "../../../database/executeQuery";

import validateNewUser from "../../../lib/validate/validateNewUser";
import { hashPassword } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });
  
  const user = req.body;
  // validate data
  const { valid, errors } = await validateNewUser(user);
  
  if (!valid) {
    return res.status(422).json({ errors });
  }
  // hash password
  const hashedPassword = await hashPassword(user.password);

  // create sql timestamp from birthday
  const convertedBirthday = new Date(...JSON.parse(`[${user.birthday}]`))
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // insert user to database
  const query = `
    INSERT INTO users (
      username,
      password,
      email,
      dialCode,
      phoneNumber,
      full_name,
      birthday
    )
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  
  const result = await executeQuery({
    query,
    values: [
      user.username,
      hashedPassword,
      user.email !== "undefined" ? user.email : null,
      user.dialCode !== "undefined" ? user.dialCode : null,
      user.phoneNumber !== "undefined" ? user.phoneNumber : null,
      user.name,
      convertedBirthday,
    ],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while creating the user!" });
    return;
  }

  res.status(200).json({ message: "Created user!" });
}
