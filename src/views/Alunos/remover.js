import React from "react";
import { firestore } from "services/firebaseConfig.js";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button } from "reactstrap";

const Remover = (props) => {
  let aluno = "Aluno não selecionado";
  
  if (props.isOpen === true) {
    aluno = props.alunoToRemove;
  }

  const handleRemover = async () => {
    if (props.nomeId) {
      try {
        const turmasCollectionRef = doc(
          firestore,
          `student/${props.uid}/turmas/${props.turmaId}`
        );
        const turmaDoc = await getDoc(turmasCollectionRef);

        const turmaData = turmaDoc.data();
        const alunosArray = turmaData.alunos;

        const updatedAlunosArray = alunosArray.filter(
          (id) => id !== props.nomeId
        );
        await updateDoc(turmasCollectionRef, { alunos: updatedAlunosArray });
        const turmaTimeRef = doc(
          firestore,
          `student/${props.uid}/time/turmaTimeDoc`
        );
        await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
        props.handleAlert("Aluno removido da turma", "success", "Sucesso!");
        props.toggle();
      } catch (error) {
        console.error("Error updating turmas documents:", error);
        props.handleAlert(
          "Erro ao excluir aluno das turmas",
          "danger",
          "Erro!"
        );
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
              Você tem certeza que quer remover o aluno <strong>{aluno}</strong>{" "}
              dessa turma?
            </h4>
            <p>
              Se você removelo, ele não será apagado mais não aparecerá na
              relação da turma.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="btn-white"
            color="default"
            type="button"
            onClick={handleRemover}
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

export default Remover;
