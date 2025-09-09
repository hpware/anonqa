export const GET = async () => {
  const req = await fetch(
    `https://graph.threads.net/v1.0/${post_id}/threads_publish?domain=THREADS&creation_id=17924832948103188&access_token=${access_token}`,
  );
};
