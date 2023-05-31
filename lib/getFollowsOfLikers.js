import shuffle from "./shuffle";

export default function getFollowsOfLikers(currentLoggedInUserFollows, likes) {
  // check if there are overlaps between likes and follows
  const overlaps_onlyUsernames = likes.filter(
    (like) =>
      !!currentLoggedInUserFollows.find((follow) => follow.username === like.username)
  );
  if (overlaps_onlyUsernames.length === 0) return undefined;

  const overlaps_withId = overlaps_onlyUsernames.map((overlap) => ({
    ...currentLoggedInUserFollows.find(
      (follow) => follow.username === overlap.username
    ),
  }));

  // get random username to be displayed
  const overlapRandomUsername =
    overlaps_withId[Math.floor(Math.random() * overlaps_onlyUsernames.length)]
      .username;

  // shuffle
  const shuffledOverlaps = shuffle(overlaps_withId);
  const overlapRandomUsers = shuffledOverlaps.slice(0, 3);

  return [overlapRandomUsers, overlapRandomUsername];
}
