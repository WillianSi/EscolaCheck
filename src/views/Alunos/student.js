import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "services/firebaseConfig.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import CommonLayout from "layouts/CommonLayout.js";
import Header from "components/Headers/Header";
import Auth from "layouts/Background.js";

import Excluir from "./excluir.js";
import Editar from "./editar.js";
import Print from "./print.js";
import Adicionar from "./adicionar.js";
import useAlert from "../../hooks/useAlert.js";
import Paginations from "../../components/Pagination/paginations.js";

import { FiEdit, FiPrinter } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { TiDeleteOutline } from "react-icons/ti";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import loadingGif from "../../assets/img/brand/loading.gif";

import {
  Alert,
  Button,
  Card,
  Container,
  Col,
  Input,
  Row,
  Table,
} from "reactstrap";

import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

const Student = () => {
  const { uid } = useFirebase();
  const navigate = useNavigate();
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [nomeAluno, setNomeAluno] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [alunoToEdit, setAlunoToEdit] = useState(null);
  const [alunoToDelete, setAlunoToDelete] = useState(null);

  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();

  const [showStudentsTable, setShowStudentsTable] = useState(true);
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [adicionarModalOpen, setAdicionarModalOpen] = useState(false);

  const [loadingAdd, setLoadingAdd] = useState(false);

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = alunos.slice(indexOfFirstItem, indexOfLastItem);
  const currentItem = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleTable = () => {
    setShowStudentsTable((prev) => !prev);
  };

  const toggleExcluirModal = (alunoId, alunoNome) => {
    setExcluirModalOpen(!excluirModalOpen);
    setSelectedId(alunoId);
    setAlunoToDelete(alunoNome);
  };

  const toggleEditarModal = (alunoId, alunoNome) => {
    setEditarModalOpen(!editarModalOpen);
    setSelectedId(alunoId);
    setAlunoToEdit(alunoNome);
  };

  const togglePrintModal = () => {
    setPrintModalOpen(!printModalOpen);
  };

  const handleInputChange = (event) => {
    setNomeAluno(event.target.value);
  };

  const toggleAdicionarModal = (turmaId) => {
    setAdicionarModalOpen(!adicionarModalOpen);
    setSelectedId(turmaId);
  };

  const handlePresencesButtonClick = (turmaId) => {
    navigate(`/admin/chamada/${turmaId}`, { state: { alunos, classes } });
  };

  const handleAdd = async () => {
    if (!nomeAluno) {
      handleAlert("Preencha o campo obrigatório.", "info", "Atenção!");
      return;
    }

    try {
      setLoadingAdd(true);
      const alunosRef = collection(firestore, `student/${uid}/alunos`);
      await addDoc(alunosRef, {
        nome: nomeAluno,
      });
      const alunoTimeRef = doc(
        firestore,
        `student/${uid}/time/alunoTimeDoc`
      );
      await setDoc(alunoTimeRef, { lastModified: new Date().getTime() });

      setNomeAluno("");
      handleAlert("Adicionado com sucesso.", "success", "Sucesso!");
    } catch (error) {
      handleAlert(
        "Erro ao adicionar aluno ao banco de dados.",
        "danger",
        "Erro"
      );
    } finally {
      setLoadingAdd(false);
    }
  };

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
                        Alunos
                      </span>
                      <HiOutlineUserGroup size={30} />
                    </div>
                    <div>
                      <Button
                        color="success"
                        onClick={toggleAdicionarModal}
                        className="buttonStyle"
                        style={{ zIndex: 1 }}
                      >
                        <FaFileUpload color="white" size={30} />
                      </Button>

                      <Button
                        color="info"
                        onClick={togglePrintModal}
                        className="buttonStyle"
                        style={{
                          color: "white",
                          marginRight: "20px",
                          zIndex: 1,
                        }}
                      >
                        <FiPrinter size={30} />
                      </Button>
                    </div>
                  </div>
                  <Card className="bg-neutral shadow cardSy">
                    <div className="floating-alert">
                      {showAlert && (
                        <Alert color={alertColor}>
                          <strong>{alertTitle}</strong> {errorMessage}
                        </Alert>
                      )}
                    </div>
                    <Row className="mb-3 mt-3">
                      <Col xs="9" className="pr-0">
                        <Input
                          id="input-text"
                          type="text"
                          placeholder="Nome do Aluno"
                          className="inputStyle"
                          value={nomeAluno}
                          onChange={handleInputChange}
                        />
                      </Col>
                      <Col xs="auto" className="pl-3">
                        <Button
                          color="success"
                          onClick={handleAdd}
                          disabled={loadingAdd}
                          className="buttonStyle"
                        >
                          {loadingAdd ? (
                            <img
                              src={loadingGif}
                              alt="Loading"
                              className="loading-img"
                            />
                          ) : (
                            <IoAddCircleOutline color="green" size={35} />
                          )}
                        </Button>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-center">
                      <Button
                        onClick={toggleTable}
                        style={{
                          width: "180px",
                          margin: "10px",
                          backgroundColor: "#485E88",
                          color: "white",
                        }}
                      >
                        {showStudentsTable
                          ? "Mostrar Alunos"
                          : "Mostrar Turmas"}
                      </Button>
                    </div>

                    {!showStudentsTable && (
                      <>
                        <Table className="align-items-center" responsive>
                          <thead className="thead-neutral">
                            <tr>
                              <th scope="col" style={{ width: "70%" }}></th>
                              <th scope="col" />
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.map((aluno, index) => (
                              <tr key={index} className="table-row">
                                <td>
                                  <CiUser
                                    color="#5e72e4"
                                    size={20}
                                    className="mr-2"
                                  />
                                  {aluno.nome}
                                </td>
                                <td>
                                  <Button
                                    className="buttonStyle"
                                    onClick={() => {
                                      toggleEditarModal(aluno.id, aluno.nome);
                                    }}
                                  >
                                    <FiEdit color="green" size={20} />
                                  </Button>{" "}
                                  <Button
                                    className="buttonStyle"
                                    onClick={() => {
                                      toggleExcluirModal(aluno.id, aluno.nome);
                                    }}
                                  >
                                    <TiDeleteOutline color="red" size={25} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Paginations
                          itemsPerPage={itemsPerPage}
                          totalItems={alunos.length}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                        />
                      </>
                    )}
                    {showStudentsTable && (
                      <>
                        <Table className="align-items-center" responsive>
                          <tbody>
                            {currentItem.map((turma) => (
                              <tr
                                key={turma.id}
                                onClick={() =>
                                  handlePresencesButtonClick(turma.id)
                                }
                                style={{
                                  cursor: "pointer",
                                  textAlign: "left",
                                  fontSize: "18px",
                                  borderBottom: "2px solid #70DBDB",
                                }}
                              >
                                <td>
                                  <HiOutlineUserGroup
                                    color="#32325d"
                                    size={25}
                                    className="mr-4"
                                  />
                                  {turma.nome}
                                </td>
                                <td style={{ width: "50px" }}>
                                  <Button className="buttonStyle">
                                    <IoIosArrowForward
                                      color="#32325d"
                                      size={20}
                                    />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Paginations
                          itemsPerPage={itemsPerPage}
                          totalItems={classes.length}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                        />
                      </>
                    )}
                  </Card>
                  <div className="container mt-5"></div>
                </Col>
              </Row>
            </Container>
          </Auth>
        </CommonLayout>
        <Adicionar
          isOpen={adicionarModalOpen}
          toggle={toggleAdicionarModal}
          turmaId={selectedId}
          uid={uid}
          handleAlert={handleAlert}
        />
        <Editar
          isOpen={editarModalOpen}
          toggle={toggleEditarModal}
          handleAlert={handleAlert}
          nomeId={selectedId}
          alunoToEdit={alunoToEdit}
          uid={uid}
        />
        <Excluir
          isOpen={excluirModalOpen}
          toggle={toggleExcluirModal}
          nomeId={selectedId}
          alunoToDelete={alunoToDelete}
          uid={uid}
          handleAlert={handleAlert}
        />
        <Print
          data={alunos}
          isOpen={printModalOpen}
          toggle={togglePrintModal}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default Student;
