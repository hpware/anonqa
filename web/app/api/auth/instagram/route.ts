import { useRouter } from "next/navigation";
export async function GET() {
  const router = useRouter();
  return new Response(`The server is up! ${router.query}`);
}
