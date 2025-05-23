import { FormProvider, useForm } from 'react-hook-form';
import { data, redirect, useFetcher } from 'react-router';
import { Button, Card, Flex, FormInputs, ThemeSelector } from 'tw-react-components';

import { commitSession, getSession } from '@commons/server';

import { config } from '~/config';

import { version } from '../../package.json';
import type { Route } from './+types/login';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const returnUrl = new URL(request.url).searchParams.get('returnUrl');

  if (session.has('user')) {
    return redirect(returnUrl ?? '/secure');
  }

  return data(
    { error: session.get('error') },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const form = await request.formData();
  const token = form.get('token')?.toString();

  if (!token || token !== config.adminToken) {
    session.set('error', 'Invalid token');

    return redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
  }

  const returnUrl = new URL(request.url).searchParams.get('returnUrl');

  session.set('user', { type: 'admin' });
  session.unset('error');

  return redirect(returnUrl ?? '/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const error = 'error' in loaderData ? loaderData.error : undefined;

  const loginForm = useForm<{ token: string }>();

  return (
    <Flex className="relative h-screen w-screen bg-white pt-[25dvh] dark:bg-slate-900 dark:text-white">
      <ThemeSelector className="absolute top-2 right-2" />
      <Flex className="mx-8 gap-0" direction="column" align="center" fullWidth>
        <FormProvider {...loginForm}>
          <Card className="w-full p-4 md:max-w-sm">
            <fetcher.Form className="flex flex-col items-center gap-3" method="POST">
              <FormInputs.Text name="token" placeholder="Token" autoComplete="password" required />
              {error && <div className="text-red-400">{error}</div>}
              <Button
                className="mx-auto w-fit px-6"
                type="submit"
                loading={fetcher.state !== 'idle'}
              >
                Login
              </Button>
            </fetcher.Form>
          </Card>
        </FormProvider>
        <div className="mt-2 text-xs">{version}</div>
      </Flex>
    </Flex>
  );
}
