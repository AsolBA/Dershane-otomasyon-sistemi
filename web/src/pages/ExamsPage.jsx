import { ROLES, useAuth } from "../auth/AuthContext";
import ExamResultsReadOnly from "../components/ExamResultsReadOnly";
import ExamAdminPage from "./ExamAdminPage";

export default function ExamsPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.STUDENT) {
    return (
      <ExamResultsReadOnly
        title="Sonuçlarım"
        subtitle="Sadece kendi sınav sonuçlarınızı görüntüleyebilirsiniz."
      />
    );
  }

  if (user?.role === ROLES.PARENT) {
    return (
      <ExamResultsReadOnly
        title="Sonuçlar"
        subtitle="Bağlı öğrencinizin sınav sonuçları (salt okunur)."
      />
    );
  }

  return <ExamAdminPage />;
}
