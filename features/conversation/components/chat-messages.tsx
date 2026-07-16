"use client";

import type { ChatStatus } from "ai";
import { isTextUIPart, type UIMessage } from "ai";

import {
    Conversation,
    ConversationContent,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";

/** Extracts plain text from a `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
    return message.parts
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join("");
}

type ChatMessagesProps = {
    messages: UIMessage[];
    status: ChatStatus;
};

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({ messages, status }: ChatMessagesProps) {
    const isWaiting =
        status === "submitted" && messages.at(-1)?.role === "user";

    return (
        <Conversation>
            <ConversationContent className="py-8">
                {messages.map((message) => (
                    <Message key={message.id} from={message.role}>
                        <MessageContent>
                            <MessageResponse>
                                {getMessageText(message)}
                            </MessageResponse>
                        </MessageContent>
                    </Message>
                ))}

                {isWaiting ? (
                    <Message from="assistant">
                        <MessageContent>
                            <Loader />
                        </MessageContent>
                    </Message>
                ) : null}
            </ConversationContent>
        </Conversation>
    );
}
