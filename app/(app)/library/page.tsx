import { getCards } from "@/app/actions/cards";
import { getCategories } from "@/app/actions/categories";
import { getTopics } from "@/app/actions/topics";
import { LibraryClient } from "./_components/library-client";

export default async function LibraryPage() {
  const [cards, topics, categories] = await Promise.all([
    getCards(),
    getTopics(),
    getCategories(),
  ]);
  return <LibraryClient cards={cards} topics={topics} categories={categories} />;
}
