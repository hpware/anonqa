interface reportMenu {
  msgId: string;
  toUser: string;
  msg: string;
  answered: boolean;
  linkedPosts?: {
    platform: string;
    url?: string;
  };
  moderation: boolean;
}

export default function ReportMenu({
  messageData,
  session,
}: {
  messageData: reportMenu;
  session: string;
}) {
  return (
    <div>
      {/* popup */}
      <div className="bg-gray-700/30 w-full h-screen">
        <div className="m-12">
          <button className="absolute">X</button>
        </div>
      </div>
    </div>
  );
}
