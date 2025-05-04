import React, { useState, useEffect } from "react";
import { Alert, Modal, Button, Form, FormGroup, Input } from "reactstrap";
import { firestore } from "services/firebaseConfig.js";

import { PiStudentFill } from "react-icons/pi";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import {
  collection,
  updateDoc,
  doc,
  addDoc,
  setDoc,
} from "firebase/firestore";

import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

const Adicionar = (props) => {
  const { uid } = useFirebase();
  const turmaId = props.turmaId;
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  
  const [alunosTur, setAlunosTur] = useState(props.alunos || []);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [, setInitialSelectedStudentIds] = useState([]);
  const [addMethod, setAddMethod] = useState("manual");
  const [matchingStudents, setMatchingStudents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
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

  const handleInfo = (message, color, title) => {
    setErrorMessage(message);
    setAlertColor(color);
    setAlertTitle(title);
    setShowAlert(true);
  };

  const handleCheckboxChange = (id) => {
    setSelectedStudentIds((prevSelectedIds) => {
      return prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((studentId) => studentId !== id)
        : [...prevSelectedIds, id];
    });
  };

  useEffect(() => {
    if (props.isOpen) {
      const fetchClassData = async () => {
        try {
          if (!turmaId || !Array.isArray(classes)) {
            return;
          }
          const classData = classes.find(turma => turma.id === turmaId);
  
          if (classData) {
            if (
              classData &&
              Array.isArray(classData.alunos) &&
              classData.alunos.length > 0
            ) {
              setInitialSelectedStudentIds(classData.alunos);
              setSelectedStudentIds(classData.alunos);
            } else {
              setInitialSelectedStudentIds([]);
              setSelectedStudentIds([]);
              handleAlert("A turma não possui alunos", "info", "Aviso");
            }
          } else {
            handleAlert("A turma não foi encontrada", "info", "Aviso!");
          }
        } catch (error) {
          handleAlert(
            "Busca de dados da turma pode ter inconsistencias",
            "warning",
            "Atenção!"
          );
        }
      };
      fetchClassData();
    }
  }, [classes, turmaId, props.isOpen]);

  const handleAddStudents = async () => {
    try {
      setLoadingAdd(true);
      const classRef = doc(collection(firestore, `student/${uid}/turmas`), turmaId);
      if (selectedStudentIds.length === 0) {
        handleAlert(
          "Selecione pelo menos um aluno para adicionar à turma.",
          "info",
          "Atenção!"
        );
        return;
      }
      const updatedAlunos = selectedStudentIds;
      await updateDoc(classRef, { alunos: updatedAlunos });
      const turmaTimeRef = doc(
        firestore,
        `student/${props.uid}/time/turmaTimeDoc`
      );
      await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
      props.handleAlert(
        "Alunos adicionados à turma com sucesso!",
        "success",
        "Sucesso!"
      );
      props.toggle();
    } catch (error) {
      handleAlert("Erro ao salvar edição", "danger", "Erro!");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleImportSalve = async () => {
    try {
      setLoading(true);
      const classRef = doc(collection(firestore, `student/${uid}/turmas`), turmaId);
      const matchingStudentIds = matchingStudents.map((student) => student.id);
      const updatedAlunos = selectedStudentIds.concat(matchingStudentIds);
      await updateDoc(classRef, { alunos: updatedAlunos });
      const turmaTimeRef = doc(
        firestore,
        `student/${props.uid}/time/turmaTimeDoc`
      );
      await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
      props.handleAlert(
        "Alunos adicionados à turma com sucesso!",
        "success",
        "Sucesso!"
      );
      props.toggle();
    } catch (error) {
      handleAlert("Erro ao salvar edição", "danger", "Erro!");
    } finally {
      setLoading(false);
    }
  };

  const handleImportStudents = async (file) => {
    const reader = new FileReader();
  
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        const rows = content.split("\n").map((row) => row.trim());
        const importedNames = rows.map((row) => row.split(",")[0].trim());
  
        const matchingStudents = [];
        const unmatchedNames = [];
  
        alunos.forEach((student) => {
          const existingName = student.nome.trim();
          if (importedNames.includes(existingName)) {
            matchingStudents.push({
              id: student.id,
              nome: existingName,
            });
          }
        });
  
        setMatchingStudents(matchingStudents);
  
        importedNames.forEach((importedName) => {
          const isMatched = matchingStudents.some(
            (student) => student.nome === importedName
          );
          if (!isMatched) {
            unmatchedNames.push(importedName);
          }
        });
  
        if (unmatchedNames.length > 0) {
          handleInfo(
            `Informações não encontradas no banco:\n${unmatchedNames.join(", ")}`,
            "warning",
            "Atenção!"
          );
        }
      } catch (error) {
        handleAlert("Erro ao importar dados", "danger", "Erro!");
      }
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  const handleImportName = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        const rows = content.split("\n").map((row) => row.trim());
        const importedNa = rows.map((row) => row.split(",")[0].trim());
        setAlunosTur(importedNa);
        handleAlert("Arquivo lido com sucesso!", "success", "Sucesso!");
      } catch (error) {
        handleAlert("Erro ao importar dados", "danger", "Erro!");
      }
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  const handleImportEndSalve = async () => {
    try {
      setLoading1(true);
      const alunosRef = collection(firestore, `student/${uid}/alunos`);
      const classRef = doc(collection(firestore, `student/${uid}/turmas`), turmaId);
      let savedIds = [];
      for (const aluno of alunosTur) {
        const docRef = await addDoc(alunosRef, {
          nome: aluno,
        });
        savedIds.push(docRef.id);
      }
      await updateDoc(classRef, {
        alunos: savedIds,
      });
      const alunoTimeRef = doc(
        firestore,
        `student/${uid}/time/alunoTimeDoc`
      );
      const turmaTimeRef = doc(
        firestore,
        `student/${props.uid}/time/turmaTimeDoc`
      );
      await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
      await setDoc(alunoTimeRef, { lastModified: new Date().getTime() });
      props.handleAlert(
        "Alunos adicionados a turma com sucesso.",
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
      setLoading1(false);
    }
  };

  const [selectedInput, setSelectedInput] = useState(null);

  const handleFileChange = (e, inputType) => {
    setSelectedInput(inputType);
    if (inputType === "students") {
      handleImportStudents(e.target.files[0]);
    } else if (inputType === "name") {
      handleImportName(e.target.files[0]);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">
            {"Adicionar alunos à turma"}
          </h2>
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
              <Button
                style={{ marginTop: "15px" }}
                color={addMethod === "manual" ? "primary" : "secondary"}
                onClick={() => setAddMethod("manual")}
              >
                Adicionar <PiStudentFill size={18} />
              </Button>{" "}
              <Button
                style={{ marginTop: "15px" }}
                color={addMethod === "import" ? "primary" : "secondary"}
                onClick={() => setAddMethod("import")}
              >
                Importar <PiStudentFill size={18} />
              </Button>
            </FormGroup>
            {addMethod === "manual" && (
              <FormGroup>
                <h3>Lista de Alunos:</h3>
                <Input
                  id="pesquisar"
                  type="text"
                  placeholder="Pesquisar alunos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginBottom: "10px" }}
                />
                {searchTerm !== "" &&
                  alunos
                    .filter((aluno) =>
                      aluno.nome
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((aluno) => (
                      <div
                        key={aluno.id}
                        style={{
                          alignItems: "center",
                          marginLeft: "20px",
                        }}
                      >
                        <Input
                          id={`checkbox-${aluno.id}`}
                          type="checkbox"
                          checked={selectedStudentIds.includes(aluno.id)}
                          onChange={() => handleCheckboxChange(aluno.id)}
                        />
                        <label
                          htmlFor={`checkbox-${aluno.id}`}
                          style={{ marginLeft: "5px" }}
                        >
                          {aluno.nome}
                        </label>
                      </div>
                    ))}
              </FormGroup>
            )}
            {addMethod === "import" && (
              <FormGroup>
                <div>
                  <h4>Selecione uma opção:</h4>
                  <label>
                    <input
                      id="radioLer"
                      type="radio"
                      name="importOption"
                      value="students"
                      checked={selectedInput === "students"}
                      onChange={() => setSelectedInput("students")}
                    />
                    <span style={{ marginLeft: "10px" }}>Importar:</span>
                  </label>
                  {selectedInput === "students" && (
                    <>
                      <p>
                        Use esta opção se os alunos já estiverem cadastrados no
                        banco! Somente arquivos do tipo CSV serão aceitos.
                      </p>
                      <Input
                        id="fileLer"
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, "students")}
                      />
                    </>
                  )}
                </div>
                <hr style={{ margin: "20px 0" }} />
                <div>
                  <label>
                    <input
                      id="radioSalvar"
                      type="radio"
                      name="importOption"
                      value="name"
                      checked={selectedInput === "name"}
                      onChange={() => setSelectedInput("name")}
                    />
                    <span style={{ marginLeft: "10px" }}>
                      Importar e Salvar:
                    </span>
                  </label>
                  {selectedInput === "name" && (
                    <>
                      <p>
                        Use esta opção se os alunos não estiverem cadastrados no
                        banco! Somente arquivos do tipo CSV serão aceitos.
                      </p>
                      <Input
                        id="fileLerSalvar"
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, "name")}
                      />
                    </>
                  )}
                </div>
              </FormGroup>
            )}
          </Form>
        </div>

        {addMethod === "manual" && (
          <div className="modal-footer">
            <Button
              color="success"
              onClick={handleAddStudents}
              disabled={loadingAdd}
            >
              {loadingAdd ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              color="danger"
              onClick={() => {
                props.toggle();
                setSearchTerm("");
              }}
            >
              Fechar
            </Button>
          </div>
        )}

        {addMethod === "import" && (
          <div className="modal-footer">
            {selectedInput === "name" && (
              <Button
                color="success"
                onClick={handleImportEndSalve}
                disabled={loading1}
              >
                {loading1 ? "Importando..." : "Importar e salvar"}
              </Button>
            )}
            {selectedInput === "students" && (
              <Button
                color="success"
                onClick={handleImportSalve}
                disabled={loading}
              >
                {loading ? "Importando..." : "Importar"}
              </Button>
            )}
            <Button color="danger" onClick={props.toggle}>
              Fechar
            </Button>
          </div>
        )}
      </AuthenticatedLayout>
    </Modal>
  );
};

export default Adicionar;
