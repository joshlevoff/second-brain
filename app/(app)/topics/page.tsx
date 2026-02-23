import { getCards } from "@/app/actions/cards";
import { getTopics } from "@/app/actions/topics";
import { TopicsClient } from "./_components/topics-client";

export default async function TopicsPage() {
  const [topics, cards] = await Promise.all([getTopics(), getCards()]);
  return <TopicsClient topics={topics} cards={cards} />;
}
