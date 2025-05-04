import React, { useRef, useState, useEffect } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { collection, getDocs } from "firebase/firestore";

import { Modal, Button, Table, Input } from "reactstrap";
import { FaFilePdf } from "react-icons/fa6";
import { FiPrinter } from "react-icons/fi";
import loadingGif from "../../../assets/img/brand/loading.gif";

import useFetchClasses from "../../../hooks/class.js";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { firestore } from "services/firebaseConfig";

const PrinTurma = (props) => {
  const { isOpen, toggle, uid } = props;
  const contentRef = useRef(null);
  const { classes } = useFetchClasses(uid);
  const [classData, setClassData] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const classNames = classes.map(cls => ({
        id: cls.id,
        nome: cls.nome,
      }));
  
      setClassData(classNames);
    }
  }, [isOpen, classes]);

  const handleCheckboxChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handlePrint = async () => {
    setLoadingPrint(true);
    const allClassesData = [];
  
    for (const classItem of classData) {
      if (selectedClasses.includes(classItem.id)) {
        const chamadaRef = collection(
          firestore,
          `student/${uid}/turmas/${classItem.id}/chamada`
        );
        const chamadaSnapshot = await getDocs(chamadaRef);
        const classInfo = {
          classId: classItem.id,
          className: classItem.nome,
          dates: [],
        };
        chamadaSnapshot.forEach((doc) => {
          const { date, description, studentsAbsent, studentsPresent } =
            doc.data();
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
        });
  
        // Sort dates in ascending order
        classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
  
        allClassesData.push(classInfo);
      }
    }
  
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
        ${allClassesData
          .map(
            (classInfo) => `
          <h3>${classInfo.className}:</h3>
          <p>N/O: Não possui observações</p>
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
    setLoadingPrint(false);
  };  

  const handleGeneratePDF = async () => {
    const allClassesData = [];
    try {
      setLoadingPdf(true);
      for (const classItem of classData) {
        if (selectedClasses.includes(classItem.id)) {
          const chamadaRef = collection(
            firestore,
            `student/${uid}/turmas/${classItem.id}/chamada`
          );
          const chamadaSnapshot = await getDocs(chamadaRef);
          const classInfo = {
            classId: classItem.id,
            className: classItem.nome,
            dates: [],
          };
          chamadaSnapshot.forEach((doc) => {
            const { date, description, studentsAbsent, studentsPresent } = doc.data();
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
          });
          // Sort dates in ascending order
          classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
          allClassesData.push(classInfo);
        }
      }
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
        <div
          className="modal-body d-flex align-items-center justify-content-center"
          ref={contentRef}
        >
          <Table>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.nome}</td>
                  <td>
                    <Input
                      id={`checkbox_${classItem.id}`}
                      type="checkbox"
                      checked={selectedClasses.includes(classItem.id)}
                      onChange={() => handleCheckboxChange(classItem.id)}
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