import React, { useState } from "react";
import { Alert, Modal, Button, Form, FormGroup, Input } from "reactstrap";
import { firestore } from "services/firebaseConfig.js";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import {
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

const Adicionar = (props) => {
  const { uid } = useFirebase();
  const alunosRef = collection(firestore, "student", uid, "alunos");

  const [alunos, setAlunos] = useState(props.alunos || []);

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alertColor, setAlertColor] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  const handleAlert = (message, color, title) => {
    setErrorMessage(message);
    setAlertColor(color);
    setAlertTitle(title);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleImportSalve = async () => {
    try {
      setLoading(true);
      for (const aluno of alunos) {
        await addDoc(alunosRef, {
          nome: aluno,
        });
      }

      const alunoTimeRef = doc(
        firestore,
        `student/${uid}/time/alunoTimeDoc`
      );
      await setDoc(alunoTimeRef, { lastModified: new Date().getTime() });
      
      props.handleAlert(
        "Alunos adicionados com sucesso.",
        "success",
        "Sucesso!"
      );
      props.toggle();
    } catch (error) {
      handleAlert(
        "Erro ao adicionar alunos ao banco de dados.",
        "danger",
        "Erro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportStudents = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;

        const rows = content.split("\n").map(row => row.trim());
        const importedNames = rows.map((row) => row.split(",")[0].trim());
        setAlunos(importedNames);
        handleAlert("Arquivo lido com sucesso!", "success", "Sucesso!");
      } catch (error) {
        handleAlert("Erro ao importar dados", "danger", "Erro!");
      }
    };
    // Especifique a codificação para arquivos CSV em português
    reader.readAsText(file, "ISO-8859-1");
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Adicionar alunos"}</h2>
          <button className="close" onClick={props.toggle}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modal-body">
          {showAlert && (
            <Alert color={alertColor}>
              <strong>{alertTitle}</strong> {errorMessage}
            </Alert>
          )}
          <Form>
            <FormGroup className="text-center">
              <h3>Importar Alunos:</h3>
              <h4>Use essa opção para importar alunos para o banco! Serão aceitos somente arquivos do tipo csv</h4>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => handleImportStudents(e.target.files[0])}
              />
            </FormGroup>
          </Form>
        </div>

        <div className="modal-footer">
          <Button
            color="success"
            onClick={handleImportSalve}
            disabled={loading}
          >
            {loading ? "Importando..." : "Importar"}
          </Button>
          <Button color="danger" onClick={props.toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Adicionar;