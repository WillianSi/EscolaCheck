import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Form, Container, Row, Col } from "reactstrap";
import {
  ref,
  getStorage,
  listAll,
  getMetadata,
  deleteObject,
} from "firebase/storage";

import AuthenticatedLayout from "../services/AuthenticatedLayout";
import Auth from "layouts/Background.js";
import Header from "components/Headers/Header";

const Index = () => {

  useEffect(() => {
    const checkAndDeleteOldDocuments = async () => {
      const storage = getStorage();
      const storageRef = ref(storage);
      try {
        const files = await listAll(storageRef);
        for (const file of files.items) {
          const metadata = await getMetadata(file);
          const createdDate = new Date(metadata.timeCreated);
          const timeDifference =
            (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
          if (timeDifference > 168) {
            await deleteObject(file);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar e excluir documentos:", error);
      }
    };

    const lastExecutionTimestamp = parseInt(
      localStorage.getItem("lastExecutionTimestamp")
    );
    const now = Date.now();
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;

    if (
      !lastExecutionTimestamp ||
      now - lastExecutionTimestamp >= oneWeekInMillis
    ) {
      checkAndDeleteOldDocuments();
      localStorage.setItem("lastExecutionTimestamp", now.toString());
    }
  }, []);

  const navigate = useNavigate();
  const handleClassesButtonClick = () => {
    navigate("/admin/classes");
  };
  const handleClassButtonClick = () => {
    navigate("/admin/turmas");
  };
  const handleHelpButtonClick = () => {
    navigate("/admin/help");
  };
  const handleConfButtonClick = () => {
    navigate("/admin/cofig");
  };
  const handleReportButtonClick = () => {
    navigate("/admin/graphics");
  };
  const handleStudentButtonClick = () => {
    navigate("/admin/student");
  };

  return (
    <>
      <AuthenticatedLayout>
        <Auth corDeFundo="#D9D9D9">
          <Header />
          <Container className="mt--7" fluid>
            <Row className="justify-content-center">
              <Col className="order-xl-1" xl="12">
                <Card
                  style={{ borderRadius: "30px" }}
                  className="bg-secondary shadow"
                >
                  <CardBody className="text-center">
                    <Row className="mb-3">
                      <Button
                        size="lg"
                        className="w-100 py-4 mb-3 text-lg d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "#1A214A",
                          color: "#ffffff",
                          borderRadius: "20px",
                        }}
                        onClick={handleClassButtonClick}
                      >
                        <div style={{ marginRight: "10px" }}>
                          <span
                            className="bg-image9"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "block",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "1.5rem" }}>Chamada</span>
                      </Button>
                    </Row>
                    <Row className="mb-3">
                      <Button
                        size="lg"
                        className="w-100 py-4 mb-3 text-lg d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "#B6BDAB",
                          color: "#ffffff",
                          borderRadius: "20px",
                        }}
                        onClick={handleClassesButtonClick}
                      >
                        <div style={{ marginRight: "10px" }}>
                          <span
                            className="bg-image8"
                            style={{
                              width: "60px",
                              height: "60px",
                              display: "block",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "1.5rem" }}>Turmas</span>
                      </Button>
                    </Row>
                    <Form>
                      <div>
                        <Row className="mt-2">
                          <Col xs="6">
                            <Button
                              size="lg"
                              className="p-2 mb-3 text-md rounded-2 mx-auto d-flex flex-column align-items-center justify-content-center w-100"
                              style={{
                                backgroundColor: "#8ED8F8",
                                color: "#ffffff",
                                borderRadius: "20px",
                              }}
                              onClick={handleReportButtonClick}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className="bg-image4"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                  }}
                                ></span>
                                <p
                                  style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Relatórios
                                </p>
                              </div>
                            </Button>
                          </Col>
                          <Col xs="6">
                            <Button
                              size="lg"
                              className="p-2 mb-3 text-md rounded-2 mx-auto d-flex flex-column align-items-center justify-content-center w-100"
                              style={{
                                backgroundColor: "#485E88",
                                color: "#ffffff",
                                borderRadius: "20px",
                              }}
                              onClick={handleStudentButtonClick}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className="bg-image5"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                  }}
                                ></span>
                                <p
                                  style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Alunos
                                </p>
                              </div>
                            </Button>
                          </Col>
                          <Col xs="6">
                            <Button
                              size="lg"
                              className="p-2 mb-3 text-md rounded-2 mx-auto d-flex flex-column align-items-center justify-content-center w-100"
                              style={{
                                backgroundColor: "#98B941",
                                color: "#ffffff",
                                borderRadius: "20px",
                              }}
                              onClick={handleHelpButtonClick}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className="bg-image6"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                  }}
                                ></span>
                                <p
                                  style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Ajuda
                                </p>
                              </div>
                            </Button>
                          </Col>
                          <Col xs="6">
                            <Button
                              size="lg"
                              className="p-2 mb-3 text-md rounded-2 mx-auto d-flex flex-column align-items-center justify-content-center w-100"
                              style={{
                                backgroundColor: "#1C8577",
                                color: "#ffffff",
                                borderRadius: "20px",
                              }}
                              onClick={handleConfButtonClick}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className="bg-image7"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                  }}
                                ></span>
                                <p
                                  style={{
                                    marginTop: "10px",
                                    textAlign: "center",
                                  }}
                                >
                                  Configuração
                                </p>
                              </div>
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </Auth>
      </AuthenticatedLayout>
    </>
  );
};

export default Index;