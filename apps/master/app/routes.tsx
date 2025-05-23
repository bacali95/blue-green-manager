import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  route('status', './routes/status.ts'),
  layout('./routes/providers.tsx', [
    route('login', './routes/login.tsx'),
    route('logout', './routes/logout.tsx'),
    route('*', './routes/layout.tsx', [index('./routes/index.tsx')]),
  ]),
  route('rpc', './routes/rpc.ts'),
] satisfies RouteConfig;
