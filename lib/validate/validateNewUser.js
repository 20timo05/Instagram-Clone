import { fetchData } from "../../hooks/useFetch";
import validateEmail from "./email";
import validatePassword from "./password";
import validatePhoneNumber from "./phoneNumber";

import phoneNumberDialCodes from "../phoneNumberDialCodes";
import getAge from "../getAge";
const BASE_URL_DEV = "http://localhost:3000";

const USERNAME_BLACKLIST = ["comments", "createPost", "explore", "recommendations"]

export default async function validateNewUser(user) {
  const { username, password, name, email, dialCode, phoneNumber, birthday } =
    user;

  let errors = {};

  // validate username
  let usernameLengthValid = false;
  let usernameBlackListValid = false
  let usernameAlreadyExists = false;
  if (username) {
    // check if username format is valid
    usernameLengthValid = username.length >= 7;

    if (usernameLengthValid) {
      // check if username is allowed
      usernameBlackListValid = !USERNAME_BLACKLIST.includes(username) && !username.startsWith("#")
      
      if (usernameBlackListValid) {
        // check if username already exists
        const checkUsernameResponse = await fetchData(
          "GET",
          `${BASE_URL_DEV}/api/lib/checkUser`,
          {
            data: username,
            method: "username",
          }
        );
  
        usernameAlreadyExists = checkUsernameResponse.data.exists;
        if (usernameAlreadyExists) errors.username = "Username already exists!";
      } else {
        errors.username = "This Username is not allowed!"
      }
    } else {
      errors.username = "Username must be at least 7 characters!";
    }
  }
  const usernameValid = usernameLengthValid && usernameBlackListValid && !usernameAlreadyExists;

  // validate email
  let emailValid = false;
  let emailAlreadyExists = false;

  if (email) {
    // check if email format is valid
    emailValid = validateEmail(email);
    // check if address already exists
    if (emailValid) {
      const checkEmailResponse = await fetchData(
        "GET",
        `${BASE_URL_DEV}/api/lib/checkUser`,
        {
          data: email,
          method: "email",
        }
      );

      emailAlreadyExists = checkEmailResponse.data.exists;
      if (emailAlreadyExists) errors.email = "Email already exists!";
    } else {
      errors.email = "Email is not valid!";
    }
  }

  // validate phone number
  let phoneNumberValid = false;
  let phoneNumberAlreadyExists = false;

  if (phoneNumber && dialCode) {
    // check if phone number format is valid
    const countryCode = phoneNumberDialCodes.find(
      (item) => item.dial_code === dialCode
    )?.code;
    phoneNumberValid = validatePhoneNumber(phoneNumber, countryCode);

    // check if phone number already exists
    if (phoneNumberValid) {
      const checkPhoneNumberResponse = await fetchData(
        "GET",
        `${BASE_URL_DEV}/api/lib/checkUser`,
        {
          data: { dialCode, phoneNumber },
          method: "phoneNumber",
        }
      );

      phoneNumberAlreadyExists = checkPhoneNumberResponse.data.exists;
      if (phoneNumberAlreadyExists)
        errors.phoneNumber = "Phone Number already exists!";
    } else {
      errors.phoneNumber = "Phone Number is not valid!";
    }
  }

  // validate password
  let passwordValid = false;
  if (password) {
    // check if password format is valid
    const [valid, passwordErrors] = validatePassword(password);
    passwordValid = valid;
    if (!valid) errors.password = passwordErrors.toString();
  }

  // validate name
  let nameValid = false;
  if (name) {
    // check if name is valid
    nameValid = name.length > 1;
    if (!nameValid) errors.name = "No Name provided!";
  }

  // validate birthday
  let birthdayValid = false;
  if (birthday) {
    // check if birthday is old enough
    // birthday format: [_month, _day, _year]
    const MIN_AGE = 5;
    const age = getAge(...birthday);
    birthdayValid = age >= MIN_AGE;
    if (!birthdayValid) errors.birthday = "You are too young to use Instagram!";
  }

  const valid =
    usernameValid &&
    (emailValid || phoneNumberValid) &&
    passwordValid &&
    nameValid &&
    birthdayValid;

  return { valid, errors };
}
