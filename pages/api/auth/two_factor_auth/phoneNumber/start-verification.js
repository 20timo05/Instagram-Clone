import Everify from "everify";

const everify = new Everify(process.env.EVERIFY_API_KEY);
everify.sandbox();

export default async function startVerification(req, res) {
  const { phoneNumber } = req.body;
  
  await everify.startVerification({
    phoneNumber,
    method: "SMS",
  });

  return res.status(200).send("Success");
}
