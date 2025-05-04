import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { auth } from "services/firebaseConfig";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button, Input } from "reactstrap";

import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const Excluir = (props) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [user] = useAuthState(auth);

  const handleChangePassword = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleDelete = async () => {
    try {
      const userEnteredPassword = currentPassword;
      const credential = EmailAuthProvider.credential(
        user.email,
        userEnteredPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      const userDocRef = doc(getFirestore(), "student", user.uid);
      await deleteDoc(userDocRef);

      await deleteUser(auth.currentUser);
    } catch (error) {
      props.handleAlert(
        "Falha ao excluir conta. Verifique sua senha e tente novamente.",
        "danger",
        "Erro!"
      );
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
              Você tem certeza que quer excluir essa conta?
            </h4>
            <p>Se você exclui-lá, não poderá recuperar seus dados.</p>
          </div>
          <Input
            id="input-confirmar-senha"
            type="password"
            placeholder="Digite sua senha atual"
            value={currentPassword}
            onChange={handleChangePassword}
          />
        </div>
        <div className="modal-footer">
          <Button
            className="btn-white"
            color="default"
            type="button"
            onClick={handleDelete}
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