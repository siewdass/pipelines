import { Routes, Route, Navigate } from "react-router";
import ProjectList from "./ProjectList";
import ProjectCreate from "./ProjectCreate";
import ProjectDetails from "./ProjectDetails";

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectList />} />
      <Route path="create" element={<ProjectCreate />} />
      <Route path="details/:id" element={<ProjectDetails />} />
      {/* Fallback to main projects list */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
