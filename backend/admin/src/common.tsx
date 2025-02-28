import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../src/trpc';

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpLink({
            url: '/trpc/',
        }),
    ],
});
