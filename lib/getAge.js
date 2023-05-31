export default function getAge(day, monthIdx, year) {
  let today = new Date()
  let age = today.getFullYear() - year
  let month = today.getMonth() - monthIdx
  if (month < 0 || (month === 0 & today.getDate() < day)) {
    age--
  }
  return age
}