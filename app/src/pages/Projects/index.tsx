import { Routes, Route, Navigate } from "react-router";
import ProjectList from "./ProjectList";
import ProjectCreate from "./ProjectCreate";
import ProjectDetails from "./ProjectDetails";
import ProjectTables from "./ProjectTables";
import ProjectData from "./ProjectData";

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectList />} />
      <Route path="create" element={<ProjectCreate />} />
      <Route path="details/:id" element={<ProjectDetails />} />
      <Route path="projecttables/:id" element={<ProjectTables />} />
      <Route path="projectdata/:id/:tableId" element={<ProjectData />} />
      {/* Fallback to main projects list */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
