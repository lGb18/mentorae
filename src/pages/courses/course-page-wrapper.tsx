import { useParams } from "react-router-dom";
import CoursePage from "@/components/course-page";

export default function CoursePageWrapper() {
  const { subjectName, subjectId } = useParams<{ subjectName: string; subjectId: string }>();

  if (!subjectName || !subjectId) return <p>Invalid subject</p>;

  return <CoursePage subject={subjectName} subjectId={subjectId} />;
}