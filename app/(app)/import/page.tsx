import { getTopics } from "@/app/actions/topics";
import { ImportClient } from "./_components/import-client";

export default async function ImportPage() {
  const topics = await getTopics();
  return <ImportClient topics={topics} />;
}
