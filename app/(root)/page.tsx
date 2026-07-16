"use client";

import { useRouter } from "next/navigation";

import { ChatComposer } from "@/features/conversation/components/chat-composer";
import { ChatEmpty } from "@/features/conversation/components/chat-empty";
import { useCreateConversation } from "@/features/conversation/hooks/use-conversation";

/**
 * Home page — shows the welcome state with a composer.
 * A new conversation is created only when the user sends their first message.
 */
export default function HomePage() {
    const createConversation = useCreateConversation();

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <ChatEmpty />
            <ChatComposer
                onSend={async (text) => {
                    createConversation.mutate(text);
                }}
                isSending={createConversation.isPending}
                autoFocus
            />
        </div>
    );
}
