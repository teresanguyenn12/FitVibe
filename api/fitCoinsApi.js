import { db } from "../firebase";
import { doc, fitCoins, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Gets the FitCoin balance of a user in realtime from Firebase
export const getFitCoins = (uid, callback) => {
    const userRef = doc(db, "users", uid);
    
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().fitCoins || 0);
        } else {
            callback(0);
        }
    });
};

// Updates FitCoin balance of user
export const updateFitCoins = async (uid, amount) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const currentBalance = userDoc.data().fitCoins || 0;
        const newBalance = Math.max(0, currentBalance + amount);

        await setDoc(userRef, { fitCoins: newBalance }, { merge: true });
        return newBalance;
    }
    return null; 
};

// Deducts respective FitCoins upon purchasing a reward
export const purchaseItem = async (uid, cost) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const currentBalance = userDoc.data().fitCoins || 0;
        if (currentBalance >= cost) {
            await setDoc(userRef, { fitCoins: currentBalance - cost }, { merge: true });
            return true;
        }
    }
    return false;
};