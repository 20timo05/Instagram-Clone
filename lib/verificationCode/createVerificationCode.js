import { hashPassword } from "../auth";

export default async function createVerificationCode() {
  let verificationCode = "";

  for (let i = 0; i < 6; i++) {
    verificationCode += getRandomInt(0, 9);
  }

  const hashedVerificationCode = await hashPassword(verificationCode);

  return { verificationCode, hashedVerificationCode };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
