import React, { useState } from "react";
import Header from "components/Headers/Header";
import { Card, CardBody, Container, Row, Col, Button } from "reactstrap";
import { FiPrinter } from "react-icons/fi";
import Auth from "layouts/Background.js";
import BarChart from "./barChart.js";
import Doughnuts from "./doughnuts.js";
import PrinTurma from "./Print/printTurma.js";
import { useFirebase } from "../../services/FirebaseProvider.js";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";

const Graphic = () => {
  const { uid } = useFirebase();
  const [isDoughnuts, setIsDoughnuts] = useState(true);
  const [prinTurmaModalOpen, setPrinTurmaModalOpen] = useState(false);

  const toggleChart = () => {
    setIsDoughnuts((prev) => !prev);
  };

  const togglePrinTurmaModal = () => {
    setPrinTurmaModalOpen((prev) => !prev);
  };

  const handlePrint = async () => {
      togglePrinTurmaModal();
  };

  return (
    <>
    <AuthenticatedLayout>
      <Auth corDeFundo="#8ED8F8">
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
                    Relatórios
                  </span>
                </div>
                <div>
                  <Button
                    color="info"
                    className="buttonStyle"
                    style={{
                      color: "white",
                      marginRight: "20px",
                      zIndex: 1,
                    }}
                    onClick={handlePrint}
                  >
                    <FiPrinter size={30} />
                  </Button>
                </div>
              </div>
              <Card
                style={{ borderRadius: "30px", overflow: "hidden" }}
                className="bg-secondary shadow"
              >
                <CardBody className="text-center" id="chart-container">
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ marginLeft: "75px" }}>Aluno</span>
                    <input
                      id="switch-shadow"
                      className="switch switch-shadow"
                      type="checkbox"
                      onChange={toggleChart}
                      checked={isDoughnuts}
                    />
                    <label
                      htmlFor="switch-shadow"
                      className="switch-label"
                    ></label>
                    <span style={{ marginRight: "75px" }}>Turma</span>
                  </div>
                  {isDoughnuts ? <BarChart /> : <Doughnuts />}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </Auth>
      <PrinTurma
        uid={uid}
        isOpen={prinTurmaModalOpen}
        toggle={togglePrinTurmaModal}
      />
      </AuthenticatedLayout>
    </>
  );
};

export default Graphic;
