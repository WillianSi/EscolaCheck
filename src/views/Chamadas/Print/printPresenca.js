import React, { useRef, useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import {
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "services/firebaseConfig.js";

import { Modal, Button, Table, Input } from "reactstrap";
import { FaFilePdf } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import loadingGif from "../../../assets/img/brand/loading.gif";

import jsPDF from "jspdf";
import "jspdf-autotable";

const PrinTurma = (props) => {
  const { isOpen, toggle, uid, turmaId, datas } = props;
  const contentRef = useRef(null);
  const [selectedPresences, setSelectedPresences] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const formattedDate = (dateString, timeString) => {
    const dateObject = new Date(`${dateString}T${timeString}`);
    return dateObject.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  };

  const handleCheckboxChange = (presenceId) => {
    if (selectedPresences.includes(presenceId)) {
      setSelectedPresences(selectedPresences.filter((id) => id !== presenceId));
    } else {
      setSelectedPresences([...selectedPresences, presenceId]);
    }
  };

  const handlePrint = async () => {
    try {
      setLoadingPrint(true);
      const presenceRef = collection(
        firestore,
        `student/${uid}/turmas/${turmaId}/chamada`
      );
      const selectedPresenceDocs = await Promise.all(
        selectedPresences.map(async (presenceId) => {
          const docRef = doc(
            presenceRef.firestore,
            presenceRef.path,
            presenceId
          );
          const docSnapshot = await getDoc(docRef);
          return { id: presenceId, data: docSnapshot.data() };
        })
      );
      const classDocRef = doc(
        collection(presenceRef.firestore, "student", uid, "turmas"),
        turmaId
      );
      const classDocSnapshot = await getDoc(classDocRef);
      const className = classDocSnapshot.data().nome;
      const printInfoArray = selectedPresenceDocs.map(({ id, data }) => ({
        id,
        className,
        date: data.date,
        description: data.description,
        studentsAbsent: data.studentsAbsent,
        studentsPresent: data.studentsPresent,
        time: data.time,
      }));

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
          <h2>Turma: ${className}</h2>
            ${printInfoArray
              .map(
                (classInfo) => `
                <h3>Data : ${classInfo.date}</h3>
                <h3>Descrição: ${classInfo.description}</h3>
                <p>N/O: Não possui observações</p>
                <table>
                  <thead>
                    <tr>
                      <th>Alunos Presentes</th>
                      <th>Alunos Ausentes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <ul>
                          ${classInfo.studentsPresent
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
                          ${classInfo.studentsAbsent
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
                  </tbody>
                </table>
              `
              )
              .join("")}
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
    } catch (error) {
      console.error("Error fetching/printing presence information:", error);
    } finally {
      setLoadingPrint(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const presenceRef = collection(
        firestore,
        `student/${uid}/turmas/${turmaId}/chamada`
      );
      setLoadingPdf(true);
      const selectedPresenceDocs = await Promise.all(
        selectedPresences.map(async (presenceId) => {
          const docRef = doc(
            presenceRef.firestore,
            presenceRef.path,
            presenceId
          );
          const docSnapshot = await getDoc(docRef);
          return { id: presenceId, data: docSnapshot.data() };
        })
      );
      const classDocRef = doc(
        collection(presenceRef.firestore, "student", uid, "turmas"),
        turmaId
      );
      const classDocSnapshot = await getDoc(classDocRef);
      const className = classDocSnapshot.data().nome;
      const pdf = new jsPDF();
      pdf.autoTable({
        didDrawPage: function (data) {
          pdf.setFontSize(18);
          pdf.text(`E.E Virginio Perillo Chamada`, 14, 10);
          pdf.setFontSize(14);
          pdf.text(`Turma: ${className}`, 14, 20);
          pdf.setFontSize(12);
          let startY = 30;
          selectedPresenceDocs.forEach((classInfo, index) => {
            if (index > 0) {
              startY = 20;
              pdf.addPage();
            }
            pdf.text(`Data: ${classInfo.data.date}`, 14, startY);
            startY += 5;
            pdf.text(`Descrição: ${classInfo.data.description}`, 14, startY);
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
            const studentsPresentRows = classInfo.data.studentsPresent
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((studentPresent) => [
                `${studentPresent.nome} - ${
                  studentPresent.observation || "N/O"
                }`,
                "",
              ]);
            const studentsAbsentRows = classInfo.data.studentsAbsent
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((studentAbsent) => [
                "",
                `${studentAbsent.nome} - ${studentAbsent.observation || "N/O"}`,
              ]);
            const maxRowCount = Math.max(
              studentsPresentRows.length,
              studentsAbsentRows.length
            );
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
          });
        },
      });
      pdf.save("Relatorio_de_chamadas.pdf");
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
        <div
          className="modal-body d-flex align-items-center justify-content-center"
          ref={contentRef}
        >
          <Table>
            <tbody>
              {datas.map((presenceItem) => (
                <tr key={presenceItem.id}>
                  <td>{formattedDate(presenceItem.date, presenceItem.time)}</td>
                  <td>
                    <Input
                      id={`checkbox_${presenceItem.id}`}
                      type="checkbox"
                      checked={selectedPresences.includes(presenceItem.id)}
                      onChange={() => handleCheckboxChange(presenceItem.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
                <img src={loadingGif} alt="Loading" className="loading-imgbut" />
              ) : (
                <FiPrinter color="#ffff" size={20} className="mr-1" />
              )}
            </Button>
          </div>
          <Button color="danger" onClick={toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default PrinTurma;