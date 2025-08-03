// app/view-file/[proposalId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FilePreview from "@/components/filePreview";

interface Props {
  params: {
    proposalId: string;
  };
}

export default async function Page({ params }: Props) {
  const supabase = await createClient();

  // Fetch proposal by ID to confirm it exists and get any needed data (e.g. file_url)
// const { data: proposal, error } = await supabase
//   .from("proposals")
//   .select(`
//     id,
//     file_url,
//     title,
//     client_id_fkey (
//       name,
//       email
//     )
//   `)
//   .eq("id", params.proposalId)
//   .single();

    const { data: proposal, error } = await supabase
    .from("proposals")
    .select("id, file_url, title")
    .eq("id", params.proposalId)
    .single();

  if (error || !proposal) {
    return notFound();
  }

  // console.log("GET EMAIL " + proposal.client_id_fkey[0].name + " " + proposal.client_id_fkey[0].email);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">{proposal.title}</h1>
      {/* Pass proposalId or file_url to your client component */}
      <FilePreview proposalId={params.proposalId} fileUrl={proposal.file_url}
        // signerName={proposal.client_id_fkey[0].name} 
        // signerEmail={proposal.client_id_fkey[0].email}

        signerName={"proposal.client_id_fkey[0].name"} 
        signerEmail={"alex.d.enache@gmail.com"}
        proposalTitle={proposal.title}
      />
    </div>
  );
}
