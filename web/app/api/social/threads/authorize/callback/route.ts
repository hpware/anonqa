export const GET = async () =>
  Response.json(
    {
      success: false,
      message: "Threads integration is not configured or supported.",
    },
    { status: 501 },
  );
