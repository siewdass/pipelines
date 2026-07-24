import { Routes, Route, Navigate } from "react-router";
import ProjectList from "./ProjectList";
import ProjectCreate from "./ProjectCreate";
import ProjectDetails from "./ProjectDetails";
import ProjectTables from "./ProjectTables";
import ProjectData from "./ProjectData";

import ProjectMetrics from "./ProjectMetrics";

import ProjectAssemble from "./ProjectAssemble";
import ProjectUsers from "./ProjectUsers";

export default function Projects() {
  return (
    <Routes>
      <Route index element={<ProjectList />} />
      <Route path="create" element={<ProjectCreate />} />
      <Route path="settings/:id" element={<ProjectDetails />} />
      <Route path="schema/:id" element={<ProjectTables />} />
      <Route path="projectdata/:id/:tableId" element={<ProjectData />} />
      <Route path="metrics/:id" element={<ProjectMetrics />} />
      <Route path="assemble/:id" element={<ProjectAssemble />} />
      <Route path="users/:id" element={<ProjectUsers />} />
      {/* Fallback to main projects list */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
