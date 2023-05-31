import Head from "next/head";
import { getSession } from "next-auth/react";

import Header from "../components/Header/index";
import ShowUserListItem from "../components/little/ShowUserListItem";
import styles from "../components/createPost/createPostPage.module.css";

import { getData as getUser } from "./api/user/getUser";
import { getData as getRecommendations } from "./api/user/getRecommendations";

export default function Home({ recommendations, currentLoggedInUser }) {
  return (
    <>
      <Head>
        <title>Recommendations</title>
      </Head>
      <Header
        currentLoggedInUser={currentLoggedInUser}
        active="recommendations"
      />
      <section className={`${styles.wrapper} ${styles.recommendationsWrapper}`}>
        <header>
          <h1>Vorschläge</h1>
        </header>
        {recommendations.map((recommendation) => (
          <ShowUserListItem
            key={recommendation.id}
            {...recommendation}
            currentLoggedInUser={currentLoggedInUser}
          />
        ))}
      </section>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  const currentLoggedInUser = session?.user?.name;

  // get the id from the currently logged in user
  const [currentLoggedInUserError, currentLoggedInUserData] = await getUser(
    currentLoggedInUser
  );
  if (currentLoggedInUserError) {
    console.log(currentLoggedInUserData);
    return { redirect: { destination: "/auth/login/" } };
  }

  // fetch recommendations
  const [recommendationsError, recommendationsData] = await getRecommendations(
    currentLoggedInUserData.id
  );
  if (recommendationsError) {
    console.log(recommendationsData);
    return { redirect: { destination: "/" } };
  }
  return {
    props: {
      recommendations: recommendationsData,
      currentLoggedInUser: {
        id: currentLoggedInUserData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
