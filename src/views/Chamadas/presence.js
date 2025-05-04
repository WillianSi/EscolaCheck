import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFirebase } from "../../services/FirebaseProvider.js";
import Auth from "layouts/Background.js";
import Header from "components/Headers/Header";
import CommonLayout from "layouts/CommonLayout.js";
import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import useAlert from "../../hooks/useAlert.js";
import useFetchChamada from "../../hooks/date.js";
import useFetchClasses from "../../hooks/class.js"; // Import the useFetchClasses hook
import InfoModal from "./InfoModal.js";
import PrinPresenca from "./Print/printPresenca.js";
import Paginations from "../../components/Pagination/paginations.js";
import { Alert, Card, Container, Row, Col, Table, Button } from "reactstrap";
import { FiPrinter } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";
import { MdOutlineHistoryEdu } from "react-icons/md";

const Presence = () => {
  const { uid } = useFirebase();
  const { turmaId } = useParams();
  const { chamada, existingCalls } = useFetchChamada(uid, turmaId);
  const { classes } = useFetchClasses(uid); // Fetch the classes
  const navigate = useNavigate();
  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } = useAlert();

  const location = useLocation();
  const successMessage = new URLSearchParams(location.search).get("message");

  const [printPersencaModalOpen, setPrintPresencaModalOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (successMessage) {
      handleAlert(successMessage, "success", "Sucesso!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Get class name based on turmaId
    if (classes) {
      const specificClass = classes.find((classItem) => classItem.id === turmaId);
      if (specificClass) {
        setClassName(specificClass.nome);
      }
    }
  }, [successMessage, classes, turmaId, handleAlert]);

  const itemsPerPage = 15;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = chamada.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAdd = (turmaId) => {
    const currentDate = new Date().toISOString().split('T')[0];
    if (currentDate === existingCalls) {
      handleAlert(
        "Já foi feita uma chamada para esta turma hoje.",
        "warning",
        "Atenção!"
      );
      setTimeout(() => {
        navigate(`/admin/callFiq/${turmaId}`);
      }, 3000);
    } else {
      navigate(`/admin/callFiq/${turmaId}`);
    }
  };

  const handleEditCall = (turmaId, presencaId) => {
    navigate(`/admin/editcall/${turmaId}/${presencaId}`);
  };

  const togglePrintPresencaModal = () => {
    setPrintPresencaModalOpen(!printPersencaModalOpen);
  };

  const toggleInfoModal = () => {
    setInfoModal(!infoModal);
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
                      Chamada - {className}
                    </span>
                  </div>
                  <div>
                    <Button
                      color="info"
                      onClick={togglePrintPresencaModal}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "20px",
                    }}
                  >
                    <Button
                      color="default"
                      onClick={() => handleAdd(turmaId)}
                      style={{
                        marginRight: "20px",
                      }}
                    >
                      + Nova
                    </Button>

                    <Button color="default" onClick={toggleInfoModal}>
                      <MdOutlineHistoryEdu color="#ffff" size={25} />
                    </Button>
                  </div>
                  <Table className="align-items-center" responsive>
                    <tbody>
                      {currentItems.map((presence) => {
                        const dateObject = new Date(
                          presence.date + "T" + presence.time
                        );
                        const formattedDate = dateObject.toLocaleDateString(
                          "pt-BR",
                          { timeZone: "America/Sao_Paulo" }
                        );

                        return (
                          <tr
                            key={presence.id}
                            onClick={() => handleEditCall(turmaId, presence.id)}
                            className="table-row"
                          >
                            <td>
                              {" "}
                              <CiCalendar
                                color="#32325d"
                                size={25}
                                className="mr-4"
                              />
                              {formattedDate}
                              {" - "}
                              {presence.time}
                            </td>
                            <td style={{ width: "50px" }}>
                              <Button className="buttonStyle">
                                <IoIosArrowForward color="#32325d" size={20} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <Paginations
                    itemsPerPage={itemsPerPage}
                    totalItems={chamada.length}
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
      <PrinPresenca
        uid={uid}
        turmaId={turmaId}
        datas={chamada}
        isOpen={printPersencaModalOpen}
        toggle={togglePrintPresencaModal}
      />
      <InfoModal
        uid={uid}
        turmaId={turmaId}
        isOpen={infoModal}
        toggle={toggleInfoModal}
      />
    </AuthenticatedLayout>
  );
};

export default Presence;