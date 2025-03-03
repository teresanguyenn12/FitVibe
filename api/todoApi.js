import { db } from '../firebase'; // Import your Firebase config
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Collection reference
const goalsCollection = collection(db, 'goals');

// Get current user ID
const getCurrentUserId = () => {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
};

// Fetch all goals for the current user
export const fetchGoals = async () => {
    try {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const q = query(goalsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const goals = [];
        
        querySnapshot.forEach((doc) => {
            goals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return goals;
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
    }
};

// Add a new goal with description and due date
export const addGoal = async (goalData) => {
    try {
        const userId = getCurrentUserId();
        if (!userId) throw new Error("User not authenticated");
        
        // Extract text from goalData if it's an object, or use goalData as the text if it's a string
        const text = typeof goalData === 'object' ? goalData.text : goalData;
        
        const newGoal = {
            text,
            userId,
            createdAt: new Date().toISOString(),
            completed: false,
            // Add new fields
            description: typeof goalData === 'object' ? goalData.description || "" : "",
            dueDate: typeof goalData === 'object' ? goalData.dueDate || null : null
        };
        
        const docRef = await addDoc(goalsCollection, newGoal);
        return {
            id: docRef.id,
            ...newGoal
        };
    } catch (error) {
        console.error("Error adding goal:", error);
        throw error;
    }
};

// Delete a goal
export const deleteGoal = async (goalId) => {
    try {
        const goalRef = doc(db, 'goals', goalId);
        await deleteDoc(goalRef);
        return goalId;
    } catch (error) {
        console.error("Error deleting goal:", error);
        throw error;
    }
};

// Update a goal (now supports all fields)
export const updateGoal = async (goalId, updates) => {
    try {
        const goalRef = doc(db, 'goals', goalId);
        
        // Ensure we're not overwriting userId
        const { userId, ...updateData } = updates;
        
        // Add updated timestamp
        updateData.updatedAt = new Date().toISOString();
        
        await updateDoc(goalRef, updateData);
        return {
            id: goalId,
            ...updates
        };
    } catch (error) {
        console.error("Error updating goal:", error);
        throw error;
    }
};

// Toggle goal completion status
export const toggleGoalCompletion = async (goalId, currentStatus) => {
    return updateGoal(goalId, { 
        completed: !currentStatus,
        completedAt: !currentStatus ? new Date().toISOString() : null
    });
};

// Get goals by status (active or completed)
export const getGoalsByStatus = async (completed = false) => {
    try {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const q = query(
            goalsCollection, 
            where("userId", "==", userId),
            where("completed", "==", completed)
        );
        
        const querySnapshot = await getDocs(q);
        const goals = [];
        
        querySnapshot.forEach((doc) => {
            goals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return goals;
    } catch (error) {
        console.error("Error fetching goals by status:", error);
        throw error;
    }
};

// Get goals with approaching due dates (within the next 24 hours)
export const getUpcomingGoals = async () => {
    try {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        // Get all active goals
        const q = query(
            goalsCollection, 
            where("userId", "==", userId),
            where("completed", "==", false)
        );
        
        const querySnapshot = await getDocs(q);
        const allGoals = [];
        
        querySnapshot.forEach((doc) => {
            allGoals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Filter goals with due dates in the next 24 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        return allGoals.filter(goal => {
            if (!goal.dueDate) return false;
            
            const dueDate = new Date(goal.dueDate);
            return dueDate >= now && dueDate <= tomorrow;
        });
    } catch (error) {
        console.error("Error fetching upcoming goals:", error);
        throw error;
    }
};

// Get expired goals (past due date and not completed)
export const getExpiredGoals = async () => {
    try {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        // Get all active goals
        const q = query(
            goalsCollection, 
            where("userId", "==", userId),
            where("completed", "==", false)
        );
        
        const querySnapshot = await getDocs(q);
        const allGoals = [];
        
        querySnapshot.forEach((doc) => {
            allGoals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Filter goals with due dates in the past
        const now = new Date();
        
        return allGoals.filter(goal => {
            if (!goal.dueDate) return false;
            
            const dueDate = new Date(goal.dueDate);
            return dueDate < now;
        });
    } catch (error) {
        console.error("Error fetching expired goals:", error);
        throw error;
    }
};