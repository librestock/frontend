import * as React from 'react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
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
  component: AuthedLayout,
})

function AuthedLayout(): React.JSX.Element {
  return <Outlet />
}
