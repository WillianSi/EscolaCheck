import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../services/firebaseConfig.js";

function Date(uid, turmaId) {
  const [chamada, setChamada] = useState([]);
  const [existingCalls, setExistingCalls] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chamadaRef = collection(
          firestore,
          `student/${uid}/turmas/${turmaId}/chamada`
        );
        const query = await getDocs(chamadaRef);
        const chamadaData = query.docs.map((doc) => ({
          id: doc.id,
          date: doc.data().date,
          time: doc.data().time,
        }));
        chamadaData.sort((a, b) => b.date.localeCompare(a.date));
        const existingCall = chamadaData[0]?.date;
        setExistingCalls(existingCall);
        setChamada(chamadaData);
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [uid, turmaId]);

  return { chamada, existingCalls, error };
}

export default Date;