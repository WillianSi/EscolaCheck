import React, { useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "services/firebaseConfig.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ref,
  getDownloadURL,
  getStorage,
  uploadString,
} from "firebase/storage";
import loadingGif from "../../../assets/img/brand/loading.gif";

import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button, Table, Input } from "reactstrap";

import useFetchAlunos from "../../../hooks/student.js";
import useFetchClasses from "../../../hooks/class.js";

import { FaFilePdf } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FiPrinter } from "react-icons/fi";

const storage = getStorage();

const PrinTurma = (props) => {
  const { isOpen, toggle, uid } = props;
  const contentRef = useRef(null);
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const handleCheckboxChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const data = async (uid, classes, selectedClasses) => {
    const data = alunos;
    const allClassesData = [];
    for (const classItem of classes) {
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
          studentsData: [],
          totalFaltasPor: [],
          totalFaltas: [],
          totalPresencas: [],

          addStudentData: function (
            studentNome,
            countFaltas,
            countPresencas,
            porcentagemFaltas,
            porcentagemPresencas
          ) {
            const studentData = {
              nome: studentNome,
              totalFaltas: countFaltas,
              totalPresencas: countPresencas,
              porcentagemFaltas: porcentagemFaltas,
              porcentagemPresencas: porcentagemPresencas,
            };

            this.studentsData.push(studentData);
          },
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
          for (const studentPresent of studentsPresent) {
            const studentIdPresent = studentPresent.id;
            const isPresentButNotAbsent = !studentsAbsent.some(
              (studentAbsent) => studentAbsent.id === studentIdPresent
            );
            if (isPresentButNotAbsent) {
              if (!classInfo.totalFaltas[studentIdPresent]) {
                classInfo.totalFaltas[studentIdPresent] = { count: 0 };
              } else {
                classInfo.totalFaltas[studentIdPresent].count = 0;
              }
            }
          }
          studentsAbsent.forEach((studentAbsent) => {
            const studentId = studentAbsent.id;
            if (!classInfo.totalFaltasPor[studentId]) {
              classInfo.totalFaltasPor[studentId] = { count: 1 };
            } else {
              classInfo.totalFaltasPor[studentId].count++;
            }
          });
          studentsPresent.forEach((studentPresent) => {
            const studentId = studentPresent.id;
            if (!classInfo.totalPresencas[studentId]) {
              classInfo.totalPresencas[studentId] = { count: 1 };
            } else {
              classInfo.totalPresencas[studentId].count++;
            }
          });
          classInfo.dates.push(dateInfo);
        });
        const totalDates = classInfo.dates.length;
        for (const studentId in classInfo.totalFaltas) {
          const countFaltas = classInfo.totalFaltasPor[studentId]?.count || 0;
          const countPresencas =
            classInfo.totalPresencas[studentId]?.count || 0;
          const porcentagemFaltas = (countFaltas / totalDates) * 100;
          const porcentagemPresencas = (countPresencas / totalDates) * 100;
          const student = data.find((student) => student.id === studentId);
          if (student) {
          classInfo.addStudentData(
            data.find((student) => student.id === studentId)?.nome,
            countFaltas,
            countPresencas,
            porcentagemFaltas,
            porcentagemPresencas
          );
        }
        }
        allClassesData.push(classInfo);
      }
    }
    return allClassesData;
  };

  const generateClassPDF = (pdf, classInfo) => {
    pdf.setFontSize(14);
    pdf.text(`Turma: ${classInfo.className}`, 14, 10);
    pdf.setFontSize(14);
    pdf.text(`Dados totalizados:`, 14, 20);
    let startYClass = 25;
    const tableHeaders = ["Aluno", "Total F", "Total P", "Percentual de F / P"];
    classInfo.studentsData.sort((a, b) => a.nome.localeCompare(b.nome));
    const tableRows = classInfo.studentsData
      .map((studentData) => [
        studentData.nome,
        studentData.totalFaltas,
        studentData.totalPresencas,
        `${studentData.porcentagemFaltas.toFixed(
          2
        )} / ${studentData.porcentagemPresencas.toFixed(2)}%`,
      ])
      .sort((a, b) => a[0].localeCompare(b[0]));
    autoTable(pdf, {
      startY: startYClass,
      head: [tableHeaders],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
    });
    startYClass = 10;
    classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const dateInfo of classInfo.dates) {
      pdf.addPage();
      pdf.setFontSize(11);
      pdf.text(`Data: ${dateInfo.date}`, 14, startYClass);
      let startYDate = startYClass + 5;
      pdf.text(`Descrição: ${dateInfo.description}`, 14, startYDate);
      startYDate += 5;
      pdf.text(`N/O: Aluno não possui observações`, 14, startYDate);
      startYDate += 5;
      pdf.autoTable({
        startY: startYDate,
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
      startYDate = pdf.autoTable.previous.finalY;
      const detailsTableRows = [];
      dateInfo.studentsPresent.sort((a, b) => a.nome.localeCompare(b.nome));
      const studentsPresentRows = dateInfo.studentsPresent.map(
        (studentPresent) => [
          `${studentPresent.nome} - ${studentPresent.observation || "N/O"}`,
          "",
        ]
      );
      dateInfo.studentsAbsent.sort((a, b) => a.nome.localeCompare(b.nome));
      const studentsAbsentRows = dateInfo.studentsAbsent.map(
        (studentAbsent) => [
          "",
          `${studentAbsent.nome} - ${studentAbsent.observation || "N/O"}`,
        ]
      );
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
        startY: startYDate,
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
    }
  };

  const handlePrint = async () => {
    try {
      setLoadingPrint(true);
      const allClassesData = await data(uid, classes, selectedClasses);
      let printDocument = `<!DOCTYPE html>
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
                </style>
            </head>
            <body>
                <h2>Infromações sobre as Turmas:</h2>`;
      allClassesData.forEach((classInfo) => {
        classInfo.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
        printDocument += `
                <h3>${classInfo.className}:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Total Faltas</th>
                            <th>Total Presenças</th>
                            <th>Porcentagem de Faltas</th>
                            <th>Porcentagem de Presenças</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classInfo.studentsData
                          .sort((a, b) => a.nome.localeCompare(b.nome))
                          .map(
                            (studentData) => `
                                <tr>
                                    <td>${studentData.nome}</td>
                                    <td>${studentData.totalFaltas}</td>
                                    <td>${studentData.totalPresencas}</td>
                                    <td>${studentData.porcentagemFaltas.toFixed(
                                      2
                                    )}%</td>
                                    <td>${studentData.porcentagemPresencas.toFixed(
                                      2
                                    )}%</td>
                                </tr>
                            `
                          )
                          .join("")}
                    </tbody>
                </table>
                <h3>Detalhes de Chamadas:</h3>
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
                                              studentPresent.observation ||
                                              "N/O"
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
                </table>`;
      });
      printDocument += `</body></html>`;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(printDocument);
      iframe.contentDocument.close();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoadingPrint(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setLoadingPdf(true);
      const allClassesData = await data(uid, classes, selectedClasses);

      const pdf = new jsPDF();

      for (const classInfo of allClassesData) {
        generateClassPDF(pdf, classInfo);
      }

      pdf.save("Relatorio_de_Turmas.pdf");
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleOpenEmail = async () => {
    try {
      setLoadingEmail(true);
      const allClassesData = await data(uid, classes, selectedClasses);
      const pdf = new jsPDF();
      for (const classInfo of allClassesData) {
        generateClassPDF(pdf, classInfo);
      }
      const currentDate = new Date().toISOString().slice(0, 10);
      const pdfFileName = `Relatorio_de_Turmas_${currentDate}.pdf`;
      const storageRef = ref(storage, pdfFileName);
      const pdfData = pdf.output("datauristring");
      await uploadString(storageRef, pdfData, "data_url");
      const downloadURL = await getDownloadURL(storageRef);
      const emailBody = `Baixe seu relatório em PDF pelo link o link tem validade de uma semana:\n( ${downloadURL} )\nSe o link não estiver clicável copie e cole ele no navegador\nObrigado!`;
      const subject = encodeURIComponent("Relatório");
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoadingEmail(false);
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
          <Button
            color="info"
            onClick={handleOpenEmail}
            disabled={loadingEmail}
          >
            {loadingEmail ? (
              <img src={loadingGif} alt="Loading" className="loading-imgbut" />
            ) : (
              <MdEmail color="#ffff" size={20} className="mr-1" />
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
          <Button color="danger" onClick={toggle}>
            Fechar
          </Button>
        </div>
      </AuthenticatedLayout>
    </Modal>
  );
};

export default PrinTurma;
