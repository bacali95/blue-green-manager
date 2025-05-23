import { HomeIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Link, type MetaArgs, NavLink, Outlet, redirect, useLocation } from 'react-router';
import type { LayoutSidebarProps } from 'tw-react-components';
import { Layout, Sidebar } from 'tw-react-components';

import { assertAdminAuthorized } from '~/utils';

import { version } from '../../package.json';
import type { Route } from './+types/layout';
import { NavUser } from './nav-user';

export function meta({ location }: MetaArgs) {
  const kebabCaseToTitle = (kebabCase: string) =>
    kebabCase
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const pathParts = location.pathname.split('/').filter(Boolean);
  const titleParts = (
    isFinite(parseInt(pathParts.at(-1) ?? '-1'))
      ? [pathParts.at(-2), pathParts.at(-1)]
      : [pathParts.at(-1)]
  )
    .filter((value): value is string => !!value)
    .map(decodeURIComponent)
    .map(kebabCaseToTitle);

  const title =
    titleParts.length > 1 ? `${titleParts.at(0)} [${titleParts.at(1)}]` : titleParts.at(0);

  return [{ title }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await assertAdminAuthorized(request);
}

export default function Index() {
  const sidebarProps: LayoutSidebarProps = useMemo(
    () => ({
      className: 'py-1',
      variant: 'inset',
      header: (
        <Link to="/">
          <Sidebar.MenuButton size="lg">
            {/* <img
              className="block h-9 w-9 rounded-lg bg-white p-2 shadow-sm group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8"
              src="/images/logo-only.png"
              alt="Logo"
              loading="lazy"
            /> */}
            <span className="ml-1 text-lg font-semibold">BlueGreen Manager</span>
          </Sidebar.MenuButton>
        </Link>
      ),
      items: [
        {
          type: 'item',
          pathname: '/',
          title: 'Home',
          Icon: HomeIcon,
        },
      ],
      footer: <NavUser version={version} />,
      basePath: '/',
    }),
    [],
  );

  return (
    <Layout className="p-0" sidebarProps={sidebarProps} NavLink={NavLink} useLocation={useLocation}>
      <Outlet />
    </Layout>
  );
}
