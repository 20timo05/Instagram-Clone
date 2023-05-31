import { verifyPassword } from "../auth";

import { fetchData } from "../../hooks/useFetch";

export default {
  id: "credentialsLogin",
  name: "credentialsLogin",
  async authorize({ data, method, password, dialCode }) {
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

    // verify Password
    const isValid = await verifyPassword(password, isUserResponse.data.result[0].password);

    if (!isValid) throw new Error("Invalid password!");

    return { data, method, dialCode };
  },
};
