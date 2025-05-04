import React, { useState, useEffect } from "react";
import { firestore } from "services/firebaseConfig.js";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";

import { Modal, Button, Form, Input, FormGroup } from "reactstrap";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Editar = (props) => {
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!props.isOpen || !props.uid || !props.nomeId) {
      return;
    }
    setNome(props.turmaToEdit);
  }, [props]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const turmaDocRef = doc(
        firestore,
        `student/${props.uid}/turmas/${props.nomeId}`
      );
      const turmaDocSnap = await getDoc(turmaDocRef);
      if (turmaDocSnap.exists()) {
        const existingData = turmaDocSnap.data();
        const updatedData = {
          ...existingData,
          nome: nome,
        };
        await setDoc(turmaDocRef, updatedData);
        const turmaTimeRef = doc(
          firestore,
          `student/${props.uid}/time/turmaTimeDoc`
        );
        await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
        props.handleAlert("Turma editada", "success", "Sucesso!");
        props.toggle();
      } else {
        props.handleAlert("Erro turma não existe", "danger", "Erro!");
      }
    } catch (error) {
      props.handleAlert("Erro ao salvar edição", "danger", "Erro!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Editar nome da turma"}</h2>
          <button className="close" onClick={props.toggle}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          <Form>
            <FormGroup>
              <label
                className="form-control-label text-black"
                htmlFor="input-text"
              >
                Nome:
              </label>
              <Input
                className="form-control-alternative text-black"
                id="input-text"
                placeholder="Nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormGroup>
          </Form>
        </div>
        <div className="modal-footer">
          <Button color="success" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button color="danger" onClick={props.toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Editar;
