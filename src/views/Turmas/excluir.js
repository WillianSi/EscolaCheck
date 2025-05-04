import React, { useEffect, useState } from "react";
import { firestore } from "services/firebaseConfig.js";
import { doc, deleteDoc, collection, getDocs, setDoc } from "firebase/firestore";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button } from "reactstrap";

const Excluir = (props) => {
  const [turmaToDeleteName, setTurmaToDeleteName] = useState("");

  useEffect(() => {
    if (props.isOpen) {
    setTurmaToDeleteName(props.turmaToDelete);
    }
  }, [props.turmaToDelete, props.isOpen]);

  const handleExcluir = () => {
    if (props.turmaId) {
      const deleteTurmaAndSubcollection = async () => {
        try {
          const turmaRef = doc(firestore, `student/${props.uid}/turmas/${props.turmaId}`);
          const chamadasCollectionRef = collection(turmaRef, "chamadas");
          const chamadasQuerySnapshot = await getDocs(chamadasCollectionRef);
          const deletePromises = [];
  
          chamadasQuerySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
          });
  
          await Promise.all(deletePromises);
          await deleteDoc(turmaRef);

          const turmaTimeRef = doc(
            firestore,
            `student/${props.uid}/time/turmaTimeDoc`
          );
          await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
  
          props.handleAlert("Turma e chamadas excluídas", "success", "Sucesso!");
        } catch (error) {
          console.error("Erro ao excluir", error);
          props.handleAlert("Erro ao excluir", "danger", "Erro!");
        } finally {
          props.toggle();
        }
      };
      deleteTurmaAndSubcollection();
    }
  }

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
              Você tem certeza que quer excluir a turma{" "}
              <strong>{turmaToDeleteName}</strong>?
            </h4>
            <p>Se você excluir, não poderá recuperar os dados de chamadas da turma.</p>
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