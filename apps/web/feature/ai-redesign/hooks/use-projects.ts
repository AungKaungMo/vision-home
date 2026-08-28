"use client";

import { useEffect, useState } from "react";

import { PROJECTS, type Project } from "@/feature/ai-redesign/constants";

/**
 * Loads the project list. Currently returns the static sample data behind a
 * short delay so loading/skeleton states are exercised — swap the effect body
 * for a real fetch when the API is ready.
 */
export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setProjects(PROJECTS), 400);
    return () => clearTimeout(timeout);
  }, []);

  return { projects: projects ?? [], isLoading: projects === null };
}
