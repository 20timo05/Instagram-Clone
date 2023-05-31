import Everify from "everify";

import { fetchData } from "../../hooks/useFetch";

const everify = new Everify(process.env.EVERIFY_API_KEY);

async function checkAlreadyExists(data, method, dialCode) {
  // check if user already exists
  const alreadyExistsResponse = await fetchData(
    "GET",
    `${process.env.BASE_URL}/api/lib/checkUser`,
    {
      data,
      method,
      dialCode,
    }
  );
  if (!alreadyExistsResponse.ok) throw new Error(alreadyExistsResponse.error);

  return alreadyExistsResponse.data.exists;
}

export default {
  id: "credentialsSignup",
  name: "credentialsSignup",
  async authorize(userObj) {
    const { username, email, phoneNumber, dialCode, verificationCode } =
      userObj;

    // check if user already exists
    const usernameAlreadyExists = await checkAlreadyExists(
      username,
      "username"
    );
    if (usernameAlreadyExists) throw new Error("Username is already taken");

    const emailAlreadyExists = await checkAlreadyExists(email, "email");
    if (emailAlreadyExists) throw new Error("Email is already taken!");

    const phoneNumberAlreadyExists = await checkAlreadyExists(
      phoneNumber,
      "phoneNumber",
      dialCode
    );
    if (phoneNumberAlreadyExists)
      throw new Error("PhoneNumber is already taken!");

    // -----------------------------------------------------------------------------------
    // check verification Code
    if (email && email !== "undefined") {
      const response = await fetchData(
        "POST",
        `${process.env.BASE_URL}/api/auth/two_factor_auth/email/checkVerification`,
        { email, verificationCode }
      );
      console.log(response)

      if (!response.ok) throw new Error(response.error);
    } else {
      console.log("check verification Code");
      const { status } = await everify.checkVerification({
        phoneNumber: `${dialCode}${phoneNumber}`,
        code: verificationCode,
      });

      if (status !== "SUCCESS") throw new Error("Verification Code invalid!");
    }

    // -----------------------------------------------------------------------------------
    // create the User
    const signupResponse = await fetchData(
      "POST",
      `${process.env.BASE_URL}/api/auth/signup`,
      userObj
    );

    if (!signupResponse.ok) {
      console.log(signupResponse.error);
      throw new Error(signupResponse.error || "Something went wrong");
    }

    return { data: username, method: "username" };
  },
};
