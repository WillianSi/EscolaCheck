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

function Classes(uid) {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const turmasRef = collection(firestore, `student/${uid}/turmas`);
        const querySnapshot = await getDocs(turmasRef);
        
        // Transformar os dados das turmas
        let turmasData = querySnapshot.docs.map((doc) => {
          const turma = { id: doc.id, ...doc.data() };

          // Remover alunos duplicados
          if (Array.isArray(turma.alunos)) {
            turma.alunos = [...new Set(turma.alunos)];
          }

          return turma;
        });

        // Remover turmas duplicadas
        turmasData = [...new Map(turmasData.map(turma => [turma.id, turma])).values()];

        // Ordenar turmas alfabeticamente
        turmasData.sort((a, b) => a.nome.localeCompare(b.nome));

        // Consultar e configurar o timestamp de última modificação
        const turmaTimeRef = doc(firestore, `student/${uid}/time/turmaTimeDoc`);
        const turmaTimeDoc = await getDoc(turmaTimeRef);
        let lastModifiedTime = turmaTimeDoc.exists()
          ? turmaTimeDoc.data().lastModified
          : new Date().getTime();

        if (!turmaTimeDoc.exists()) {
          await setDoc(turmaTimeRef, { lastModified: lastModifiedTime });
        }

        // Atualizar o cache somente se necessário
        const cachedData = JSON.parse(localStorage.getItem("turmaData")) || [];
        if (JSON.stringify(cachedData) !== JSON.stringify(turmasData)) {
          localStorage.setItem("turmaData", JSON.stringify(turmasData));
          localStorage.setItem("lastModifiedTurma", lastModifiedTime);
        }

        setClasses(turmasData);
      } catch (error) {
        console.error("Erro ao buscar turmas", error);
        setError(error);
      }
    };

    // Verificar o cache ao inicializar
    const cachedTurmaData = localStorage.getItem("turmaData");
    const cachedLastModifiedTime = localStorage.getItem("lastModifiedTurma");

    if (cachedTurmaData && cachedLastModifiedTime) {
      const turmaTimeRef = doc(firestore, `student/${uid}/time/turmaTimeDoc`);
      const unsubscribe = onSnapshot(turmaTimeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const lastModified = docSnapshot.data().lastModified;
          if (parseInt(cachedLastModifiedTime) === lastModified) {
            setClasses(JSON.parse(cachedTurmaData));
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

  return { classes, error };
}

export default Classes;