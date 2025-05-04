import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../services/firebaseConfig.js";

function Student(uid) {
  const [alunos, setAlunos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alunosRef = collection(firestore, `student/${uid}/alunos`);
        const query = await getDocs(alunosRef);
        const alunosData = query.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        alunosData.sort((a, b) => a.nome.localeCompare(b.nome));
        const alunoTimeRef = doc(
          firestore,
          `student/${uid}/time/alunoTimeDoc`
        );
        const alunoTimeDoc = await getDoc(alunoTimeRef);
        let lastModifiedTime;
        if (alunoTimeDoc.exists()) {
          lastModifiedTime = alunoTimeDoc.data().lastModified;
        } else {
          lastModifiedTime = new Date().getTime();
          await setDoc(alunoTimeRef, { lastModified: lastModifiedTime });
        }
        localStorage.setItem("lastModifiedAlunos", lastModifiedTime);
        localStorage.setItem("alunosData", JSON.stringify(alunosData));
        setAlunos(alunosData);
      } catch (error) {
        console.error("Erro ao buscar alunos");
        setError(error);
      }
    };

    const cachedAlunosData = localStorage.getItem("alunosData");
    const cachedLastModifiedTime = localStorage.getItem("lastModifiedAlunos");
    if (cachedAlunosData && cachedLastModifiedTime) {
      const alunoTimeRef = doc(
        firestore,
        `student/${uid}/time/alunoTimeDoc`
      );
      const unsubscribe = onSnapshot(alunoTimeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const lastModified = docSnapshot.data().lastModified;
          if (parseInt(cachedLastModifiedTime) === lastModified) {
            setAlunos(JSON.parse(cachedAlunosData));
          } else {
            fetchData();
          }
        } else {
          fetchData();
        }
      });

      return () => unsubscribe();
    } else {
      fetchData();
    }
  }, [uid]);

  return { alunos, error };
}

export default Student;