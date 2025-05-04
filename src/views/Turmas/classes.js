import React, { useState } from "react";
import { firestore } from "services/firebaseConfig.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import {
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import Header from "components/Headers/Header";
import CommonLayout from "layouts/CommonLayout.js";
import Auth from "layouts/Background.js";
import useAlert from "../../hooks/useAlert.js";

import Excluir from "./excluir.js";
import Editar from "./editar.js";
import Adicionar from "./adicionar.js";
import Print from "./print.js";
import Paginations from "../../components/Pagination/paginations.js";

import { FiEdit, FiPrinter } from "react-icons/fi";
import { PiUserList } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { TiDeleteOutline } from "react-icons/ti";
import { IoAddCircleOutline } from "react-icons/io5";

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

import useFetchClasses from "../../hooks/class.js";

const Classes = () => {
  const { uid } = useFirebase();
  const { classes } = useFetchClasses(uid);
  const [nomeTurma, setNomeTurma] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [turmaToEdit, setTurmaToEdit] = useState(null);
  const [turmaToDelete, setTurmaToDelete] = useState(null);

  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [adicionarModalOpen, setAdicionarModalOpen] = useState(false);
  const [prinTurmaModalOpen, setPrinTurmaModalOpen] = useState(false);;

  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleExcluirModal = (turmaId, turmaNome) => {
    setExcluirModalOpen(!excluirModalOpen);
    setSelectedId(turmaId);
    setTurmaToDelete(turmaNome);
  };

  const toggleEditarModal = (turmaId, turmaNome) => {
    setEditarModalOpen(!editarModalOpen);
    setSelectedId(turmaId);
    setTurmaToEdit(turmaNome);
  };

  const toggleAdicionarModal = (turmaId) => {
    setAdicionarModalOpen(!adicionarModalOpen);
    setSelectedId(turmaId);
  };

  const togglePrinTurmaModal = () => {
    setPrinTurmaModalOpen(!prinTurmaModalOpen);
  };

  const handleAdd = async () => {
    if (!nomeTurma) {
      handleAlert("Preencha o campo obrigatório.", "info", "Atenção!");
      return;
    }

    try {
      const classRef = collection(firestore, `student/${uid}/turmas`);
      await addDoc(classRef, {
        nome: nomeTurma,
      });
      const turmaTimeRef = doc(
        firestore,
        `student/${uid}/time/turmaTimeDoc`
      );
      await setDoc(turmaTimeRef, { lastModified: new Date().getTime() });
      setNomeTurma("");
      handleAlert("Adicionado com sucesso.", "success", "Sucesso!");
    } catch (error) {
      handleAlert(
        "Erro ao adicionar turma ao banco de dados.",
        "danger",
        "Erro"
      );
    }
  };

  const handleInputChange = (event) => {
    setNomeTurma(event.target.value);
  };

  return (
    <>
      <AuthenticatedLayout>
        <CommonLayout>
          <Auth corDeFundo="#B6BDAB">
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
                        Turmas
                      </span>
                      <HiOutlineUserGroup size={30} />
                    </div>
                    <div>
                      <Button
                        color="info"
                        onClick={togglePrinTurmaModal}
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
                  <Card className="cardSy bg-neutral shadow">
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
                          id="nome"
                          type="text"
                          placeholder="Nome da turma"
                          className="inputStyle"
                          value={nomeTurma}
                          onChange={handleInputChange}
                        />
                      </Col>
                      <Col xs="auto" className="pl-3">
                        <Button
                          color="success"
                          onClick={handleAdd}
                          className="buttonStyle"
                        >
                          <IoAddCircleOutline color="green" size={35} />
                        </Button>
                      </Col>
                    </Row>
                    <Table className="align-items-center" responsive>
                      <thead className="thead-neutral">
                        <tr>
                          <th scope="col" style={{ width: "70%" }}></th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((turma) => (
                          <tr key={turma.id} className="table-row">
                            <td>{turma.nome}</td>
                            <td>
                            <Button
                                className="buttonStyle"
                                onClick={() => {
                                  toggleEditarModal(turma.id, turma.nome);
                                }}
                              >
                              <FiEdit color="green" size={20} />
                              </Button>{" "}
                              <Button
                                className="buttonStyle"
                                onClick={() => {
                                  toggleAdicionarModal(turma.id);
                                }}
                              >
                                <PiUserList color="blue" size={25} />
                              </Button>{" "}
                              <Button
                                className="buttonStyle"
                                onClick={() => {
                                  toggleExcluirModal(turma.id, turma.nome);
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
                      totalItems={classes.length}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
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
          turmaToEdit={turmaToEdit}
          uid={uid}
        />
        <Excluir
          isOpen={excluirModalOpen}
          toggle={toggleExcluirModal}
          turmaId={selectedId}
          turmaToDelete={turmaToDelete}
          uid={uid}
          handleAlert={handleAlert}
        />
        <Print
          uid={uid}
          isOpen={prinTurmaModalOpen}
          toggle={togglePrinTurmaModal}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default Classes;