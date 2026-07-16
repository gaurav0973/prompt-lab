import { ChatShell } from "@/features/conversation/components/chat-shell";

/**
 * Layout for the main (root) route group — wraps all chat pages with the sidebar shell.
 */
export default function RootGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ChatShell>{children}</ChatShell>;
}
