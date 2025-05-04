import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFirebase } from "../../services/FirebaseProvider.js";
import { firestore } from "../../services/firebaseConfig.js";

import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import Auth from "layouts/Background.js";
import Header from "components/Headers/Header";
import CommonLayout from "layouts/CommonLayout.js";
import useAlert from "../../hooks/useAlert.js";

import { Alert, Card, Container, Row, Col, Table, Button } from "reactstrap";
import { FiCalendar, FiPrinter } from "react-icons/fi";
import { MdOutlineAddTask } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";

import useFetchClasses from "../../hooks/class.js";

import PrinTurma from "./Print/printTurma.js";
import PrinDate from "./Print/printDate.js";
import Paginations from "../../components/Pagination/paginations.js";
import { doc, onSnapshot } from "firebase/firestore";

const Turmas = () => {
  const navigate = useNavigate();
  const { uid } = useFirebase();
  const { classes } = useFetchClasses(uid);
  const location = useLocation();
  const successMessage = new URLSearchParams(location.search).get("message");
  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();
  const [prinTurmaModalOpen, setPrinTurmaModalOpen] = useState(false);
  const [prinDateModalOpen, setPrinDateModalOpen] = useState(false);

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (successMessage) {
      handleAlert(successMessage, "success", "Sucesso!");
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete("message");
      navigate({ search: newSearch.toString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMessage, location.search, navigate]);

  const togglePrinTurmaModal = () => {
    setPrinTurmaModalOpen(!prinTurmaModalOpen);
  };

  const toggleDateModal = () => {
    setPrinDateModalOpen(!prinDateModalOpen);
  };

  const handlePresencesButtonClick = (turmaId) => {
    navigate(`/admin/presence/${turmaId}`);
  };

  const handleAdd = async (turmaId) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const chamadaTimeRef = doc(
        firestore,
        `student/${uid}/time/chamadaTimeDoc`
      );
      const unsubscribe = onSnapshot(chamadaTimeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chamadaData = docSnapshot.data();
          if (
            chamadaData.array &&
            chamadaData.array.some((item) => item.turmaId === turmaId)
          ) {
            const item = chamadaData.array.find(
              (item) => item.turmaId === turmaId
            );
            if (item.date === currentDate) {
              handleAlert(
                "Já foi feita uma chamada para esta turma hoje.",
                "warning",
                "Atenção!"
              );
            } else {
              navigate(`/admin/call/${turmaId}`);
            }
          } else {
            navigate(`/admin/call/${turmaId}`);
          }
        } else {
          unsubscribe();
          navigate(`/admin/call/${turmaId}`);
        }
      });
    } catch (error) {
      handleAlert("Erro ao processar");
    }
  };

  return (
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
                      Chamadas
                    </span>
                  </div>
                  <div>
                    <Button
                      color="info"
                      onClick={toggleDateModal}
                      className="buttonStyle"
                      style={{
                        color: "white",
                        marginRight: "20px",
                        zIndex: 1,
                      }}
                    >
                      <FiCalendar size={30} />
                    </Button>
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
                  <Table className="align-items-center" responsive>
                    <tbody>
                      {currentItems.map((turma) => (
                        <tr key={turma.id} className="table-row">
                          <td onClick={() => handleAdd(turma.id)}>
                            <HiOutlineUserGroup
                              color="#32325d"
                              size={25}
                              className="mr-4"
                            />
                            {turma.nome}
                          </td>
                          <td style={{ width: "50px" }}>
                            <Button
                              onClick={() =>
                                handlePresencesButtonClick(turma.id)
                              }
                              className="buttonStyle"
                            >
                              <MdOutlineAddTask color="#3ab540" size={25} />
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
      <PrinDate uid={uid} isOpen={prinDateModalOpen} toggle={toggleDateModal} />
      <PrinTurma
        uid={uid}
        isOpen={prinTurmaModalOpen}
        toggle={togglePrinTurmaModal}
      />
    </AuthenticatedLayout>
  );
};

export default Turmas;