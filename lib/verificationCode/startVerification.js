import { fetchData } from "../../hooks/useFetch";

export default async function startVerification(props) {
  const { username, email, phoneNumber, dialCode } = props;
  const isEmail = !!email && email !== "undefined";

  if (isEmail) {
    // email
    const startVerificationResponse = await fetchData(
      "POST",
      "/api/auth/two_factor_auth/email/start-verification",
      {
        username: username,
        email: email,
      }
    );

    if (!startVerificationResponse.ok)
      return console.log(startVerificationResponse.error);
  } else {
    // phone number
    const startVerificationResponse = await fetchData(
      "POST",
      "/api/auth/two_factor_auth/phoneNumber/start-verification",
      { phoneNumber: `${dialCode}${phoneNumber}` }
    );

    if (!startVerificationResponse.ok)
      return console.log(startVerificationResponse.error);
  }
}
