export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  token?: string;
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin', email: 'admin@irma.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Jean Dupont', email: 'jean@irma.com', password: 'pass123', role: 'user' },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  user: 'Client',
};

export const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/dashboard/admin',
  user: '/dashboards/user',
};
