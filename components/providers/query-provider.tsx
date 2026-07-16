"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState<QueryClient>(() =>new QueryClient(
        {
            defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, // 30 seconds
                    },
                },
            }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

/**
 * For using this we have two things:
 * 1. useQuery
 *      - queryKey: => unique key for the query
 *      - queryFn: => funnction jo inko initialise karega
 * 2. useMutation
 *      - mutationFn: => function jo inko mutate karega
 *      - onSuccess: => function jo success hone par call hoga
 *      - onError: => function jo error hone par call hoga
 */
