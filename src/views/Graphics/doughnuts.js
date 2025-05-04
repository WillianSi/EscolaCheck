import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useFirebase } from "../../services/FirebaseProvider.js";
import useFetchAlunos from "../../hooks/student.js";
import useFetchClasses from "../../hooks/class.js";
import { firestore } from "../../services/firebaseConfig.js";
import AuthenticatedLayout from "services/AuthenticatedLayout.js";
import {
  collection,
  getDocs,
} from "firebase/firestore";

const Doughnuts = () => {
  const { uid } = useFirebase();
  const { alunos } = useFetchAlunos(uid);
  const { classes } = useFetchClasses(uid);
  const [updatedStudentData, setUpdatedStudentData] = useState([]);

  useEffect(() => {
    const fetchAndUpdateData = async () => {
      try {
        if (classes.length > 0) {
          const attendanceCounts = {};
          await Promise.all(classes.map(async (classe) => {
            const turmaId = classe.id;
            const chamadaRef = collection(firestore, `student/${uid}/turmas/${turmaId}/chamada`);
            const chamadaSnapshot = await getDocs(chamadaRef);
            chamadaSnapshot.forEach(doc => {
              const chamada = doc.data();
              (chamada.studentsPresent || []).forEach(student => {
                attendanceCounts[student.id] = attendanceCounts[student.id] || { present: 0, absent: 0 };
                attendanceCounts[student.id].present++;
              });
              (chamada.studentsAbsent || []).forEach(student => {
                attendanceCounts[student.id] = attendanceCounts[student.id] || { present: 0, absent: 0 };
                attendanceCounts[student.id].absent++;
              });
            });
          }));
          const updatedStudentData = alunos.map(student => {
            const counts = attendanceCounts[student.id] || { present: 0, absent: 0 };
            const totalCount = counts.present + counts.absent;
            const percentage = totalCount === 0 ? 0 : (counts.present / totalCount) * 100;
            return {
              ...student,
              presentCount: counts.present,
              absentCount: counts.absent,
              percentage,
            };
          });
          setUpdatedStudentData(updatedStudentData);
        }
      } catch (error) {
        console.error("Error fetching and updating data:", error.message);
      }
    };
  
    fetchAndUpdateData();
  }, [classes, alunos, uid]);

  const alternatingColors = [
    "#6A5ACD",
    "#836FFF",
    "#6959CD",
    "#483D8B",
    "#191970",
    "#000080",
    "#00008B",
    "#0000CD",
    "#0000FF",
    "#6495ED",
    "#00BFFF",
    "#87CEFA",
    "#87CEEB",
    "#ADD8E6",
    "#4682B4",
    "#B0C4DE",
    "#708090",
    "#778899",
  ];

  const donutData = {
    datasets: [
      {
        data: updatedStudentData.map((student) =>
          parseFloat(student.percentage).toFixed(2)
        ),
        backgroundColor: updatedStudentData.map(
          (student, index) =>
            alternatingColors[index % alternatingColors.length]
        ),
        hoverBackgroundColor: updatedStudentData.map((student) => ""),
      },
    ],
  };

  const donutOptions = {
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          const dataIndex = tooltipItem.index;
          const student = updatedStudentData[dataIndex];
          const studentName = student.nome;
          const percentage = parseFloat(student.percentage).toFixed(2);
          return `${studentName}: ${percentage}%`;
        },
      },
    },
  };

  return (
    <>
      <AuthenticatedLayout>
        <div>
          <h2>Histórico total de faltas e presenças por alunos</h2>
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default Doughnuts;