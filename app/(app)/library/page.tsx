import { getCards } from "@/app/actions/cards";
import { getTopics } from "@/app/actions/topics";
import { LibraryClient } from "./_components/library-client";

export default async function LibraryPage() {
  const [cards, topics] = await Promise.all([getCards(), getTopics()]);
  return <LibraryClient cards={cards} topics={topics} />;
}
