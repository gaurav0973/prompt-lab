"use server";

import { getCurrentAuthenticatedUser } from "@/features/auth/action/get-current-authenticated-user";
import { prisma } from "@/lib/db";

/**
 * Server action that creates a new conversation titled "New Chat".
 *
 * @returns The ID of the newly created conversation.
 */
export async function startNewChat() {
    const user = await getCurrentAuthenticatedUser();

    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            title: "New Chat",
        },
    });

    return conversation.id;
}
