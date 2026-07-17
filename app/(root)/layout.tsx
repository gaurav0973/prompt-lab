import { ChatShell } from "@/features/conversation/components/chat-shell";
import { auth } from "@clerk/nextjs/server";

/**
 * Layout for the main (root) route group.
 * Wraps chat pages with the sidebar shell for signed-in users,
 * but renders plain children for the signed-out landing page.
 */
export default async function RootGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    
    if (userId) {
        return <ChatShell>{children}</ChatShell>;
    }

    return <>{children}</>;
}
