import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Package, Settings, Logs, MapPin, Boxes, Users, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Permission, Resource } from '@librestock/types'

import { PoweredBy } from '@/components/common/PoweredBy'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useBranding } from '@/hooks/providers/BrandingProvider'
import { useSession } from '@/lib/auth-client'
import { usePermissions } from '@/lib/permissions'
import { sanitizeUrl } from '@/lib/utils'

interface RouteItem {
  name: string
  route: string
  icon: React.ComponentType
  resource: Resource
}

function useRoutes(): RouteItem[] {
  const { t } = useTranslation()

  return [
    {
      name: t('navigation.dashboard'),
      route: '/',
      icon: LayoutDashboard,
      resource: Resource.DASHBOARD,
    },
    {
      name: t('navigation.stock'),
      route: '/stock',
      icon: Package,
      resource: Resource.STOCK,
    },
    {
      name: t('navigation.products'),
      route: '/products',
      icon: Package,
      resource: Resource.PRODUCTS,
    },
    {
      name: t('navigation.locations'),
      route: '/locations',
      icon: MapPin,
      resource: Resource.LOCATIONS,
    },
    {
      name: t('navigation.inventory'),
      route: '/inventory',
      icon: Boxes,
      resource: Resource.INVENTORY,
    },
    {
      name: t('navigation.auditLogs'),
      route: '/audit-logs',
      icon: Logs,
      resource: Resource.AUDIT_LOGS,
    },
    {
      name: t('navigation.users'),
      route: '/users',
      icon: Users,
      resource: Resource.USERS,
    },
    {
      name: t('navigation.roles'),
      route: '/roles',
      icon: Shield,
      resource: Resource.ROLES,
    },
  ]
}

export default function AppSidebar(): React.JSX.Element {
  const { t } = useTranslation()
  const { branding } = useBranding()
  const { data: session } = useSession()
  const allRoutes = useRoutes()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const permissions = usePermissions()

  const routes = allRoutes.filter((r) => permissions.can(Permission.READ, r.resource))

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="inline-flex items-center gap-2" to="/">
          {branding.logo_url ? (
            <img
              alt={branding.app_name}
              className="h-6 w-auto"
              src={sanitizeUrl(branding.logo_url)}
            />
          ) : null}
          <span className="text-base font-bold tracking-tight">
            {branding.app_name}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ name, route, icon: Icon }) => {
                const isActive = route === '/' 
                  ? currentPath === '/' 
                  : currentPath.startsWith(route)
                return (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={route}>
                        <Icon />
                        <span>{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPath === '/settings'}>
              <Link to="/settings">
                <Settings />
                <span>{t('navigation.settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!session ? (
          <Link className="px-2 py-1 text-sm" to="/login">
            {t('auth.signIn')}
          </Link>
        ) : null}
        <PoweredBy />
      </SidebarFooter>
    </Sidebar>
  )
}
