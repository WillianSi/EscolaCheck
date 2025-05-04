import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button, Form, Input, FormGroup } from "reactstrap";

const Observation = (props) => {
  const [observation, setObservation] = useState("");
  const alunoId = props.alunoId;

  useEffect(() => {
    if (props.isOpen) {
      if (props.observationsMap && props.observationsMap[alunoId]) {
        setObservation(props.observationsMap[alunoId]);
      } else {
        setObservation("");
      }
    }
  }, [alunoId, props.observationsMap, props.isOpen]);

  const handleSave = () => {
    props.onObservationSave({ alunoId, observation });
    setObservation("");
    props.toggle();
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Adicionar observação"}</h2>
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
                Descrição:
              </label>
              <Input
                className="form-control-alternative text-black"
                id="input-text"
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
              />
            </FormGroup>
          </Form>
        </div>
        <div className="modal-footer">
          <Button color="success" onClick={handleSave}>
            Salvar
          </Button>
          <Button color="danger" onClick={props.toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Observation;
