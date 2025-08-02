import { ProposalList } from "@/components/dashboard/proposalList";
import { createClient } from "@/lib/supabase/server";

interface Proposal {
  id: string;
  client_id: string;
  title: string;
  notes: string;
  status: string;
  file_url: string;
  created_at: string;
}

interface PageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientProposalsPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: proposals, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("client_id", params.clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500">Failed to load proposals: {error.message}</div>;
  }

  return (
    <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
      <div className="w-full max-w-4xl">
        <ProposalList proposals={proposals ?? []} />
      </div>
    </div>
  );
}
