"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AddProposalFormProps {
  clientId: string;
  clientName: string;
}

export function AddProposalForm({ clientId, clientName }: AddProposalFormProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // 🔑 Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("User not authenticated.");
      setLoading(false);
      return;
    }

    console.log("USERID " + user.id);

    let uploadedFileUrl: string | null = null;

    if (file) {
      const filePath = `proposals/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("proposal-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert(`File upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("proposal-files")
        .getPublicUrl(filePath);

      uploadedFileUrl = publicUrlData.publicUrl;
    }

    console.log("User ID", user.id);
    console.log("Inserting proposal with:", {
      title,
      notes,
      status,
      file_url: uploadedFileUrl || null,
      client_id: clientId,
      user_id: user.id,
    });

    // ✅ Insert with user_id
    const { error } = await supabase.from("proposals").insert([
      {
        title,
        notes,
        status,
        file_url: uploadedFileUrl || null,
        client_id: clientId,
        user_id: user.id, // 👈 Explicitly passing user_id
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Failed to add proposal: ${error.message}`);
    } else {
      router.push(`/clients/${clientId}/view-proposals`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold">
        Add Proposal for: <span className="text-blue-600">{clientName}</span>
      </h2>

      <Input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        required
      />

      <Input
        type="text"
        placeholder="Status (e.g., pending, approved)"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />

      <div>
        <label className="text-sm font-medium block mb-1">Upload File (optional)</label>
        <Input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Proposal"}
      </Button>
    </form>
  );
}
