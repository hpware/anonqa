import Link from "next/link";
export default function ErrorPage() {
  return (
    <div className="">
      <div className="flex flex-col justify-center abesolute inset-0 text-center h-screen w-full">
        <div className="flex flex-col justify-center text-center">
          <span className="text-3xl md:text-5xl lg:text-7xl">⊙⁠﹏⁠⊙</span>
          <span className="text-xl md:text-2xl mb-3">Aw snap!</span>
          <span>The user that you're looking for doesn't exist!</span>
          <span>
            You can take this username{" "}
            <Link
              href={`/auth/signup`}
              className="text-transparent bg-clip-text bg-gradient-to-br from-blue-800 to-green-800"
            >
              here
            </Link>{" "}
            tho
          </span>
        </div>
      </div>
    </div>
  );
}
