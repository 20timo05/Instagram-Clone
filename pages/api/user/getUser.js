import executeQuery from "../../../database/executeQuery";

export async function getData(username) {
  const query = `
  SELECT * FROM users
  WHERE username = ?
  `;
  const result = await executeQuery({ query, values: [username] });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  const user = result[0];
  if (user) {
    delete user.password;
    return [false, user];
  } else {
    console.log(username);
    return [true, { code: 404, err: "User not found" }];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { username } = req.query;
  const [error, data] = await getData(username);

  if (error) return res.status(data.code).json({ err: data.err });
  res.status(200).json(data);
}
