import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import Header from "../components/Header/index";
import useFetch from "../hooks/useFetch";
import { wrapper as wrapperStyles } from "../components/Profile/profile.module.css";
import { link as linkStyles } from "../components/Post/postHeader.module.css";

export default function Custom404() {
  const { data: session } = useSession();

  const [data, setData, loading, error] = useFetch("GET", "/api/user/getUser", {
    notReadyYet: !session?.user?.name,
    username: session?.user?.name,
  });

  return (
    <>
      <Head>
        <title>Page Not Found</title>
      </Head>
      {!loading && data && (
        <Header
          currentLoggedInUser={{
            id: data.id,
            username: data.username,
          }}
          active="home"
        />
      )}
      <div className={wrapperStyles}>
        <h1>Diese Seite ist leider nicht verfügbar.</h1>
        <p>
          Entweder funktioniert der von dir angeklickte Link nicht oder die
          Seite wurde entfernt.{" "}
          <Link href="/">
            <span className={linkStyles}>Zurück zu Instagram</span>
          </Link>
        </p>
      </div>
    </>
  );
}
