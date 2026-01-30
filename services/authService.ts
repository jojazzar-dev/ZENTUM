import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc,
  deleteDoc 
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
      querySnapshot.forEach((docSnap) => {
        users.push(docSnap.data() as User);
      });
      return users;
    } catch (error) {
      console.error("Master Console Error", error);
      return [];
    }
  },

  // 1. محرك تسجيل الدخول مع فحص التفعيل
  login: async (email: string, password: string): Promise<{success: boolean, user?: User, message?: string}> => {
    const cleanEmail = email.trim().toUpperCase();
    const cleanPassword = password.trim();

    try {
      // استثناء الإدمن من فحص التفعيل
      if (cleanEmail === 'ADMIN@ZENTUM' && cleanPassword === 'zentum13579@Z') {
        const adminUser: User = {
          id: 'zentum-master-root',
          email: 'ADMIN@ZENTUM',
          name: 'ZENTUM MASTER',
          forexBalance: 999999.99,
          cryptoBalance: 999999.99,
          role: 'ADMIN',
          emailVerified: true,
          createdAt: Date.now(),
          forexOrders: [],
          cryptoHoldings: [],
          tradeHistory: []
        };
        await setDoc(doc(db, "users", adminUser.id), adminUser, { merge: true });
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCredential.user;

      // --- فحص إذا كان الإيميل مفعل ---
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        return { success: false, message: "Please verify your email address. Check your inbox for the activation link." };
      }

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // تحديث حالة التفعيل في Firestore إذا تغيرت
        if (!userData.emailVerified) {
            await updateDoc(doc(db, "users", firebaseUser.uid), { emailVerified: true });
            userData.emailVerified = true;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: "User profile missing." };

    } catch (error: any) {
      return { success: false, message: "Invalid credentials or unverified account." };
    }
  },

  // 2. محرك التسجيل مع إرسال رابط التفعيل
  register: async (email: string, password: string, name: string): Promise<{success: boolean, user?: User, message?: string}> => {
    try {
      const cleanEmail = email.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const firebaseUser = userCredential.user;

      // إرسال رسالة التحقق فوراً
      await sendEmailVerification(firebaseUser);

      const newUser: User = {
        id: firebaseUser.uid,
        email: cleanEmail,
        name: name.trim(),
        forexBalance: 0,
        cryptoBalance: 0,
        role: cleanEmail.toUpperCase() === 'ADMIN@ZENTUM' ? 'ADMIN' : 'USER',
        emailVerified: false,
        createdAt: Date.now(),
        forexOrders: [],
        cryptoHoldings: [],
        tradeHistory: []
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      // لا نحفظ الجلسة هنا لأننا سنطلب منه التفعيل أولاً
      return { success: true, user: newUser };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  // 3. تحديث البيانات الشامل (بما فيها السجل التاريخي)
  updateCurrentUser: async (updatedUser: User): Promise<void> => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, {
        forexBalance: updatedUser.forexBalance,
        cryptoBalance: updatedUser.cryptoBalance,
        forexOrders: updatedUser.forexOrders || [],
        cryptoHoldings: updatedUser.cryptoHoldings || [],
        tradeHistory: updatedUser.tradeHistory || [],
        emailVerified: updatedUser.emailVerified
      });
    } catch (error) {
      console.error("Cloud Sync Failed", error);
    }
  },

  // 4. دالة الإدمن لحذف المستخدم نهائياً من Firestore
  deleteUserAccount: async (userId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "users", userId));
      return true;
    } catch (error) {
      console.error("Delete Error", error);
      return false;
    }
  },

  adminUpdateUser: async (targetUser: User): Promise<void> => {
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        forexBalance: targetUser.forexBalance,
        cryptoBalance: targetUser.cryptoBalance,
        role: targetUser.role,
        tradeHistory: targetUser.tradeHistory || []
      });
    } catch (error) {
      console.error("Admin Update Error", error);
    }
  },

  getCurrentSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: async (): Promise<void> => {
    try { await signOut(auth); } catch (e) {}
    localStorage.removeItem(SESSION_KEY);
  }
};