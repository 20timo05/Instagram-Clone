import executeQuery from "../../../database/executeQuery";
import { faker } from "@faker-js/faker";

export default async function handler(req, res) {
  // count photos
  const userCountQuery = "SELECT COUNT(*) AS count FROM users";
  const userCountResult = await executeQuery({ query: userCountQuery });
  const userCount = userCountResult[0].count;
  
  let updateQuery =
    "UPDATE users SET profile_picture = CASE id ";

  for (let i = 1; i <= userCount; i++) {
    const imageURL = faker.image.avatar();
    updateQuery += `WHEN ${i} THEN '${imageURL}' `;
  }
  // add ending to query
  updateQuery += "END;"

  // update profile pictures
  const updateQueryResult = await executeQuery({ query: updateQuery });
  if (!updateQueryResult.ok) {
    console.log(updateQueryResult.error)
  }

  console.log("Profile Pictures Updated Successfully");
  res.status(200).json({ message: "Profile Pictures Updated Successfully" });
}
