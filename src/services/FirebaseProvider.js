import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebaseConfig';

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const [uid, setUid] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(undefined);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setFirebaseUid = (newUid) => {
    setUid(newUid);
  };

  if (loading) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={{ uid, setFirebaseUid }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('Erro no FirebaseProvider');
  }
  return context;
};