import Client from "./client";
export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const { slug } = await props.params;
  return uuidV4Regex.test(slug) ? (
    <Client slug={slug} />
  ) : (
    <div>Oops! this isn't the format we wanted, please use a diff one. :(</div>
  );
}
