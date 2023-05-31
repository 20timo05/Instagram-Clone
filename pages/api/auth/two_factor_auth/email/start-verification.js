import nodemailer from "nodemailer";
import createVerificationCode from "../../../../../lib/verificationCode/createVerificationCode";
import executeQuery from "../../../../../database/executeQuery"

let transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const options = (email, verificationCode, username = "") => ({
  from: `Instagram <${process.env.EMAIL_ADDRESS}>`,
  to: `${username} <${email}>`,
  subject: `${verificationCode} is your secret code`,
  text: `Hi, 

  Someone tried to sign up for an Instagram account with ${email}. If it was you, enter this confirmation code in the app: 
  
  ${verificationCode} 
  `,
  html: emailHTML(email, verificationCode), // html body
  attachments: [
    {
      filename: "logo.png",
      path: `${process.cwd()}/public/logo.png`,
      cid: "logo",
    },
  ],
});

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const { email, username } = req.body;
  const { verificationCode, hashedVerificationCode } =
    await createVerificationCode();

  console.log(verificationCode);

  const transporterOptions = options(email, verificationCode, username);
  try {
    // save code in database
    const result = await saveCode(email, hashedVerificationCode)
    if (result.error) throw new Error(result.error)

    // send code to user's email
    console.log("start sending code to email")
    const info = await transporter.sendMail(transporterOptions);
    console.log(`Sent: ${info.response}`);

    res.status(200).json({ id: info.messageId, message: "Email sent!" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

const VERIFICATIONCODE_EXPIRES= 3600000

async function saveCode(email, hashedVerificationCode) {
  const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  const expires_at = new Date(Date.now() + VERIFICATIONCODE_EXPIRES)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const query = `
    REPLACE INTO email_2FA
      (email, hashedVerificationCode, created_at, expires_at)
    VALUES (?, ?, ?, ?);
  `;

  const result = await executeQuery({
    query,
    values: [email, hashedVerificationCode, created_at, expires_at],
  });


  if (result.error) {
    console.log("Error while executing query: " + result)
    return { error: result.error };
  }

  return true;
}

function emailHTML(email, code) {
  return `
    <div
      style="
        width: 50%;
        margin-top: 3rem;
        margin-left: auto;
        margin-right: auto;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      "
    >
    <img src="cid:logo" style="height: 60px; margin-bottom: 30px;" />
      <table>
        <tr>
          <td>
            <p style="font-size: 1.3em">
              Hi, <br /><br />
              Someone tried to sign up for an Instagram account with
              <a href="mailto:${email}" target="_blank"
                >${email}</a
              >. If it was you, enter this confirmation code in the app:
            </p>
          </td>
        </tr>
        <tr>
          <td style="
            text-align: center;
            color: rgba(100, 100, 100, 1);
            font-size: 30px;
            letter-spacing: 2px;
          ">
            ${code}
          </td>
        </tr>
      </table>
    </div>
  `;
}
