import Head from "next/head";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import Header from "../components/Header/index";
import InboxPage from "../components/Chat/InboxPage";

import { getData as getUser } from "./api/user/getUser";
import { getData as getChats } from "./api/inbox/getChats";

export default function Home({ currentLoggedInUser, chatsData }) {
  return (
    <>
      <Head>
        <title>Inbox</title>
      </Head>
      <Header currentLoggedInUser={currentLoggedInUser} active="inbox" />
      <InboxPage currentLoggedInUser={currentLoggedInUser} data={chatsData} />
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const currentLoggedInUser = session?.user?.name;

  // get the id from the currently logged in user
  const [currentLoggedInUserError, currentLoggedInUserData] = await getUser(
    currentLoggedInUser
  );
  if (currentLoggedInUserError) {
    console.log(currentLoggedInUserData);
    return { redirect: { destination: "/auth/login/" } };
  }

  const [chatsError, chatsData] = await getChats(currentLoggedInUserData.id);

  return {
    props: {
      chatsData,
      currentLoggedInUser: {
        id: currentLoggedInUserData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
