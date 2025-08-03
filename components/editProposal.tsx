"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface EditProposalFormProps {
  proposalId: string;
}

export function EditProposalForm({ proposalId }: EditProposalFormProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProposal = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single();

      if (error) {
        alert(`Failed to fetch proposal: ${error.message}`);
        return;
      }

      setTitle(data.title || "");
      setNotes(data.notes || "");
      setStatus(data.status || "");
      setFileUrl(data.file_url || null);
    };

    fetchProposal();
  }, [proposalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    let updatedFileUrl = fileUrl;

    if (newFile) {
      const filePath = `proposals/${Date.now()}-${newFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("proposal-files")
        .upload(filePath, newFile);

      if (uploadError) {
        alert(`File upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("proposal-files")
        .getPublicUrl(filePath);

      updatedFileUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("proposals")
      .update({
        title,
        notes,
        status,
        file_url: updatedFileUrl,
      })
      .eq("id", proposalId);

    setLoading(false);

    if (error) {
      console.error("Update error:", error);
      alert(`Update failed: ${error.message}`);
    } else {
      router.push("/dashboard"); // Or wherever you want to redirect
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold">Edit Proposal</h2>

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

      {fileUrl && (
        <p className="text-sm text-gray-600">
          Current file:{" "}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View
          </a>
        </p>
      )}

      <Input
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => setNewFile(e.target.files?.[0] || null)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Proposal"}
      </Button>
    </form>
  );
}
