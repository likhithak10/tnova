import * as Realm from 'realm-web';

export const app = new Realm.App({ id: (import.meta as any).env?.VITE_MONGODB_APP_ID });

export async function register(email: string, password: string): Promise<void> {
  await app.emailPasswordAuth.registerUser({ email, password });
}

export async function login(email: string, password: string): Promise<Realm.User> {
  const creds = Realm.Credentials.emailPassword(email, password);
  return await app.logIn(creds);
}

export async function registerOrLogin(email: string, password: string): Promise<Realm.User> {
  try {
    await register(email, password);
  } catch (e: any) {
    const msg = String(e?.message || '').toLowerCase();
    const code = String(e?.errorCode || '').toLowerCase();
    // Atlas returns 409 name already in use if user exists
    if (!(msg.includes('name already in use') || code.includes('409'))) {
      throw e;
    }
  }
  return await login(email, password);
}

export async function logout(): Promise<void> {
  if (app.currentUser) await app.currentUser.logOut();
}

export function getAccessToken(): string | null {
  return app.currentUser?.accessToken || null;
}

// Expose a global accessor so api.ts can fetch token without an import cycle
(globalThis as any).__getAccessToken = getAccessToken;


