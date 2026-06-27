import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FULL_MENU } from './constants/data';

export const migrateMenu = async () => {
  try {
    await setDoc(doc(db, "settings", "fullMenu"), { data: FULL_MENU });
    alert("Migration Successful! Data is now in Firebase.");
  } catch (e) {
    console.error("Migration failed", e);
    alert("Migration failed. Check console.");
  }
};