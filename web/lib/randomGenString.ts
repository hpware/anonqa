export default function generateRandomString(length: number, chars?: string) {
  const characters =
    chars ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=_-";
  // crypto-random instead of Math.random: join codes gate team access,
  // so their generation must not be predictable
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let slug = "";
  for (let times = 0; times < length; times++) {
    slug += characters.charAt(randomValues[times] % characters.length);
  }
  return slug;
}
