import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  DocumentData,
  orderBy,
  limit
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7mGS-Z3ceVDQEI1nW9QQfJ0jrvlXJI_s",
  authDomain: "scorevistareal.firebaseapp.com",
  projectId: "scorevistareal",
  storageBucket: "scorevistareal.firebasestorage.app",
  messagingSenderId: "234728524448",
  appId: "1:234728524448:web:1c8d258b6046950525d7c5",
  measurementId: "G-JWTM9N46HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const signUp = async (email: string, password: string, firstName: string, lastName: string, targetScore: number) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = `${firstName} ${lastName}`;
    
    // Update the user's profile
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserProfile(userCredential.user.uid, { 
      email, 
      firstName,
      lastName,
      displayName, 
      targetScore,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      analysisCount: 0,
      exercisesCompleted: 0,
      weeklyGoal: 5,
      weeklyProgress: 0,
      averageScore: 0,
      recentActivity: []
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Update last login
    const userDocRef = doc(db, "users", userCredential.user.uid);
    await updateDoc(userDocRef, {
      lastLogin: Timestamp.now()
    });
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Firestore functions
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, userData);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, updates);
    
    // Fetch and return the updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Function to update weekly progress
export const updateWeeklyProgress = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const weeklyProgress = (userData.weeklyProgress || 0) + 1;
      const weeklyGoal = userData.weeklyGoal || 5;
      const weeklyPercentage = Math.min(Math.round((weeklyProgress / weeklyGoal) * 100), 100);
      
      await updateDoc(userDocRef, {
        weeklyProgress: weeklyProgress,
        weeklyPercentage: weeklyPercentage
      });
    }
  } catch (error) {
    console.error("Error updating weekly progress:", error);
    throw error;
  }
};

// Function to save text analysis results to user's history
export const saveAnalysisResult = async (userId: string, analysisData: any) => {
  try {
    // Create a new document in the analyses collection
    const analysesCollectionRef = collection(db, "users", userId, "analyses");
    const newAnalysisRef = doc(analysesCollectionRef);
    
    const analysisWithId = {
      ...analysisData,
      createdAt: Timestamp.now(),
      id: newAnalysisRef.id
    };
    
    await setDoc(newAnalysisRef, analysisWithId);
    
    // Update user's analysis count and recent activity
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Calculate new average score
      const currentAverage = userData.averageScore || 0;
      const analysisCount = userData.analysisCount || 0;
      const newAverage = analysisCount > 0 
        ? ((currentAverage * analysisCount) + analysisData.overallScore) / (analysisCount + 1)
        : analysisData.overallScore;
      
      // Update recent activity
      const recentActivity = userData.recentActivity || [];
      recentActivity.unshift({
        id: newAnalysisRef.id,
        type: 'analysis',
        title: analysisData.title || 'Text Analysis',
        score: analysisData.overallScore,
        createdAt: Timestamp.now()
      });
      
      // Keep only the most recent 10 activities
      if (recentActivity.length > 10) {
        recentActivity.pop();
      }
      
      await updateDoc(userDocRef, {
        analysisCount: (analysisCount || 0) + 1,
        averageScore: parseFloat(newAverage.toFixed(1)),
        recentActivity: recentActivity,
      });
      
      // Update weekly progress
      await updateWeeklyProgress(userId);
    }
    
    return newAnalysisRef.id;
  } catch (error) {
    console.error("Error saving analysis result:", error);
    throw error;
  }
};

// Function to save completed exercise
export const saveCompletedExercise = async (userId: string, exerciseData: any) => {
  try {
    // Create a new document in the exercises collection
    const exercisesCollectionRef = collection(db, "users", userId, "exercises");
    const newExerciseRef = doc(exercisesCollectionRef);
    
    const exerciseWithId = {
      ...exerciseData,
      completedAt: Timestamp.now(),
      id: newExerciseRef.id
    };
    
    await setDoc(newExerciseRef, exerciseWithId);
    
    // Update user's exercise count and recent activity
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const exercisesCompleted = (userData.exercisesCompleted || 0) + 1;
      
      // Update recent activity
      const recentActivity = userData.recentActivity || [];
      recentActivity.unshift({
        id: newExerciseRef.id,
        type: 'exercise',
        title: exerciseData.title || 'Exercise',
        score: exerciseData.score,
        createdAt: Timestamp.now()
      });
      
      // Keep only the most recent 10 activities
      if (recentActivity.length > 10) {
        recentActivity.pop();
      }
      
      await updateDoc(userDocRef, {
        exercisesCompleted: exercisesCompleted,
        recentActivity: recentActivity
      });
      
      // Update weekly progress
      await updateWeeklyProgress(userId);
    }
    
    return newExerciseRef.id;
  } catch (error) {
    console.error("Error saving completed exercise:", error);
    throw error;
  }
};

// Function to get user's analysis history
export const getUserAnalysisHistory = async (userId: string) => {
  try {
    const analysesCollectionRef = collection(db, "users", userId, "analyses");
    const q = query(analysesCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const analyses: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return analyses;
  } catch (error) {
    console.error("Error getting analysis history:", error);
    throw error;
  }
};

// Function to get user's recent analyses
export const getRecentAnalyses = async (userId: string, limitCount = 5) => {
  try {
    const analysesCollectionRef = collection(db, "users", userId, "analyses");
    const q = query(analysesCollectionRef, orderBy("createdAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const analyses: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return analyses;
  } catch (error) {
    console.error("Error getting recent analyses:", error);
    throw error;
  }
};

// Function to get user's exercise progress
export const getUserExercises = async (userId: string) => {
  try {
    const exercisesCollectionRef = collection(db, "users", userId, "exercises");
    const q = query(exercisesCollectionRef, orderBy("completedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const exercises: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      exercises.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return exercises;
  } catch (error) {
    console.error("Error getting user exercises:", error);
    throw error;
  }
};

// Function to get recent exercises
export const getRecentExercises = async (userId: string, limitCount = 5) => {
  try {
    const exercisesCollectionRef = collection(db, "users", userId, "exercises");
    const q = query(exercisesCollectionRef, orderBy("completedAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const exercises: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      exercises.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return exercises;
  } catch (error) {
    console.error("Error getting recent exercises:", error);
    throw error;
  }
};

// Create a custom hook for authentication
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };
