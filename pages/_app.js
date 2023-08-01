import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react"

import { AuthContextProvider } from "../store/authContext";
import Notifications from "../components/Chat/Notifications";
import useWindowSize from "../hooks/useWindowSize";
import { fetchData } from "../hooks/useFetch";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { width } = useWindowSize();
  const { currentLoggedInUser } = pageProps
  const alreadySentOnlineNotif = useRef(false)

  // send online notification to other users (that currentloggedinuser has a chat with)
  useEffect(() => {
    if (!alreadySentOnlineNotif.current) {
      fetchData("POST", "/api/inbox/pusherOnlineNotif", { isOnline: true })
      alreadySentOnlineNotif.current = true
    }

    const handleUserOffline = () => fetchData("POST", "/api/inbox/pusherOnlineNotif", { isOnline: false })
    window.addEventListener("beforeunload", handleUserOffline)
    return () => {
      window.removeEventListener("beforeunload", handleUserOffline)
    }
  })

  return (
    <SessionProvider session={pageProps.session}>
      <AuthContextProvider>
        <Component {...pageProps} />
        {router.pathname !== "/inbox" && width > 550 && currentLoggedInUser && (
          <Notifications currentLoggedInUser={currentLoggedInUser} />
        )}
      </AuthContextProvider>
    </SessionProvider>
  );
}

export default MyApp;
