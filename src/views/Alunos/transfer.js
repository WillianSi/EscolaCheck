import React, { useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button, FormGroup } from "reactstrap";
import useFetchClasses from "../../hooks/class.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "services/firebaseConfig.js";

const Transfer = (props) => {
  const { isOpen, toggle, uid, nomeId, turmaId } = props;
  const { classes } = useFetchClasses(uid);
  const [turma, setTurma] = useState("");
  const [deslocar, setDeslocar] = useState("");
  const [aluno, setAluno] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFecharClick = () => {
    setDeslocar("");
    setLoading(false);
    toggle();
  };

  const handleConcluirClick = async () => {
    setLoading(true);

    const turmaRef = collection(
      firestore,
      `student/${uid}/turmas/${turma}/chamada`
    );
    const deslocarRef = collection(
      firestore,
      `student/${uid}/turmas/${deslocar}/chamada`
    );

    const retirarRef = doc(
      collection(firestore, "student", uid, "turmas"),
      turma
    );
    const adicionarRef = doc(
      collection(firestore, "student", uid, "turmas"),
      deslocar
    );

    try {
      const retirarSnapshot = await getDoc(retirarRef);
      const retirarData = retirarSnapshot.data();
      if (retirarData && retirarData.alunos) {
        const updatedAlunosArray = retirarData.alunos.filter(
          (id) => id !== aluno
        );
        if (updatedAlunosArray.length !== retirarData.alunos.length) {
          await updateDoc(retirarRef, { alunos: updatedAlunosArray });
        }
      }
      const adicionarSnapshot = await getDoc(adicionarRef);
      const adicionarData = adicionarSnapshot.data();
      const updatedAlunosArray =
        adicionarData && adicionarData.alunos
          ? [...adicionarData.alunos, aluno]
          : [aluno];
      await updateDoc(adicionarRef, { alunos: updatedAlunosArray });

      const turmaSnapshot = await getDocs(turmaRef);
      const combinedDataArray = turmaSnapshot.docs.map((doc) => {
        const chamadaData = doc.data();
        const { date, studentsAbsent, studentsPresent } = chamadaData;
        const alunoAbsentData = studentsAbsent.find(
          (student) => student.id === aluno
        );
        const alunoPresentData = studentsPresent.find(
          (student) => student.id === aluno
        );
        return {
          date,
          alunosAbsentDataArray: alunoAbsentData ? [alunoAbsentData] : [],
          alunosPresentDataArray: alunoPresentData ? [alunoPresentData] : [],
        };
      });

      const deslocarSnapshot = await getDocs(deslocarRef);
      for (const doc of deslocarSnapshot.docs) {
        const chamadaData = doc.data();
        const date = chamadaData.date;
        const matchingData = combinedDataArray.find(
          (data) => data.date === date
        );
        if (matchingData) {
          const deslocarRef = doc.ref;
          const deslocarSnapshot = await getDoc(deslocarRef);
          const deslocarData = deslocarSnapshot.data();
          let updatedData = {};
          if (matchingData.alunosAbsentDataArray.length > 0) {
            updatedData.studentsAbsent = [
              ...(deslocarData.studentsAbsent || []),
              ...matchingData.alunosAbsentDataArray,
            ];
          }
          if (matchingData.alunosPresentDataArray.length > 0) {
            updatedData.studentsPresent = [
              ...(deslocarData.studentsPresent || []),
              ...matchingData.alunosPresentDataArray,
            ];
          }
          if (Object.keys(updatedData).length > 0) {
            await updateDoc(deslocarRef, updatedData);
          }
        }
      }

      const dataNotFoundArray = [];
      combinedDataArray.forEach((data) => {
        const foundDate = deslocarSnapshot.docs.some(
          (doc) => doc.data().date === data.date
        );
        if (!foundDate) {
          dataNotFoundArray.push(data);
        }
      });
      if (dataNotFoundArray.length > 0) {
        const trasferRef = collection(
          firestore,
          `student/${uid}/turmas/${deslocar}/trasfer`
        );
        await addDoc(trasferRef, {
          dataNotFound: dataNotFoundArray,
          timestamp: serverTimestamp(),
        });
      }

      const turmaTimeRef = doc(
        firestore,
        `student/${props.uid}/time/turmaTimeDoc`
      );
      await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
      props.handleAlert("Aluno realocado de turma", "success", "Sucesso!");
      setLoading(false);
      props.toggle();
    } catch (error) {
      props.handleAlert("Não foi realocado", "danger", "Erro!");
      props.toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Transferência"}</h2>
          <button className="close" onClick={handleFecharClick}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          <h4 className="mt-4">
            Transferir <strong>{props.alunoToTransfer}</strong> para:
          </h4>
          <FormGroup>
            <label className="form-control-label" htmlFor="select-dropdown-2">
              Realocar:
            </label>
            <select
              className="form-control form-control-alternative"
              id="select-dropdown-2"
              name="deslocar"
              value={deslocar}
              onChange={(e) => {
                setDeslocar(e.target.value);
                setTurma(turmaId);
                setAluno(nomeId);
              }}
            >
              <option value="">Selecionar</option>
              {classes.map((classItem) => {
                if (classItem.id !== turmaId) {
                  return (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.nome}
                    </option>
                  );
                }
                return null;
              })}
            </select>
          </FormGroup>
        </div>
        <div className="modal-footer">
          <Button
            color="success"
            onClick={handleConcluirClick}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Concluir"}
          </Button>
          <Button color="danger" onClick={handleFecharClick}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Transfer;
