import { User } from '../types';

const USERS_KEY = 'zentum_users_db';
const SESSION_KEY = 'zentum_current_session';

export const AuthService = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  getAllUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // تسجيل الدخول مع دعم حساب الإدمن الجديد
  login: (email: string, password: string) => {
    // التحقق من حساب الإدمن الخاص
    if (email === 'ADMIN@ZENTUM' && password === 'zentum13579@Z') {
      const adminUser: User = {
        id: 'zentum-root-admin',
        email: 'ADMIN@ZENTUM',
        name: 'ZENTUM MASTER',
        forexBalance: 999999,
        cryptoBalance: 999999,
        role: 'ADMIN'
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    const users = AuthService.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Invalid credentials" };
  },

  register: (email: string, password: string, name: string) => {
    const users = AuthService.getAllUsers();
    if (!AuthService.isValidEmail(email)) return { success: false, message: "Invalid email" };
    if (users.find(u => u.email === email)) return { success: false, message: "Email registered" };

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      forexBalance: 0,
      cryptoBalance: 0,
      role: 'USER'
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  updateCurrentUser: (updatedUser: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    const users = AuthService.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // دالة للإدمن لتعديل أرصدة المستخدمين الآخرين
  adminUpdateUser: (targetUser: User) => {
    const users = AuthService.getAllUsers();
    const index = users.findIndex(u => u.id === targetUser.id);
    if (index !== -1) {
      users[index] = targetUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  getCurrentSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};