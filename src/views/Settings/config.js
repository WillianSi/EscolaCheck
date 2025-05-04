import React from "react";
import { useNavigate } from "react-router-dom";

import AuthenticatedLayout from "../../services/AuthenticatedLayout.js";
import Header from "components/Headers/Header";
import CommonLayout from "layouts/CommonLayout.js";
import Auth from "layouts/Background.js";

import { CiUser } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import { BiCommentDots } from "react-icons/bi";

import { Button, Card, CardBody, Container, Row, Col, Table } from "reactstrap";

const Config = () => {
  const navigate = useNavigate();

  const handleSettingsButtonClick = () => {
    navigate("/admin/settings");
  };

  const handleSpeakButtonClick = () => {
    window.open("https://www.reclameaqui.com.br/", "_blank");
  };

  return (
    <>
      <AuthenticatedLayout>
        <CommonLayout>
          <Auth corDeFundo="#1C8577">
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
                        Configurações
                      </span>
                    </div>
                  </div>
                  <Card className="cardSy bg-neutral shadow">
                    <CardBody
                      className="text-center"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "100px 0",
                      }}
                    >
                      <Table className="align-items-center" responsive>
                        <tbody>
                          <tr
                            onClick={handleSettingsButtonClick}
                            style={{
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "18px",
                              borderBottom: "2px solid #70DBDB",
                            }}
                          >
                            <td>
                              <CiUser
                                color="#32325d"
                                size={25}
                                className="mr-2"
                              />
                              Meus Dados
                            </td>
                            <td>
                              <Button className="buttonStyle">
                                <IoIosArrowForward color="#32325d" size={20} />
                              </Button>
                            </td>
                          </tr>
                          <tr
                            onClick={handleSpeakButtonClick}
                            style={{
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "18px",
                              borderBottom: "2px solid #70DBDB",
                            }}
                          >
                            <td>
                              <BiCommentDots
                                color="#32325d"
                                size={25}
                                className="mr-2"
                              />
                              Fale conosco
                            </td>
                            <td style={{ width: '50px' }}>
                              <Button className="buttonStyle">
                                <IoIosArrowForward color="#32325d" size={20} />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </Auth>
        </CommonLayout>
      </AuthenticatedLayout>
    </>
  );
};

export default Config;