import { useParams } from "react-router-dom";
import CoursePage from "@/components/course-page";

export default function CoursePageWrapper() {
  const { subjectName, subjectId } = useParams<{ subjectName: string; subjectId: string }>();
  const params = useParams();
  console.log(" CoursePageWrapper mounted with params:", params);
  if (!subjectName || !subjectId) return <p>Invalid subject</p>;

  return <CoursePage subject={subjectName} subjectId={subjectId} />;
}