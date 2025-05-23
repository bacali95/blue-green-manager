import { Outlet } from 'react-router';
import type { ThemeState } from 'tw-react-components';
import {
  LayoutContextProvider,
  SHOW_IDS_COOKIE_NAME,
  SIDEBAR_COOKIE_NAME,
  SidebarContextProvider,
  THEME_COOKIE_NAME,
  Toaster,
} from 'tw-react-components';

import { TIME_OFFSET_COOKIE_NAME, TimeOffsetContextProvider } from '@commons/client';
import { getValueFromCookie } from '@commons/shared';

import type { Route } from './+types/providers';

export function loader({ request }: Route.LoaderArgs) {
  return {
    theme: getValueFromCookie<ThemeState>(
      request.headers.get('Cookie') ?? '',
      THEME_COOKIE_NAME,
      'system',
    ),
    sidebarOpen: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SIDEBAR_COOKIE_NAME,
      false,
    ),
    timeOffset: getValueFromCookie<number>(
      request.headers.get('Cookie') ?? '',
      TIME_OFFSET_COOKIE_NAME,
      0,
    ),
    showIds: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SHOW_IDS_COOKIE_NAME,
      false,
    ),
  };
}

export default function Providers({ loaderData }: Route.ComponentProps) {
  return (
    <TimeOffsetContextProvider defaultValue={loaderData.timeOffset}>
      <LayoutContextProvider theme={loaderData.theme} showIds={loaderData.showIds}>
        <SidebarContextProvider defaultOpen={loaderData.sidebarOpen}>
          <Outlet />
          <Toaster />
        </SidebarContextProvider>
      </LayoutContextProvider>
    </TimeOffsetContextProvider>
  );
}
