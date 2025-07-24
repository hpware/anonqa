export default defineEventHandler(async (event) => {
  return sendRedirect(event, "", 301);
});
