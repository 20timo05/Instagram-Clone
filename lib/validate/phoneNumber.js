import { isValidPhoneNumber } from "libphonenumber-js";

export default function validatePhoneNumber(number, countryCode) {
  return isValidPhoneNumber(number, countryCode)
}