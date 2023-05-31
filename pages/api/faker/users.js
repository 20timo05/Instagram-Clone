import { faker } from "@faker-js/faker";
import phoneNumberDialCodes from "../../../lib/phoneNumberDialCodes";

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default async function handler(req, res) {
  let usersQuery =
    "INSERT INTO users(username, password, email, dialCode, phoneNumber, full_name, description, birthday, created_at) VALUES";

  for (let i = 0; i < 100; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = faker.internet.userName(firstName, lastName);
    const password = faker.random.alphaNumeric(20);
    const email = faker.internet.email(firstName, lastName);
    const dialCode =
      phoneNumberDialCodes[
        Math.floor(Math.random() * phoneNumberDialCodes.length)
      ].dial_code;
    const phoneNumber = faker.phone.phoneNumber();
    const birthday = new Date(
      faker.date.birthdate({ min: 6, max: 65, mode: "age" })
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const created_at = new Date(
      faker.date.between("2017-01-01T00:00:00.000Z", "2023-01-01T00:00:00.000Z")
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    let description = "";
    const max = randomNumber(50, 150);
    for (let i = 1; i < 10; i++) {
      const possibleNewDescription = faker.lorem.sentences(i);
      if (possibleNewDescription.length < max) {
        description = possibleNewDescription;
      }
    }
    usersQuery += `("${username}", "${password}", "${email}", "${dialCode}", "${phoneNumber}", "${firstName} ${lastName}", "${description}", "${birthday}", "${created_at}"), `;
  }

  // copy paste into phpmyadmin sql
  console.log(usersQuery);

  res.status(200).json({ hello: "world" });
}
