import { prisma } from "@/lib/db";
import { syncAuthenticatedUserToDatabase } from "./onboard";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentAuthenticatedUser() {
    const { userId } = await auth.protect();
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });
    if (!user) {
        return syncAuthenticatedUserToDatabase();
    }
    return user;
}
