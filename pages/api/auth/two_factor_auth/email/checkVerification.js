import executeQuery from "../../../../../database/executeQuery"
import { verifyPassword } from "../../../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const { email, verificationCode } = req.body;

  const query = `
    SELECT hashedVerificationCode, tries FROM email_2fa
    WHERE email = ?
  `;
  const result = await executeQuery({
    query,
    values: [email],
  });
  
  if (result.error) {
    console.log("Error while executing query: " + result);
    return res.status(500).json({ error: result.error });
  }

  if (result.length === 0) {
    return res.status(401).json({ error: `No code found for ${email}` });
  }

  if (result.tries >= 5) {
    return res.status(401).json({ error: "Maximum number of tries exceeded" });
  }

  // compare verification code from props with the one in the database
  const isValid = await verifyPassword(
    verificationCode,
    result[0].hashedVerificationCode
  );

  if (isValid) {
    return res.status(200).json({ message: "Verification Code is valid" });
  }

  // increase tries in the database (5 tries only)
  const increaseTriesCountQuery = `UPDATE email_2fa SET tries = ? WHERE email = ?`;
  const increaseTriesCountResult = await executeQuery({
    query: increaseTriesCountQuery,
    values: [result[0].tries + 1, email],
  });

  if (increaseTriesCountResult.error) {
    console.log("Error while executing query: " + increaseTriesCountResult);
    return res.status(500).json({ error: increaseTriesCountResult.error });
  }

  res.status(401).json({ error: "Invalid Verification Code!" });
}
