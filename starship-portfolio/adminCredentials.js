import { createHmac } from 'node:crypto';

export function getAdminCredentials(env = process.env) {
  if (env.ADMIN_UN && env.ADMIN_PW) {
    return { username: env.ADMIN_UN, password: env.ADMIN_PW };
  }

  if (env.AUTONOMA_SIGNING_SECRET) {
    return {
      username: 'autonoma-admin',
      password: createHmac('sha256', env.AUTONOMA_SIGNING_SECRET)
        .update('portfolio-admin')
        .digest('hex'),
    };
  }

  return null;
}
