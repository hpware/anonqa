export interface ThreadsUserData {
  id: string;
  name: string;
  is_verified: boolean;
  username: string;
  threads_profile_picture_url: string;
}

export function Threads({
  responseText,
  questionText,
  user,
}: {
  responseText: string;
  questionText: string;
  user: ThreadsUserData;
}) {
  return (
    <div className="border-gray-800 flex flex-row">
      <div className="flex flex-row">
        <img
          src={user.threads_profile_picture_url}
          className="rounded-full w-9 h-9"
        />
        <span className="ml-2 p-1">{user.username}</span>
      </div>
      <div>{}</div>
    </div>
  );
}
