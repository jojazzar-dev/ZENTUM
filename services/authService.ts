import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc 
} from "firebase/firestore";
import { User } from '../types';

const SESSION_KEY = 'zentum_current_session';

export const AuthService = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      return users;
    } catch (error) {
      return [];
    }
  },

  login: async (email: string, password: string): Promise<{success: boolean, user?: User, message?: string}> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: "User not found" };
    } catch (error: any) {
      return { success: false, message: "Login failed" };
    }
  },

  register: async (email: string, password: string, name: string): Promise<{success: boolean, user?: User, message?: string}> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;
      const role: 'USER' | 'ADMIN' = email.trim().toUpperCase() === 'ADMIN@ZENTUM' ? 'ADMIN' : 'USER';
      const newUser: User = {
        id: firebaseUser.uid,
        email: email.trim(),
        name: name.trim(),
        forexBalance: 0,
        cryptoBalance: 0,
        role: role
      };
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  updateCurrentUser: async (updatedUser: User): Promise<void> => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, {
        forexBalance: updatedUser.forexBalance,
        cryptoBalance: updatedUser.cryptoBalance
      });
    } catch (error) {
      console.error("Sync error");
    }
  },

  adminUpdateUser: async (targetUser: User): Promise<void> => {
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        forexBalance: targetUser.forexBalance,
        cryptoBalance: targetUser.cryptoBalance,
        role: targetUser.role
      });
    } catch (error) {
      console.error("Admin sync error");
    }
  },

  getCurrentSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
  }
};