import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../../services/FirebaseProvider.js";
import { firestore } from "services/firebaseConfig.js";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";

import Observ from "./observation.js";

import Auth from "layouts/Background.js";
import Header from "components/Headers/Header";
import CommonLayout from "layouts/CommonLayout.js";
import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import useAlert from "../../hooks/useAlert.js";

import {
  Alert,
  Card,
  Container,
  Row,
  Col,
  Table,
  Button,
  Input,
} from "reactstrap";
import { BiCommentDots } from "react-icons/bi";
import { CiUser } from "react-icons/ci";
import { VscSaveAs } from "react-icons/vsc";
import loadingGif from "../../assets/img/brand/loading.gif";

import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

const formatTime = (date) => {
  return `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${
    (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
  }`;
};

const Call = () => {
  const { uid } = useFirebase();
  const { turmaId } = useParams();
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [selectedId, setSelectedId] = useState(null);

  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
  );
  const [time, setTime] = useState(formatTime(new Date()));
  const [description, setDescription] = useState("");

  const [studentNamesByIds, setStudentNamesByIds] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [observationsMap, setObservationsMap] = useState({});
  const [observModalOpen, setObservModalOpen] = useState(false);

  const [observation] = useState("");
  const [alunoId] = useState("");

  const [loading, setLoading] = useState(false);

  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();

  const toggleObservModal = (alunoId) => {
    setObservModalOpen(!observModalOpen);
    setSelectedId(alunoId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (classes && classes.length > 0 && alunos && alunos.length > 0) {
          const specificClass = classes.find((cls) => cls.id === turmaId);

          if (specificClass) {
            const studentIds = specificClass.alunos || [];

            const namesByIds = studentIds.map((studentId) => {
              const student = alunos.find((aluno) => aluno.id === studentId);
              const studentName = student
                ? student.nome
                : "Aluno cadastrado na turma não foi encontrado";
              return { id: studentId, nome: studentName };
            });
            setStudentNamesByIds(namesByIds);
          }
        }
      } catch (error) {
        handleAlert("Ao buscar dados", "danger", "Error! ");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, turmaId, classes, alunos]);

  async function updateChamadaTime(uid, turmaId, date) {
    const chamdaTimeRef = doc(firestore, `student/${uid}/time/chamadaTimeDoc`);
    const query = await getDoc(chamdaTimeRef);

    if (query.exists()) {
      const chamadaData = query.data();
      const updatedArray = chamadaData.array.map((item) => {
        if (item.turmaId === turmaId) {
          return { ...item, date: date };
        }
        return item;
      });
      if (!updatedArray.some((item) => item.turmaId === turmaId)) {
        updatedArray.push({ turmaId: turmaId, date: date });
      }
      await setDoc(chamdaTimeRef, { array: updatedArray });
    } else {
      await setDoc(chamdaTimeRef, {
        array: [{ turmaId: turmaId, date: date }],
      });
    }
  }

  const handleAdd = async () => {
    setLoading(true);
    const chamadaRef = collection(
      firestore,
      `student/${uid}/turmas/${turmaId}/chamada`
    );
    const allStudentIds = studentNamesByIds.map((aluno) => aluno.id);
    const nonSelectedStudents = allStudentIds.filter(
      (studentId) => !selectedStudents.includes(studentId)
    );
    const selectedStudentsData = studentNamesByIds.filter((aluno) =>
      selectedStudents.includes(aluno.id)
    );
    const dataToSave = {
      date: date,
      time: time,
      description: description,
      studentsAbsent: selectedStudentsData.map((aluno) => ({
        id: aluno.id,
        nome: aluno.nome,
        observation: observationsMap[aluno.id] || "",
      })),
      studentsPresent: nonSelectedStudents.map((studentId) => ({
        id: studentId,
        nome: studentNamesByIds.find((aluno) => aluno.id === studentId).nome,
        observation: observationsMap[studentId] || "",
      })),
    };
    try {
      await addDoc(chamadaRef, dataToSave);
      updateChamadaTime(uid, turmaId, date);
      handleAlert("Chamada salva com sucesso.");
      setDate(
        new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Sao_Paulo",
        })
      );
      setTime(formatTime(new Date()));
      setDescription("");
      setSelectedStudents([]);
      setObservationsMap({});
    } catch (e) {
      handleAlert("Ao salvar chamada", "danger", "Error! ");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (alunoId) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(alunoId)) {
        return prevSelected.filter((id) => id !== alunoId);
      } else {
        return [...prevSelected, alunoId];
      }
    });
  };

  const sortedStudents = [...studentNamesByIds].sort((a, b) => {
    return a.nome.localeCompare(b.nome, "en-US", {
      sensitivity: "base",
      numeric: true,
    });
  });

  return (
    <>
      <AuthenticatedLayout>
        <CommonLayout>
          <Auth corDeFundo="#485E88">
            <Header />
            <Container className="mt--7" fluid>
              <Row className="justify-content-center">
                <Col className="order-xl-1" xl="12">
                  <div
                    className="d-flex justify-content-between mb-3"
                    style={{ color: "white", fontSize: "30px" }}
                  >
                    <div className="d-flex align-items-center">
                      <span style={{ marginRight: "8px", marginLeft: "30px" }}>
                        Chamada
                      </span>
                    </div>
                    <div>
                      <Button
                        color="success"
                        onClick={() => handleAdd(alunoId, observation)}
                        disabled={loading}
                        style={{
                          marginRight: "10px",
                          fontSize: "14px",
                          padding: "8px 16px",
                          zIndex: 1,
                        }}
                      >
                        {loading ? (
                          <img
                            src={loadingGif}
                            alt="Loading"
                            className="loading-imgbut"
                          />
                        ) : (
                          <VscSaveAs color="#ffff" size={20} className="mr-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Card className="cardSy bg-neutral shadow">
                    <div className="floating-alert">
                      {showAlert && (
                        <Alert color={alertColor}>
                          <strong>{alertTitle}</strong> {errorMessage}
                        </Alert>
                      )}
                    </div>
                    <Row className="mb-3 mt-3">
                      <Col xs="6" className="pr-0">
                        <Input
                          id="date"
                          type="date"
                          placeholder="Data"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="inputStyle"
                        />
                      </Col>
                      <Col xs="4" className="pr-0">
                        <Input
                          id="time"
                          type="time"
                          placeholder="Hora"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="inputStyle"
                        />
                      </Col>
                      <Col xs="auto" className="pl-3">
                        <Input
                          id="description"
                          type="text"
                          placeholder="Descrição"
                          className="inputStyle"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Col>
                    </Row>

                    <Table responsive>
                      <tbody>
                        {sortedStudents.map((aluno, index) => (
                          <tr key={index} className="table-row">
                            <td className="text-left">
                              <Input
                                id={`checkbox-${aluno.id}`}
                                type="checkbox"
                                checked={selectedStudents.includes(aluno.id)}
                                onChange={() => handleCheckboxChange(aluno.id)}
                              />
                              <label
                                htmlFor={`checkbox-${aluno.id}`}
                                style={{ marginLeft: "15px" }}
                              >
                                <CiUser
                                  color="#5e72e4"
                                  size={20}
                                  className="mr-2"
                                />
                                {aluno.nome}
                              </label>
                            </td>
                            <td className="text-right">
                              <Button
                                className="buttonStyle"
                                onClick={() => {
                                  toggleObservModal(aluno.id);
                                }}
                              >
                                <BiCommentDots color="#5e72e4" size={25} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                  <div className="container mt-5"></div>
                </Col>
              </Row>
            </Container>
          </Auth>
        </CommonLayout>
        <Observ
          isOpen={observModalOpen}
          toggle={toggleObservModal}
          alunoId={selectedId}
          observationsMap={observationsMap}
          onObservationSave={(data) => {
            setObservationsMap((prevMap) => ({
              ...prevMap,
              [data.alunoId]: data.observation,
            }));
            toggleObservModal();
          }}
          uid={uid}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default Call;
