import React, { useEffect, useState } from "react";
import { firestore } from "services/firebaseConfig.js";
import { doc, deleteDoc, collection, updateDoc, getDocs, setDoc } from "firebase/firestore";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button } from "reactstrap";

const Excluir = (props) => {
  const [alunoToDeleteName, setAlunoToDeleteName] = useState("");

  useEffect(() => {
    setAlunoToDeleteName(props.alunoToDelete);
  }, [props.alunoToDelete]);

  const handleExcluir = async () => {
    if (props.nomeId) {  
      try {
        const turmasCollectionRef = collection(firestore, "student", props.uid, "turmas");
        const querySnapshot = await getDocs(turmasCollectionRef);
  
        querySnapshot.forEach(async (docSnapshot) => {
          const turmaId = docSnapshot.id;
          const alunosArray = docSnapshot.data().alunos;
  
          if (alunosArray && alunosArray.includes(props.nomeId)) {
            const updatedAlunosArray = alunosArray.filter(id => id !== props.nomeId);
            const turmaRef = doc(turmasCollectionRef, turmaId);
  
            await updateDoc(turmaRef, { alunos: updatedAlunosArray });
          }
        });

        const alunoRef = doc(firestore, `student/${props.uid}/alunos/${props.nomeId}`);
        deleteDoc(alunoRef)
  
        const alunoTimeRef = doc(
          firestore,
          `student/${props.uid}/time/alunoTimeDoc`
        );
        await setDoc(alunoTimeRef, { lastModified: new Date().getTime() });
        props.handleAlert("Aluno excluído de todas as turmas", "success", "Sucesso!");
        props.toggle();
      } catch (error) {
        console.error("Error updating turmas documents:", error);
        props.handleAlert("Erro ao excluir aluno das turmas", "danger", "Erro!");
        props.toggle();
      }
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      className="modal-dialog-centered modal-danger"
      contentClassName="bg-gradient-danger"
    >
      <AuthenticatedLayout>
        <div className="modal-header">
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={props.toggle}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="ni ni-bell-55 ni-3x" />
            <h4 className="heading mt-4">
              Você tem certeza que quer excluir o aluno{" "}
              <strong>{alunoToDeleteName}</strong>?
            </h4>
            <p>Se você excluir, não poderá recuperar os dados do aluno.</p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="btn-white"
            color="default"
            type="button"
            onClick={handleExcluir}
          >
            Sim
          </Button>
          <Button
            className="btn-white ml-auto"
            color="default"
            data-dismiss="modal"
            type="button"
            onClick={props.toggle}
          >
            Não
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Excluir;