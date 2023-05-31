import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { data, method, dialCode = "" } = req.query;
  let query;
  if (method === "username") {
    query = `
    SELECT
      *
    FROM users
    WHERE username = ?
  `;
  } else if (method === "email") {
    query = `
    SELECT
      *
    FROM users
    WHERE email = ?
  `;
  } else if (method === "phoneNumber") {
    query = `
      SELECT
        *
      FROM users
      WHERE dialCode = ?
      AND phoneNumber = ?
    `;
  }
  
  let result;
  if (method === "phoneNumber") {
    result = await executeQuery({
      query,
      values: [dialCode, data],
    });
  } else {
    result = await executeQuery({ query, values: [data] });
  }
  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }
  const exists = result.length > 0;
  res.status(200).json({ exists, result });
}
