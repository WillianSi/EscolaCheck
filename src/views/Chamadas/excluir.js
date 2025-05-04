import React from "react";
import { doc, deleteDoc, collection } from "firebase/firestore";
import { firestore } from "services/firebaseConfig";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const Excluir = (props) => {
  const navigate = useNavigate();
  const presencaId = props.presencaId;
  const handleExcluir = async () => {
    try {
      const chamadaRef = doc(
        collection(firestore, `student/${props.uid}/turmas/${props.turmaId}/chamada`),
        presencaId
      );
      await deleteDoc(chamadaRef);
      props.toggle();
      const successMessage = "Chamada excluída com sucesso.";
      navigate(`/admin/presence/${props.turmaId}?message=${encodeURIComponent(successMessage)}`);
    } catch (error) {
      props.toggle();
      props.handleAlert("Ao excluir dados", "danger", "Error! ");
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
              Você tem certeza que quer excluir essa chamada?
            </h4>
            <p>Se você excluir, não poderá recuperar os dados da chamada.</p>
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