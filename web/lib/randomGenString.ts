export default function generateRandomString(length: number, chars?: string) {
  const characters =
    chars ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=_-";
  let slug = "";
  for (let times = 0; times < length; times++) {
    slug += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return slug;
}
