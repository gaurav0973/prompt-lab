"use server";

import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { isTextUIPart } from "ai";

/**
 * Represents a single part of a UI message.
 */
export interface UIMessagePart {
    type: "text";
    text: string;
}

/**
 * Represents a message exchanged between the user and the AI.
 */
export interface UIMessage {
    id: string;
    role: "user" | "assistant";
    parts: UIMessagePart[];
}

/**
 * Builds UI message parts from the stored database value.
 *
 * If structured parts already exist, they are returned.
 * Otherwise, a single text part is created from the fallback content.
 */
function buildUIMessageParts(
    storedParts: Prisma.JsonValue | null,
    fallbackContent: string,
): UIMessagePart[] {
    const uiMessageParts = storedParts as UIMessagePart[] | null;

    if (Array.isArray(uiMessageParts) && uiMessageParts.length > 0) {
        return uiMessageParts;
    }

    return [
        {
            type: "text",
            text: fallbackContent,
        },
    ];
}

/**
 * Returns all messages belonging to a conversation
 * ordered from oldest to newest.
 */
export async function getConversationMessages(
    conversationId: string,
): Promise<UIMessage[]> {
    const messageRows = await prisma.message.findMany({
        where: {
            conversationId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return messageRows.map((message) => ({
        id: message.id,
        role: message.role === "ASSISTANT" ? "assistant" : "user",
        parts: buildUIMessageParts(message.parts, message.content),
    }));
}

/**
 * Extracts plain text from a UI message by joining
 * all text parts together.
 */
function extractMessageText(message: UIMessage): string {
    return message.parts
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join("");
}

type SaveConversationMessagesOptions = {
    updateTitle?: boolean;
};

/**
 * Saves or updates conversation messages in the database
 * and updates conversation metadata.
 */
export async function saveConversationMessages(
    conversationId: string,
    messages: UIMessage[],
    options: SaveConversationMessagesOptions = {},
) {
    const { updateTitle = true } = options;

    /**
     * Save every message.
     */
    for (const message of messages) {
        const messageContent = extractMessageText(message);

        const databaseRole =
            message.role === "assistant" ? "ASSISTANT" : "USER";

        await prisma.message.upsert({
            where: {
                id: message.id,
            },

            create: {
                id: message.id,
                conversationId,
                role: databaseRole,
                status: "COMPLETE",
                content: messageContent,
                parts: message.parts as any,
            },

            update: {
                content: messageContent,
                parts: message.parts as any,
                status: "COMPLETE",
            },
        });
    }

    /**
     * Load the current conversation.
     */
    const existingConversation = await prisma.conversation.findUniqueOrThrow({
        where: {
            id: conversationId,
        },
        select: {
            title: true,
        },
    });

    /**
     * Find the first user message.
     */
    const firstUserMessage = messages.find(
        (message) => message.role === "user",
    );

    const firstUserMessageText = firstUserMessage
        ? extractMessageText(firstUserMessage).trim()
        : "";

    /**
     * Update conversation metadata.
     */
    await prisma.conversation.update({
        where: {
            id: conversationId,
        },

        data: {
            lastMessageAt: new Date(),

            title:
                updateTitle &&
                existingConversation.title === "New Chat" &&
                firstUserMessageText
                    ? firstUserMessageText.slice(0, 48)
                    : existingConversation.title,
        },
    });
}
