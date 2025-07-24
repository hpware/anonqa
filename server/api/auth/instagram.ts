export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const getNextRedirectTarget = query.nr || "/";
  const host = getRequestURL(event).host;
  console.log(host);
  const redirect_url = `${host}/api/auth/callback/instagram?nr=${getNextRedirectTarget}`;
  const buildUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirect_url}&response_type=code&scope=<PERMISSIONS_APP_NEEDS>`;
  return sendRedirect(event, "/", 301);
});
