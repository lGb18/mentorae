import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateSubject() {
  const [name, setName] = useState("");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) setTutorId(session.user.id);
    };
    getUserId();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !tutorId) {
      alert("Missing subject name or tutor session.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert({ name: name.trim(), tutor_id: tutorId })
        .select()
        .single();

      if (error) throw error;

      // Navigate to course page using returned id
      navigate(`/courses/${data.name}/${data.id}`);
      window.location.reload();
    } catch (err) {
      console.error("Error creating subject:", err);
    }
  };

  return (
    <div className="p-4">
      <h2>Create New Subject</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Subject Name"
        className="border px-2 py-1 mr-2 rounded"
      />
      <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded">
        Create
      </button>
    </div>
  );
}
