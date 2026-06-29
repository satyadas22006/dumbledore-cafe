import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path points to your firebase config file

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for the live authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch the dynamic list of allowed emails from Firestore
          const docRef = doc(db, 'settings', 'adminAccess');
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const allowedAdmins = docSnap.data().emails || [];
            
            // Check if the logged-in user's email is in the database array
            if (allowedAdmins.includes(user.email)) {
              setIsAuthenticated(true);
              return; // Success! Exit the function.
            }
          }
          
          // If the email isn't in the array, or the document is missing
          console.warn("Unauthorized email attempted to access portal.");
          setIsAuthenticated(false);
          
        } catch (error) {
          console.error("Error verifying admin credentials from database:", error);
          setIsAuthenticated(false);
        }
      } else {
        // No user is logged in at all
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show a loading screen while Firebase checks the Auth token AND the Database
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-emerald-400 font-mono font-bold tracking-widest">
        Verifying Database Credentials...
      </div>
    );
  }

  // If not logged in OR not in the database array, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // If they pass both checks, let them into the dashboard!
  return children;
};

export default ProtectedRoute;