import {
    getConversationMessages,
    saveConversationMessages,
} from "@/features/ai/action/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { getCurrentAuthenticatedUser } from "@/features/auth/action/get-current-authenticated-user";
import { prisma } from "@/lib/db";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { NextResponse } from "next/server";

/**
 *
 * - user se kya aayega ? => message , userId
 *
 */
export async function POST(req: Request) {
    const { message, conversationId } = await req.json();
    if (!message || !conversationId) {
        return NextResponse.json({
            message: "Message or conversationId is missing",
            status: 400,
        });
    }

    const user = await getCurrentAuthenticatedUser();
    if (!user) {
        return NextResponse.json({
            message: "User not authenticated",
            status: 401,
        });
    }

    // Kya conversation exist karta hai ?
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
    });
    if (!conversation) {
        return NextResponse.json({
            message: "Conversation not found",
            status: 404,
        });
    }
    if (conversation.userId !== user?.id) {
        return NextResponse.json({
            message:
                "You are not authorized to send message in this conversation",
            status: 403,
        });
    }

    // conversation exist karta hai => messages ki bari hai
    const previousMessages = await getConversationMessages(conversationId);
    const isMessageAlreadySaved = previousMessages.some(
        (existingMessage) => existingMessage.id === message.id,
    );
    const conversationHistory = isMessageAlreadySaved
        ? previousMessages
        : [...previousMessages, message];

    if (!isMessageAlreadySaved) {
        await saveConversationMessages(conversationId, [message]);
    }

    const result = streamText({
        model: getChatModel(conversation.model),
        system:
            conversation.systemPrompt ??
            "You are PromptLab, a helpful assistant",
        messages: await convertToModelMessages(conversationHistory),
    });
    // removed result.consumeStream() to allow the stream to flow to the client

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            originalMessages: conversationHistory,
            generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
            onEnd: async ({ messages: finalMessages }) => {
                try {
                    await saveConversationMessages(conversationId, finalMessages, {
                        updateTitle: false,
                    });
                } catch (error) {
                    console.error(error);
                }
            },
        }),
    });
}
