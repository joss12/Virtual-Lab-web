import { pythonProjects }     from "../python/projects";
import { javascriptProjects } from "../javascript/projects";

export const projectsContent: Record<string, Record<string, any>> = {
  python:     pythonProjects,
  javascript: javascriptProjects,
};
