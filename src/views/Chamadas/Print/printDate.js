import React, { useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { collection, getDocs } from "firebase/firestore";

import { Modal, Button, FormGroup } from "reactstrap";
import { FaFilePdf } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import loadingGif from "../../../assets/img/brand/loading.gif";

import useFetchClasses from "../../../hooks/class.js";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { firestore } from "services/firebaseConfig";

const PrinTurma = (props) => {
  const { isOpen, toggle, uid } = props;
  const { classes } = useFetchClasses(uid);
  const [turma, setTurma] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const handleClose = () => {
    setTurma("");
    setStartDate("");
    setEndDate("");
    toggle(false);
};

  const handlePrint = async () => {
    setLoadingPrint(true);
    const chamadaRef = collection(
        firestore,
        `student/${uid}/turmas/${turma}/chamada`
    );
    const chamadaSnapshot = await getDocs(chamadaRef);
    const classInfo = {
        classId: turma,
        className: classes.find(classItem => classItem.id === turma)?.nome || '',
        dates: [],
    };
    chamadaSnapshot.forEach((doc) => {
        const { date, description, studentsAbsent, studentsPresent } =
            doc.data();
        // Verifique se a data da chamada está entre startDate e endDate
        const callDate = new Date(date);
        if (callDate >= new Date(startDate) && callDate <= new Date(endDate)) {
            const dateInfo = {
                date,
                description,
                studentsAbsent: studentsAbsent.map((studentAbsent) => ({
                    id: studentAbsent.id,
                    nome: studentAbsent.nome,
                    observation: studentAbsent.observation,
                })),
                studentsPresent: studentsPresent.map((studentPresent) => ({
                    id: studentPresent.id,
                    nome: studentPresent.nome,
                    observation: studentPresent.observation,
                })),
            };
            classInfo.dates.push(dateInfo);
        }
    });

    // Sort dates in ascending order
    classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    const printDocument = `
        <!DOCTYPE html>
        <head>
            <title>E.E Virginio Perillo Chamadas</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                }

                h1, h2, li {
                    margin-bottom: 2px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 5px;
                }

                th, td {
                    border: 1px solid #000;
                    padding: 5px;
                }

                @media print {
                    body {
                        border: 1px solid #000;
                        page-break-after: always;
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <h2>Infromações sobre as Turmas:</h2>
            <h3>${classInfo.className}:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Data da chamada</th>
                        <th>Descrição</th>
                        <th>Alunos Presentes</th>
                        <th>Alunos Ausentes</th>
                    </tr>
                </thead>
                <tbody>
                    ${classInfo.dates
                        .map(
                            (dateInfo) => `
                                <tr>
                                    <td>${dateInfo.date}</td>
                                    <td>${dateInfo.description}</td>
                                    <td>
                                        <ul>
                                            ${dateInfo.studentsPresent
                                                .map(
                                                    (studentPresent) => `
                                                        <li>${studentPresent.nome} - ${
                                                            studentPresent.observation || "N/O"
                                                        }</li>
                                                    `
                                                )
                                                .join("")}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            ${dateInfo.studentsAbsent
                                                .map(
                                                    (studentAbsent) => `
                                                        <li>${studentAbsent.nome} - ${
                                                            studentAbsent.observation || "N/O"
                                                        }</li>
                                                    `
                                                )
                                                .join("")}
                                        </ul>
                                    </td>
                                </tr>
                            `
                        )
                        .join("")}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(printDocument);
    iframe.contentDocument.close();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
    setLoadingPrint(false);
};

const handleGeneratePDF = async () => {
  const allClassesData = [];
  try {
      setLoadingPdf(true);
      const chamadaRef = collection(
          firestore,
          `student/${uid}/turmas/${turma}/chamada`
      );
      const chamadaSnapshot = await getDocs(chamadaRef);

      const classInfo = {
          classId: turma,
          className: classes.find(classItem => classItem.id === turma)?.nome || '',
          dates: [],
      };

      chamadaSnapshot.forEach((doc) => {
          const { date, description, studentsAbsent, studentsPresent } = doc.data();
          // Verifica se a data está dentro do intervalo
          const callDate = new Date(date);
          if (callDate >= new Date(startDate) && callDate <= new Date(endDate)) {
              const dateInfo = {
                  date,
                  description,
                  studentsAbsent: studentsAbsent.map((studentAbsent) => ({
                      id: studentAbsent.id,
                      nome: studentAbsent.nome,
                      observation: studentAbsent.observation,
                  })),
                  studentsPresent: studentsPresent.map((studentPresent) => ({
                      id: studentPresent.id,
                      nome: studentPresent.nome,
                      observation: studentPresent.observation,
                  })),
              };
              dateInfo.studentsPresent.sort((a, b) => a.nome.localeCompare(b.nome));
              dateInfo.studentsAbsent.sort((a, b) => a.nome.localeCompare(b.nome));
              classInfo.dates.push(dateInfo);
          }
      });

      // Sort dates in ascending order
      classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
      allClassesData.push(classInfo);

      const pdf = new jsPDF();
      for (const classInfo of allClassesData) {
          pdf.setFontSize(18);
          pdf.text(`E.E Virginio Perillo Chamada`, 14, 15);
          pdf.setFontSize(14);
          pdf.text(`Turma: ${classInfo.className}`, 14, 25);
          pdf.setFontSize(12);
          let startY = 35;
          for (const dateInfo of classInfo.dates) {
              pdf.text(`Data: ${dateInfo.date}`, 14, startY);
              startY += 5;
              pdf.text(`Descrição: ${dateInfo.description}`, 14, startY);
              startY += 5;
              pdf.text(`N/O: Aluno não possui observações`, 14, startY);
              startY += 5;
              pdf.autoTable({
                  startY,
                  head: [["Alunos Presentes", "Alunos Ausentes"]],
                  body: [],
                  theme: "grid",
                  headStyles: {
                      fillColor: [200, 200, 200],
                      textColor: [0, 0, 0],
                      fontStyle: "bold",
                      halign: "center",
                  },
              });
              startY += 9;
              const detailsTableRows = [];
              const studentsPresentRows = dateInfo.studentsPresent.map((studentPresent) => [
                  `${studentPresent.nome} - ${studentPresent.observation || "N/O"}`,
                  "",
              ]);
              const studentsAbsentRows = dateInfo.studentsAbsent.map((studentAbsent) => [
                  "",
                  `${studentAbsent.nome} - ${studentAbsent.observation || "N/O"}`,
              ]);
              const maxRowCount = Math.max(studentsPresentRows.length, studentsAbsentRows.length);
              for (let i = 0; i < maxRowCount; i++) {
                  detailsTableRows.push([
                      studentsPresentRows[i] ? studentsPresentRows[i][0] : "",
                      studentsAbsentRows[i] ? studentsAbsentRows[i][1] : "",
                  ]);
              }
              pdf.autoTable({
                  startY,
                  head: [],
                  body: detailsTableRows,
                  theme: "grid",
                  columnStyles: {
                      0: { cellWidth: 91 },
                      1: { cellWidth: 91 },
                  },
                  didDrawCell: (cellData) => {
                      const cellText = cellData.cell.text;
                      const isObservationCell = cellText.includes("N/O");
                      if (isObservationCell) {
                          pdf.setTextColor(255, 0, 0);
                      }
                  },
              });
              startY = 20;
              pdf.addPage();
          }
      }
      pdf.save("Relatorio_de_Turmas.pdf");
  } catch (error) {
      console.error("Error fetching data:", error.message);
  } finally {
      setLoadingPdf(false);
  }
};

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Relatório"}</h2>
          <button className="close" onClick={toggle}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="modal-body">
          <FormGroup>
            <label className="form-control-label" htmlFor="select-dropdown">
              Turma:
            </label>
            <select
              className="form-control form-control-alternative"
              id="select-dropdown"
              name="turma"
              value={turma}
              onChange={(e) => {
                setTurma(e.target.value);
              }}
            >
              <option value="">Selecionar</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.nome}
                </option>
              ))}
            </select>
            <label htmlFor="dateInicial" className="form-control-label mt-3">
              Data Inicial:
            </label>
            <input
              id="dateInicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control mr-2"
            />
            <label htmlFor="dateFinal" className="form-control-label mt-3">
              Data Final:
            </label>
            <input
              id="dateFinal"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control mr-2"
            />
          </FormGroup>
        </div>
        <div className="modal-footer">
          <Button
            color="info"
            onClick={handleGeneratePDF}
            disabled={loadingPdf}
          >
            {loadingPdf ? (
              <img src={loadingGif} alt="Loading" className="loading-imgbut" />
            ) : (
              <FaFilePdf color="#ffff" size={20} className="mr-1" />
            )}
          </Button>
          <div className="print-button">
            <Button color="info" onClick={handlePrint} disabled={loadingPrint}>
              {loadingPrint ? (
                <img
                  src={loadingGif}
                  alt="Loading"
                  className="loading-imgbut"
                />
              ) : (
                <FiPrinter color="#ffff" size={20} className="mr-1" />
              )}
            </Button>
          </div>
          <Button color="danger" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default PrinTurma;
