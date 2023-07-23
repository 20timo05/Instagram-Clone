import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { useRouter } from "next/router";

import { AuthContextProvider } from "../store/authContext";
import Notifications from "../components/Chat/Notifications";
import useWindowSize from "../hooks/useWindowSize";

function MyApp({ Component, pageProps }) {
  const { pathname } = useRouter();
  const { width } = useWindowSize();
  const { currentLoggedInUser } = pageProps
  return (
    <SessionProvider session={pageProps.session}>
      <AuthContextProvider>
        <Component {...pageProps} />
        {pathname !== "/inbox" && width > 550 && currentLoggedInUser && (
          <Notifications currentLoggedInUser={currentLoggedInUser} />
        )}
      </AuthContextProvider>
    </SessionProvider>
  );
}

export default MyApp;
