import { getTopics } from "@/app/actions/topics";
import ShareClient from "./_components/share-client";

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  const topics = await getTopics();

  return (
    <ShareClient
      sharedTitle={params.title ?? ""}
      sharedText={params.text ?? ""}
      sharedUrl={params.url ?? ""}
      topics={topics}
    />
  );
}
