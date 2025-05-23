import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function deployComposeFile(appPath: string, version: string): void {
  const newColor = 'blue'; // getInactiveColor(readActiveColor(appPath));

  // Update symlink
  const target = `versions/docker-compose.${version}.yaml`;
  const symlink = path.join(appPath, 'docker-compose.yaml');
  const oldLink = fs.readlinkSync(symlink);
  fs.unlinkSync(symlink);
  fs.symlinkSync(target, symlink);

  try {
    // Start new version
    execSync(`docker compose up -d ${newColor}-app`, { cwd: appPath, stdio: 'inherit' });

    // Write active_color
    fs.writeFileSync(path.join(appPath, 'active_color'), newColor);
  } catch (err) {
    // Stop new version
    execSync(`docker compose rm --stop ${newColor}-app`, { cwd: appPath, stdio: 'inherit' });

    // Rollback symlink
    fs.unlinkSync(symlink);
    fs.symlinkSync(oldLink, symlink);
    throw err;
  }
}
