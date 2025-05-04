import React, { useState } from "react";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import { Modal, Button, FormGroup } from "reactstrap";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "services/firebaseConfig.js";
import InfoModalMes from "./InfoModalMes.js";
import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";

const PrinTurmaMes = (props) => {
  const { isOpen, toggle, uid } = props;
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [selectedClasses, setSelectedClasses] = useState("");
  const [allClassesData, setAllClassesData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const data = alunos;
      const allClassesData = [];
      for (const classItem of classes) {
        if (selectedClasses.includes(classItem.id)) {
          const chamadaRef = collection(
            firestore, `student/${uid}/turmas/${classItem.id}/chamada`
          );
          const chamadaSnapshot = await getDocs(chamadaRef);
  
          const classInfo = {
            classId: classItem.id,
            className: classItem.nome,
            dates: [],
            studentsData: [],
            totalFaltas: [],
            totalFaltasMes: [],
            totalPresencas: [],
  
            addStudentData: function (
              studentNome,
              countFaltas,
              countFaltasMes,
              countPresencas,
              porcentagemFaltas,
              porcentagemPresencas
            ) {
              const studentData = {
                nome: studentNome || "Aluno",
                totalFaltas: countFaltas,
                totalFaltasMes: countFaltasMes,
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
  
            // Calculate totals
  
            studentsAbsent.forEach((studentAbsent) => {
              const studentId = studentAbsent.id;
  
              const absenceMonth = new Date(date).getMonth() + 1;
  
              if (!classInfo.totalFaltasMes[studentId]) {
                classInfo.totalFaltasMes[studentId] = [
                  { mes: absenceMonth, totalMes: 1 },
                ];
              } else {
                const monthIndex = classInfo.totalFaltasMes[
                  studentId
                ].findIndex((entry) => entry.mes === absenceMonth);
  
                if (monthIndex === -1) {
                  classInfo.totalFaltasMes[studentId].push({
                    mes: absenceMonth,
                    totalMes: 1,
                  });
                } else {
                  classInfo.totalFaltasMes[studentId][monthIndex].totalMes++;
                }
              }
            });
  
            // After the loop over studentsAbsent
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
  
              if (!classInfo.totalFaltas[studentId]) {
                classInfo.totalFaltas[studentId] = { count: 1 };
              } else {
                classInfo.totalFaltas[studentId].count++;
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
            const countFaltas = classInfo.totalFaltas[studentId].count;
            const countPresencas =
              classInfo.totalPresencas[studentId]?.count || 0;
            const countFaltasMes = classInfo.totalFaltasMes[studentId] || [];
            const porcentagemFaltas = (countFaltas / totalDates) * 100;
            const porcentagemPresencas = (countPresencas / totalDates) * 100;
  
            const student = data.find((student) => student.id === studentId);
            if (student) {
              classInfo.addStudentData(
                student.nome,
                countFaltas,
                countFaltasMes,
                countPresencas,
                porcentagemFaltas,
                porcentagemPresencas
              );
            }
          }
  
          allClassesData.push(classInfo);
        }
      }
  
      setAllClassesData(allClassesData);
      setInfoModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <AuthenticatedLayout>
        <div className="modal-header">
          <h2 className="modal-title text-black">{"Relatório/Mes"}</h2>
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
              value={selectedClasses}
              onChange={(e) => {
                setSelectedClasses(e.target.value);
              }}
            >
              <option value="">Selecionar</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.nome}
                </option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="modal-footer">
          <Button color="info" onClick={handlePrint} disabled={loading}>
            {loading ? "Carregando..." : "Informações"}
          </Button>
          <Button color="danger" onClick={toggle}>
            Fechar
          </Button>
        </div>
        <InfoModalMes
          isOpen={infoModalOpen}
          toggle={() => setInfoModalOpen(false)}
          allClassesData={allClassesData}
        />
      </AuthenticatedLayout>
    </Modal>
  );
};

export default PrinTurmaMes;