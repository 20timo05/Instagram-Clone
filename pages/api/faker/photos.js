import executeQuery from "../../../database/executeQuery";
import { faker } from "@faker-js/faker";

export default async function handler(req, res) {
  // count photos
  const postsCountQuery = "SELECT id FROM posts";
  const postsCountResult = await executeQuery({ query: postsCountQuery });
  const postsCount = [...postsCountResult].length;
  
  let updateQuery =
    "INSERT INTO photos(image_url, post_id, position, alternativeText) VALUES ";

  for (let i = 0; i < postsCountResult.length; i++) {
    // calculate random amount of photos for this post
    const min = 1;
    const max = 5;
    const amount = Math.floor(Math.random() * (max - min + 1) + min);

    for (let j = 0; j < amount; j++) {
      let imageURL = faker.image.nature();
      const result = await fetch(imageURL);
      const imageUrl = result.url;
      updateQuery += `("${imageUrl}", ${postsCountResult[i].id}, ${j}, ""), `;
    }

    console.log(`Post: ${i}/${postsCount}`);
  }

  // replace last comma with semicolon
  updateQuery = updateQuery.slice(0, -2) + ";";
  console.log(updateQuery);

  res.status(200).json({ message: "Images Updated Successfully" });
}
