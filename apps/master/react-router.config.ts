import type { Config } from '@react-router/dev/config';
import fsExtra from 'fs-extra';

export default {
  ssr: true,
  routeDiscovery: { mode: 'initial' },
  buildEnd: () => {
    fsExtra.removeSync('../../dist/apps/master');
    fsExtra.copySync('build', '../../dist/apps/master/build', {
      dereference: true,
    });
    fsExtra.copySync('package.json', '../../dist/apps/master/package.json', {
      dereference: true,
    });
  },
} satisfies Config;
