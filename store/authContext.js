import { createContext, useState, useEffect } from "react";
import { signOut } from "next-auth/react";

const AuthContext = createContext({
  signup: {
    username: undefined,
    password: undefined,
    name: undefined,
    phoneNumber: undefined,
    dialCode: undefined,
    email: undefined,
    birthday: [], // [year, month, day]
    birthdayReady: false,
    verificationReady: false,
  },
});

const defaultSignup = {
  username: undefined,
  password: undefined,
  name: undefined,
  phoneNumber: undefined,
  dialCode: undefined,
  email: undefined,
  birthday: [
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  ],
  birthdayReady: false,
  verificationReady: false,
};

export function AuthContextProvider(props) {
  const [signup, setSignup] = useState(defaultSignup);

  /* const [signup, setSignup] = useState({
    username: "trollfi",
    password: "#1Abcdefg",
    name: "Timo Rolf",
    phoneNumber: "",
    dialCode: "",
    email: "timorolf05@gmail.com",
    birthday: [
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    ],
    birthdayReady: false,
    verificationReady: true,
  }); */

  const reset = async () => {
    setSignup(defaultSignup);
    await signOut();
  };

  /* // check for changes
  useEffect(() => {
    console.log(signup)
  }, [signup]) */

  const context = { signup, setSignup, reset };

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
