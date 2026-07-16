import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function syncAuthenticatedUserToDatabase() {
    const authenticatedUser = await currentUser();

    if (!authenticatedUser) {
        throw new Error("Unauthorized");
    }

    const email = authenticatedUser.emailAddresses[0]?.emailAddress ?? null;

    return prisma.user.upsert({
        where: {
            clerkId: authenticatedUser.id,
        },

        create: {
            clerkId: authenticatedUser.id,
            email,
            firstName: authenticatedUser.firstName,
            lastName: authenticatedUser.lastName,
            imageUrl: authenticatedUser.imageUrl,
        },

        update: {
            email,
            firstName: authenticatedUser.firstName,
            lastName: authenticatedUser.lastName,
            imageUrl: authenticatedUser.imageUrl,
        },
    });
}
