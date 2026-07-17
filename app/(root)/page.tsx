"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
    SparklesIcon,
    BrainCircuitIcon,
    MessageSquareTextIcon,
    ZapIcon,
    ArrowRightIcon,
    CodeIcon,
} from "lucide-react";

import { ChatComposer } from "@/features/conversation/components/chat-composer";
import { ChatEmpty } from "@/features/conversation/components/chat-empty";
import { useCreateConversation } from "@/features/conversation/hooks/use-conversation";

/**
 * Home page — shows the landing page for guests, and the welcome chat state for signed-in users.
 */
export default function HomePage() {
    const createConversation = useCreateConversation();

    const { userId } = useAuth();

    if (userId) {
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

    return (
                <div className="relative min-h-screen overflow-hidden bg-background">
                    {/* Ambient background glow */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
                        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
                    </div>

                    {/* Navigation */}
                    <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                                P
                            </span>
                            <span className="text-lg font-semibold tracking-tight">
                                PromptLab
                            </span>
                        </Link>
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Sign In
                            <ArrowRightIcon className="size-4" />
                        </Link>
                    </nav>

                    {/* Hero Section */}
                    <main className="relative z-10">
                        <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center md:pt-32 md:pb-32">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                                <SparklesIcon className="size-4 text-primary" />
                                <span>AI-powered prompt engineering</span>
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                Craft smarter prompts
                                <br />
                                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                    with PromptLab
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                                Your personal AI workspace for experimenting, refining,
                                and perfecting prompts. Chat with AI models, iterate in
                                real time, and save your best conversations.
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                                >
                                    Get Started Free
                                    <ArrowRightIcon className="size-4" />
                                </Link>
                                <a
                                    href="https://github.com/gaurav0973/prompt-lab"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-8 py-3.5 text-base font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
                                >
                                    <CodeIcon className="size-4" />
                                    View on GitHub
                                </a>
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="mx-auto max-w-5xl px-6 pb-32">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <FeatureCard
                                    icon={<BrainCircuitIcon className="size-6" />}
                                    title="AI-Powered Chat"
                                    description="Converse with advanced AI models. Stream responses in real time and iterate on your ideas."
                                />
                                <FeatureCard
                                    icon={<MessageSquareTextIcon className="size-6" />}
                                    title="Conversation History"
                                    description="Every chat is saved automatically. Pin, rename, or revisit your best prompt experiments."
                                />
                                <FeatureCard
                                    icon={<ZapIcon className="size-6" />}
                                    title="Fast & Focused"
                                    description="A distraction-free workspace designed for rapid prompt iteration and refinement."
                                />
                            </div>
                        </section>
                    </main>

                    {/* Footer */}
                    <footer className="relative z-10 border-t border-border/40 px-6 py-8 text-center text-sm text-muted-foreground">
                        <p>
                            &copy; {new Date().getFullYear()} PromptLab. Built with
                            Next.js, Clerk &amp; AI SDK.
                        </p>
                    </footer>
                </div>
    );
}

/** Reusable feature card component. */
function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:shadow-lg">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
