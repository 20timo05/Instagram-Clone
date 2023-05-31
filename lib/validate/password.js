/*
  - min 8 letters
  - min 1 symbol
  - min 1 upper & lower case letter
  - min 1 number
*/
export default function checkPassword(str) {
  let valid = true;
  let errors = [];

  if (str.length < 8) {
    valid = false;
    errors.push("Password must be at least 8 characters long!");
  }

  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (!specialChars.test(str)) {
    valid = false;
    errors.push("Password must contain at least one special character!");
  }

  if (str.toLowerCase() === str) {
    valid = false;
    errors.push("Password must contain at least one uppercase letter!");
  }

  if (str.toUpperCase() === str) {
    valid = false;
    errors.push("Password must contain at least one lowercase letter!");
  }

  const numbers = /\d/
  if (!numbers.test(str)) {
    valid = false;
    errors.push("Password must contain at least one number!");
  }

  return [valid, errors]
}
