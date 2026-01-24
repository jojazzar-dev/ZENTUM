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
  // 1. التحقق من صيغة البريد الإلكتروني
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 2. جلب جميع المستخدمين (للوحة الإدمن)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      return users;
    } catch (error) {
      console.error("Firestore Fetch Error:", error);
      return [];
    }
  },

  // 3. تسجيل الدخول (مع دعم الدخول المباشر للإدمن)
  login: async (email: string, password: string): Promise<{success: boolean, user?: User, message?: string}> => {
    const cleanEmail = email.trim().toUpperCase();
    const cleanPassword = password.trim();

    try {
      // --- منطق المدير العام (ZENTUM MASTER ADMIN) ---
      if (cleanEmail === 'ADMIN@ZENTUM' && cleanPassword === 'zentum13579@Z') {
        const adminUser: User = {
          id: 'zentum-master-root', // ID ثابت للمدير
          email: 'ADMIN@ZENTUM',
          name: 'ZENTUM MASTER',
          forexBalance: 999999.99,
          cryptoBalance: 999999.99,
          role: 'ADMIN'
        };

        // التأكد من وجود سجل للمدير في Firestore لضمان عمل النظام
        await setDoc(doc(db, "users", adminUser.id), adminUser, { merge: true });
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      // --- تسجيل الدخول للمستخدمين العاديين عبر Firebase Auth ---
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      }
      
      return { success: false, message: "User profile not found in cloud database." };

    } catch (error: any) {
      console.error("Auth Error:", error.code);
      let msg = "Invalid email or password. Please try again.";
      if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
      return { success: false, message: msg };
    }
  },

  // 4. تسجيل مستخدم جديد
  register: async (email: string, password: string, name: string): Promise<{success: boolean, user?: User, message?: string}> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      // تحديد الرتبة تلقائياً بناءً على الإيميل
      const role: 'USER' | 'ADMIN' = email.trim().toUpperCase() === 'ADMIN@ZENTUM' ? 'ADMIN' : 'USER';

      const newUser: User = {
        id: firebaseUser.uid,
        email: email.trim(),
        name: name.trim(),
        forexBalance: 0,
        cryptoBalance: 0,
        role: role
      };

      // حفظ في Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error("Register Error:", error.message);
      return { success: false, message: error.message };
    }
  },

  // 5. تحديث بيانات المستخدم الحالي (للأرصدة)
  updateCurrentUser: async (updatedUser: User): Promise<void> => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, {
        forexBalance: updatedUser.forexBalance,
        cryptoBalance: updatedUser.cryptoBalance
      });
    } catch (error) {
      console.error("Cloud Update Sync Error:", error);
    }
  },

  // 6. دالة الإدمن لتعديل بيانات أي مستخدم آخر
  adminUpdateUser: async (targetUser: User): Promise<void> => {
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        forexBalance: targetUser.forexBalance,
        cryptoBalance: targetUser.cryptoBalance,
        role: targetUser.role
      });
    } catch (error) {
      console.error("Admin Cloud Sync Error:", error);
    }
  },

  // 7. جلب الجلسة الحالية
  getCurrentSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // 8. تسجيل الخروج
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log("Signout error");
    }
    localStorage.removeItem(SESSION_KEY);
  }
};