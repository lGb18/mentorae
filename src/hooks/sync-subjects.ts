// /hooks/sync-subjects.ts
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSubjectsSync(tutorId: string) {
  const [loading, setLoading] = useState(false);

  /**
   * Syncs the subjects_taught array for the given tutor_id.
   * Fetches all subjects from `subjects` table where tutor_id matches,
   * then updates `profiles.subjects_taught` with the fresh list.
   */
  const syncSubjects = async (tutorId: string) => {
    if (!tutorId) return;

    setLoading(true);
    try {
      
      const { data: subjects, error: fetchError } = await supabase
        .from("subjects")
        .select("name")
        .eq("tutor_id", tutorId);

      if (fetchError) throw fetchError;

      const subjectNames = subjects?.map((s: any) => s.name) || [];

      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ subjects_taught: subjectNames })
        .eq("id", tutorId);

      if (updateError) throw updateError;

      setLoading(false);
      return subjectNames;
    } catch (err) {
      console.error("Error syncing subjects:", err);
      setLoading(false);
    }
  };

  return { syncSubjects, loading };
}
