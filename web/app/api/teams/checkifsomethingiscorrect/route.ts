export const POST = async () =>
  Response.json(
    {
      success: false,
      message: "Account credential changes are not available.",
    },
    { status: 501 },
  );
