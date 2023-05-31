import { faker } from "@faker-js/faker";

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default async function handler(req, res) {
  // count users
  /* const usersCountQuery = "SELECT COUNT(*) AS count FROM users";
  const usersCountResult = await executeQuery({ query: usersCountQuery });
  const usersCount = usersCountResult[0].count */
  const usersCount = 100
  
  let postQuery = "INSERT INTO posts(user_id, created_at, caption) VALUES";

  for (let i = 1; i <= usersCount; i++) {
    const postCount = randomNumber(1, 5)
    for (let j = 0; j < postCount; j++) {
      const created_at = new Date(faker.date.between('2010-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z')).toISOString().slice(0, 19).replace('T', ' ');
      const caption = faker.lorem.paragraph()
      postQuery += `(${i}, "${created_at}", "${caption}"), `
    }
  }
  postQuery = postQuery.slice(0, -2) + ";"

  // copy paste into phpmyadmin sql
  console.log(postQuery)
 
  res.status(200).json({ hello: "world" });
}
