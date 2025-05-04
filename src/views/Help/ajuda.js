import React from "react";
import { Card, CardBody, Container, Row, Col } from "reactstrap";

import AuthenticatedLayout from "services/AuthenticatedLayout";
import Auth from "layouts/Background.js";
import Header from "components/Headers/Header.js";
import CommonLayout from "layouts/CommonLayout.js";

import { IoIosHelpCircleOutline } from "react-icons/io";

const Ajuda = () => {
  return (
    <>
      <CommonLayout>
        <AuthenticatedLayout>
          <Auth corDeFundo="#98B941">
            <Header />
            <Container className="mt--7" fluid>
              <Row>
                <Col className="order-xl-1" xl="12">
                  <div
                    className="d-flex justify-content-between mb-3"
                    style={{ color: "white", fontSize: "30px" }}
                  >
                    <div className="d-flex align-items-center">
                      <span style={{ marginRight: "8px", marginLeft: "30px" }}>
                        Ajuda
                      </span>
                      <IoIosHelpCircleOutline size={30} />
                    </div>
                  </div>
                  <Card
                    style={{ borderRadius: "30px" }}
                    className="bg-secondary shadow"
                  >
                    <CardBody>
                      <h1
                        className="font-weight-bold mb-2"
                        style={{ fontSize: "2em" }}
                      >
                        Sobre
                        <br />o App
                      </h1>

                      <p>
                        O App visa auxiliar o controle de frequência de alunos,
                        de uma forma fácil, precisa e com relatórios completos e
                        intuitivos, dispensando papéis.
                      </p>
                      <br />
                      <h3 className="font-weight-bold mt-4">
                        Primeiros Passos
                      </h3>

                      <ol>
                        <li>Cadastrar Dados Pessoais</li>
                        <li>Cadastrar Alunos</li>
                        <li>Cadastrar Turmas</li>
                        <li>Cadastrar Alunos nas Turmas</li>
                        <li>Efetuar Chamada marcando os alunos presentes</li>
                      </ol>

                      <h3 className="font-weight-bold mt-4">
                        <a
                          href="https://firebasestorage.googleapis.com/v0/b/presenca-ccbe9.appspot.com/o/help%2FTutorial.pdf?alt=media&token=619baea7-4c4d-40f3-b7ff-7405586c14d2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Tuturial com foto das funções
                        </a>
                      </h3>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </Auth>
        </AuthenticatedLayout>
      </CommonLayout>
    </>
  );
};

export default Ajuda;
