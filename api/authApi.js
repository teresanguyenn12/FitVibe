    import { auth, db } from "../firebase";
    import {
        createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
        onAuthStateChanged
    } from "firebase/auth";
    import { doc, setDoc, getDoc } from "firebase/firestore";
    import { Timestamp } from "firebase/firestore";

    export const registerUser = async (email, password, fullName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const userData = {
            uid: firebaseUser.uid,
            fullName,
            email: firebaseUser.email,
            createdAt: Timestamp.now(),
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
        return userData;
    };

    export const loginUser = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Fetch user document using UID instead of email
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        return userDoc.exists() ? userDoc.data() : null;
    };


    export const logoutUser = async () => {
        await signOut(auth);
    };
