import Client from "./client";
export default async function Page(props: {
  params: Promise<{ slug: string; team: string }>;
}) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const { slug, team } = await props.params;
  return uuidRegex.test(slug) ? (
    <Client slug={slug} teamId={team} />
  ) : (
    <div className="text-center justify-center inset-0 absolute flex flex-col">
      <span className="text-3xl">
        Oops! this isn't the format we wanted, please use a diff one. :(
      </span>
    </div>
  );
}
