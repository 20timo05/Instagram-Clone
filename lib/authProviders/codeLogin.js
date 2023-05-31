import Everify from "everify";
const everify = new Everify(process.env.EVERIFY_API_KEY);

import { fetchData } from "../../hooks/useFetch";

export default {
  id: "codeLogin",
  name: "codeLogin",
  async authorize({ data, method, dialCode, verificationCode }) {
    // check if user actually exists
    const isUserResponse = await fetchData(
      "GET",
      `${process.env.BASE_URL}/api/lib/checkUser`,
      {
        data,
        method,
        dialCode,
      }
    );

    if (!isUserResponse.ok) throw new Error(isUserResponse.error);
    if (!isUserResponse.data.exists) throw new Error("No user found!");

    // check verification Code
    if (method === "email") {
      const response = await fetchData("POST",
        `${process.env.BASE_URL}/api/auth/two_factor_auth/email/checkVerification`,
        { email: data, verificationCode }
      );

      if (!response.ok) throw new Error(response.error);
    } else {
      const { status } = await everify.checkVerification({
        phoneNumber: `${dialCode}${data}`,
        code: verificationCode,
      });

      if (status !== "SUCCESS") throw new Error("Verification Code invalid!");
    }

    return { data, method, dialCode };
  },
};
