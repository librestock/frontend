import * as React from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import AppSidebar from '@/components/common/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import type { CurrentUserResponseDto } from '@/lib/data/auth'
import { getServerCurrentUser } from '@/lib/server/auth'

export interface AuthedRouteContext {
  currentUser: CurrentUserResponseDto
}

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const currentUser = await getServerCurrentUser()
    if (!currentUser) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' })
    }

    return { currentUser } satisfies AuthedRouteContext
  },
  pendingComponent: AuthedPending,
  component: AuthedLayout,
})

function AuthedLayout(): React.JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

function AuthedPending(): React.JSX.Element {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden w-64 border-r bg-muted/40 md:block" />
      <main className="flex flex-1 flex-col p-6">
        <div className="mb-4 h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded bg-muted" />
      </main>
    </div>
  )
}
