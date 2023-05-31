import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import credentialsSignup from "../../../lib/authProviders/credentialsSignup";
import credentialsLogin from "../../../lib/authProviders/credentialsLogin";
import codeLogin from "../../../lib/authProviders/codeLogin";

import { fetchData } from "../../../hooks/useFetch";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn(props) {
      let response;
      if (
        props.account.provider === "google" ||
        props.account.provider === "facebook"
      ) {
        response = await fetchData(
          "GET",
          `${process.env.BASE_URL}/api/lib/checkUser`,
          {
            data: props.user.email,
            method: "email",
          }
        );
      } else {
        // check if user actually exists
        response = await fetchData(
          "GET",
          `${process.env.BASE_URL}/api/lib/checkUser`,
          {
            data: props.user.data,
            method: props.user.method,
            dialCode: props.user.dialCode,
          }
        );
      }
      const { exists, result } = response.data;
      props.user.name = result[0].username;
      return exists;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider(credentialsSignup),
    CredentialsProvider(credentialsLogin),
    CredentialsProvider(codeLogin),
  ],
});
