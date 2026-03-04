import { getCards } from "@/app/actions/cards";
import { getCategories } from "@/app/actions/categories";
import { getTopics } from "@/app/actions/topics";
import { KanbanClient } from "./_components/kanban-client";

export default async function CapturePage() {
  const [cards, topics, categories] = await Promise.all([
    getCards(),
    getTopics(),
    getCategories(),
  ]);
  return <KanbanClient cards={cards} topics={topics} categories={categories} />;
}
