import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "services/firebaseConfig";
import { updatePassword, updateEmail } from "firebase/auth";

import AuthenticatedLayout from "services/AuthenticatedLayout";
import { useFirebase } from "services/FirebaseProvider.js";
import Header from "components/Headers/Header.js";
import Auth from "layouts/Background.js";
import useAlert from "../../hooks/useAlert.js";

import Excluir from "./excluir.js";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Alert,
  InputGroupText,
  InputGroup,
} from "reactstrap";

const Settings = () => {
  const { uid } = useFirebase();
  const [user] = useAuthState(auth);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } =
    useAlert();

  const [oldEmail, setOldEmail] = useState("");

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [excluirModalOpen, setExcluirModalOpen] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmail = async (e) => {
    e.preventDefault();

    if (email.trim() === "") {
      handleAlert("Por favor, insira um email.", "info", "Atenção!");
    } else if (!emailPattern.test(email)) {
      handleAlert("Por favor, insira um email válido.", "info", "Atenção!");
    } else {
      try {
        await updateEmail(user, email);
        setOldEmail(email);
        setEmail("");
        handleAlert("Email alterado com sucesso.", "success", "Sucesso!");
      } catch (error) {
        handleAlert("Falha ao alterar email.", "danger", "Erro!");
      }
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      handleAlert(
        "Por favor, insira uma senha com pelo menos 6 caracteres.",
        "info",
        "Atenção!"
      );
    } else if (newPassword !== confirmPassword) {
      handleAlert("As senhas não coincidem.", "warning", "Atenção!");
    } else {
      try {
        await updatePassword(user, newPassword);
        setNewPassword("");
        setConfirmPassword("");
        handleAlert("Senha alterada com sucesso.", "success", "Sucesso!");
      } catch (error) {
        handleAlert("Falha ao alterar senha.", "danger", "Erro!");
      }
    }
  };

  const toggleExcluirModal = () => {
    setExcluirModalOpen(!excluirModalOpen);
  };

  useEffect(() => {
    if (user) {
      setOldEmail(user.email);
    }
  }, [user]);

  return (
    <>
      <AuthenticatedLayout>
        <Auth corDeFundo="#1C8577">
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
                      Configurações
                    </span>
                  </div>
                </div>
                <Card className="cardSy bg-secondary shadow">
                  <CardHeader className="bg-white border-0">
                    <Row className="align-items-center">
                      <Col xs="6">
                        <h3 className="mb-0">Minha conta</h3>
                      </Col>
                      <Col xs="8">
                        <div className="floating-alert">
                          {showAlert && (
                            <Alert color={alertColor}>
                              <strong>{alertTitle}</strong> {errorMessage}
                            </Alert>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <p className="heading-small text-muted">
                        Renove a sessão se encontrar dificuldades ou erros (saia
                        e entre novamente).
                      </p>
                      <h6 className="heading-small text-muted mb-4">
                        Informação do usuário
                      </h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-email"
                              >
                                Endereço de email atual
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="input-email"
                                type="email"
                                value={oldEmail}
                                disabled
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-new-email"
                              >
                                Novo endereço de email
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="input-new-email"
                                placeholder="email@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Button color="default" onClick={handleEmail}>
                          Mudar email
                        </Button>
                      </div>
                    </Form>
                    <Form>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">Senha</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-username"
                              ></label>
                              <Input
                                id="input-username"
                                type="text"
                                autoComplete="username"
                                style={{ display: "none" }}
                              />
                              <label
                                className="form-control-label"
                                htmlFor="input-senha"
                              >
                                Nova senha
                              </label>
                              <InputGroup className="input-group-alternative">
                                <InputGroupText>
                                  <i
                                    className="ni ni-lock-circle-open"
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: "pointer" }}
                                  />
                                </InputGroupText>
                                <Input
                                  id="input-senha"
                                  placeholder="Nova senha"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  value={newPassword}
                                  onChange={(e) =>
                                    setNewPassword(e.target.value)
                                  }
                                />
                              </InputGroup>
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-confirmar-senha"
                              >
                                Confirmar nova senha
                              </label>
                              <InputGroup className="input-group-alternative">
                                <InputGroupText>
                                  <i className="ni ni-lock-circle-open" />
                                </InputGroupText>
                                <Input
                                  id="input-confirmar-senha"
                                  placeholder="Confirmar senha"
                                  type="password"
                                  autoComplete="new-password"
                                  value={confirmPassword}
                                  onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                  }
                                />
                              </InputGroup>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Button color="default" onClick={handlePassword}>
                          Mudar senha
                        </Button>
                      </div>
                    </Form>
                    <Form>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">
                        Excluir conta
                      </h6>
                      <div className="pl-lg-4">
                        <Button color="danger" onClick={toggleExcluirModal}>
                          Excluir conta
                        </Button>
                      </div>
                      <hr className="my-2" />
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </Auth>
        <Excluir
          isOpen={excluirModalOpen}
          toggle={toggleExcluirModal}
          uid={uid}
          handleAlert={handleAlert}
        />
      </AuthenticatedLayout>
    </>
  );
};

export default Settings;
