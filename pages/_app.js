import { StrictMode } from "react";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import { AuthContextProvider } from "../store/authContext";

function MyApp({ Component, pageProps }) {
  return (
    <StrictMode>
      <SessionProvider session={pageProps.session}>
        <AuthContextProvider>
          <Component {...pageProps} />
        </AuthContextProvider>
      </SessionProvider>
    </StrictMode>
  );
}

export default MyApp;
