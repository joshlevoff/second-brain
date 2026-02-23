import { getCards } from "@/app/actions/cards";
import { getTopics } from "@/app/actions/topics";
import { KanbanClient } from "./_components/kanban-client";

export default async function CapturePage() {
  const [cards, topics] = await Promise.all([getCards(), getTopics()]);
  return <KanbanClient cards={cards} topics={topics} />;
}
