import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import AuthContext from "../../store/authContext";

import SignupPage from "../../components/auth/authSignup/signup";
import BirthdayPage from "../../components/auth/authSignup/birthday";
import VerificationCodePage from "../../components/auth/authSignup/verificationCodePage";

import startVerification from "../../lib/verificationCode/startVerification";

function Signup() {
  const router = useRouter();
  const { signup, setSignup } = useContext(AuthContext);
  const [verificationCodeTries, setVerificationCodeTries] = useState(5);

  const changeLoginHandler = () => {
    // redirect to login page
    setSignup((prev) => ({ ...prev, password: undefined }));
    router.push("/auth/login");
  };

  const signupPageSubmitHandler = (options) => {
    setSignup({
      username: options.username,
      password: options.password,
      name: options.name,
      email: options.email,
      phoneNumber: options.phoneNumber,
      dialCode: options.dialCode,
      birthday: signup.birthday,
      birthdayReady: true,
      verificationReady: false,
    });
  };

  const birthdaySubmitHandler = () => {
    setSignup((prev) => ({ ...prev, verificationReady: true }));
  };

  const verificationSubmitHandler = async (verificationCode) => {
    if (verificationCodeTries <= 0) return;

    const { birthdayReady, verificationReady, ...userObj } = signup;

    const result = await signIn("credentialsSignup", {
      redirect: false,
      ...userObj,
      verificationCode,
    });
    console.log(result, result.ok)

    if (!result.ok) {
      setVerificationCodeTries((prev) => prev - 1);
      return console.log(result.error);
    }

    router.replace("/");
  };

  // send verification code when verification code component is rendered
  useEffect(() => {
    if (signup.verificationReady) startVerification(signup);
  }, [signup]);

  return (
    <>
      {signup.verificationReady ? (
        <VerificationCodePage
          changeLoginHandler={changeLoginHandler}
          submitHandler={verificationSubmitHandler}
          tries={verificationCodeTries}
          redirectBackHandler={() => {
            setSignup((prev) => ({
              ...prev,
              birthdayReady: true,
              verificationReady: false,
            }));
          }}
          email={signup.email}
          phoneNumber={signup.phoneNumber}
          dialCode={signup.dialCode}
        />
      ) : signup.birthdayReady ? (
        <BirthdayPage
          changeLoginHandler={changeLoginHandler}
          submitHandler={birthdaySubmitHandler}
        />
      ) : (
        <SignupPage
          changeLoginHandler={changeLoginHandler}
          submitHandler={signupPageSubmitHandler}
        />
      )}
    </>
  );
}

export default Signup;
