import { getTopics } from "@/app/actions/topics";
import { ImportTabs } from "./_components/import-tabs";

export default async function ImportPage() {
  const topics = await getTopics();
  return <ImportTabs topics={topics} />;
}
