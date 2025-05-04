import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../../services/FirebaseProvider.js";

import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import CommonLayout from "layouts/CommonLayout.js";
import Header from "components/Headers/Header";
import Auth from "layouts/Background.js";

import Excluir from "./excluir.js";
import Remover from "./remover.js";
import Editar from "./editar.js";
import Transfer from "./transfer.js";
import useAlert from "../../hooks/useAlert.js";
import Paginations from "../../components/Pagination/paginations.js";

import { FiEdit } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";
import { CiUser } from "react-icons/ci";
import { IoPersonRemove } from "react-icons/io5";
import { PiUserSwitchFill } from "react-icons/pi";

import { Alert, Button, Card, Container, Col, Row, Table } from "reactstrap";

import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

const Student = () => {
  const { uid } = useFirebase();
  const { turmaId } = useParams();
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [className, setClassName] = useState("");
  const [studentNamesByIds, setStudentNamesByIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [alunoToEdit, setAlunoToEdit] = useState(null);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [alunoToRemove, setAlunoToRemove] = useState(null);
  const [alunoToTransfer, setAlunoToTransfer] = useState(null);

  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();

  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [removerModalOpen, setRemoverModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);

  const sortedAlunos = [...studentNamesByIds].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  const [transferModalOpen, setTransferOpen] = useState(false);

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAlunos.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleExcluirModal = (alunoId, alunoNome) => {
    setExcluirModalOpen(!excluirModalOpen);
    setSelectedId(alunoId);
    setAlunoToDelete(alunoNome);
  };

  const toggleRemoverModal = (alunoId, alunoNome) => {
    setRemoverModalOpen(!removerModalOpen);
    setSelectedId(alunoId);
    setAlunoToRemove(alunoNome);
  };

  const toggleTransferModal = (alunoId, alunoNome) => {
    setTransferOpen(!transferModalOpen);
    setSelectedId(alunoId);
    setAlunoToTransfer(alunoNome);
  };

  const toggleEditarModal = (alunoId, alunoNome) => {
    setEditarModalOpen(!editarModalOpen);
    setSelectedId(alunoId);
    setAlunoToEdit(alunoNome);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (classes && alunos) {
          const specificClass = classes.find(
            (classItem) => classItem.id === turmaId
          );
          if (specificClass) {
            const studentIds = specificClass.alunos || [];

            const namesByIds = studentIds.map((studentId) => {
              const student = alunos.find((aluno) => aluno.id === studentId);
              return { id: studentId, nome: student ? student.nome : "N/A" };
            });

            namesByIds.sort((a, b) => a.nome.localeCompare(b.nome));
            setStudentNamesByIds(namesByIds);
            setClassName(specificClass.nome);
          }
        }
      } catch (error) {
        handleAlert("Ao buscar dados", "danger", "Error! ");
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, turmaId, alunos, classes]);

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
                      Alunos - {className}
                    </span>
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
                                  toggleRemoverModal(aluno.id, aluno.nome);
                                }}
                              >
                                <IoPersonRemove color="orange" size={20} />
                              </Button>{" "}
                              <Button
                                className="buttonStyle"
                                onClick={() => {
                                  toggleTransferModal(aluno.id, aluno.nome);
                                }}
                              >
                                <PiUserSwitchFill
                                  color="blue"
                                  size={25}
                                />
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
                      totalItems={sortedAlunos.length}
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
        <Editar
          isOpen={editarModalOpen}
          toggle={toggleEditarModal}
          handleAlert={handleAlert}
          nomeId={selectedId}
          alunoToEdit={alunoToEdit}
          uid={uid}
        />
        <Remover
          isOpen={removerModalOpen}
          toggle={toggleRemoverModal}
          nomeId={selectedId}
          alunoToRemove={alunoToRemove}
          turmaId={turmaId}
          uid={uid}
          handleAlert={handleAlert}
        />
        <Excluir
          isOpen={excluirModalOpen}
          toggle={toggleExcluirModal}
          nomeId={selectedId}
          alunoToDelete={alunoToDelete}
          uid={uid}
          handleAlert={handleAlert}
        />
        <Transfer
          uid={uid}
          nomeId={selectedId}
          turmaId={turmaId}
          alunoToTransfer={alunoToTransfer}
          handleAlert={handleAlert}
          isOpen={transferModalOpen}
          toggle={toggleTransferModal}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default Student;