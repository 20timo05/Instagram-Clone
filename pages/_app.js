import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import { AuthContextProvider } from "../store/authContext";

function MyApp({ Component, pageProps }) {
  return (
      <SessionProvider session={pageProps.session}>
        <AuthContextProvider>
          <Component {...pageProps} />
        </AuthContextProvider>
      </SessionProvider>
  );
}

export default MyApp;
