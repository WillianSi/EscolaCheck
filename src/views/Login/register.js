import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "services/firebaseConfig";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";

import Auth from "layouts/Auth.js";
import useAlert from "../../hooks/useAlert.js";
import logoImg from "../../assets/img/brand/logoPrincipal.svg";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { errorMessage, alertColor, alertTitle, showAlert, handleAlert } = useAlert();

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
  const isFormValid = password.length >= 6 && emailPattern.test(email);

  const imageStyle = {
    maxWidth: "60%",
    maxHeight: "100px",
    marginBottom: "15px",
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const createUserDocument = async (uid) => {
    try {
      const userDocRef = doc(db, "student", uid);
      await setDoc(userDocRef, {
        // Add more fields as needed
      });
    } catch (error) {
      handleAlert("Erro ao criar documentos do usuário", "danger", "Erro!");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (isFormValid) {
      if (password === confirmPassword) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            email,
            password
          );

          if (userCredential.user) {
            const uid = userCredential.user.uid;
            const userRef = doc(db, "users", uid);
            try {
              const userSnapshot = await getDoc(userRef);
              if (!userSnapshot.exists()) {
                await createUserDocument(uid);
              }
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            } catch (error) {
              handleAlert(
                "Erro ao verificar o documento do usuário",
                "danger",
                "Erro!"
              );
            }
          }
        } catch (error) {
          handleAlert("Erro ao criar a conta.", "danger", "Erro!");
        }
      } else {
        handleAlert("As senhas não coincidem.", "warning", "Atenção!");
      }
    } else {
      handleAlert(
        "Por favor, insira um e-mail válido e uma senha com pelo menos 6 caracteres.",
        "warning",
        "Atenção!"
      );
    }
  };

  useEffect(() => {
    if (error) {
      handleAlert("E-mail já está cadastrado", "danger", "Erro!");
    }
  }, [error]);

  useEffect(() => {
    if (loading) {
      handleAlert("Criando conta...", "default", "Aguarde:");
    }
  }, [loading]);

  useEffect(() => {
    if (user) {
      handleAlert("Usuário criado.", "success", "Sucesso:");
    }
  }, [user]);

  return (
    <>
      <Auth>
        <Col lg="5" md="7">
          <Card
            style={{ borderRadius: "30px" }}
            className="bg-secondary shadow border-0 bg-image2"
          >
            <CardHeader className="bg-transparent">
              <div className="header-body text-center">
                <img src={logoImg} alt="Logo" style={imageStyle} />
                <h1 className="text-white">Bem-vindo(a)!</h1>
                <p className="text-white">
                  Crie uma conta para conseguir logar no aplicativo!
                </p>
                {showAlert && (
                  <div
                    className="position-absolute top-9 start-50 translate-middle"
                    style={{ maxWidth: "400px", width: "90%" }}
                  >
                    <Alert color={alertColor} className="custom-alert">
                      <strong>{alertTitle}</strong> {errorMessage}
                    </Alert>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody className="px-lg-5 py-lg-3">
              <Form role="form">
                <FormGroup className="mb-3">
                  <InputGroup className="input-group-alternative">
                    <InputGroupText
                      style={{
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0",
                        borderRight: "none",
                      }}
                    >
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                    <Input
                      id="email"
                      placeholder="Email"
                      type="email"
                      autoComplete="new-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                      }}
                    />
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupText
                      style={{
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0",
                        borderRight: "none",
                      }}
                    >
                      <i
                        className="ni ni-lock-circle-open"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: "pointer" }}
                      />
                    </InputGroupText>
                    <Input
                      id="senha"
                      placeholder="Senha"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                      }}
                    />
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupText
                      style={{
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0",
                        borderRight: "none",
                      }}
                    >
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                    <Input
                      id="confirmarSenha"
                      placeholder="Confirmar senha"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                      }}
                    />
                  </InputGroup>
                </FormGroup>

                <div className="text-center">
                  <Button
                    className="my-3"
                    color="default"
                    type="button"
                    onClick={handleSignIn}
                  >
                    Criar
                  </Button>
                </div>
              </Form>

              <Row className="mt-3">
                <Col xs="6">
                  <Link to="/reset" className="text-light">
                    <small>Esqueceu sua senha?</small>
                  </Link>
                </Col>
                <Col className="text-right" xs="6">
                  <Link to="/login" className="text-light">
                    <small>Já possui uma conta!</small>
                  </Link>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Auth>
    </>
  );
};

export default Register;