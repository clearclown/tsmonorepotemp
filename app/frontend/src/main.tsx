import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Devtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/query-devtools';
import { atom, useAtom } from 'jotai';
const counterAtom = atom(0);
function Index() {
  const [c, setC] = useAtom(counterAtom);
  return (
    <div style={{ padding: 24 }}>
      <h1>frontend: Nx + Vite + TanStack + Jotai</h1>
      <button onClick={() => setC((x) => x + 1)}>count: {c}</button>
    </div>
  );
}
const rootRoute = createRootRoute({ component: () => <Index /> });
const router = createRouter({ routeTree: rootRoute });
const qc = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
      <Devtools />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
