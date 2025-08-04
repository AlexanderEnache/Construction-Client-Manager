import { ProposalListClient } from "@/components/dashboard/ProposalListClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    clientId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const supabase = await createClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("name")
    .eq("id", params.clientId)
    .single();

  if (clientError) {
    return <div className="text-red-500">Client not found</div>;
  }

  const { data: proposals, error: proposalsError } = await supabase
    .from("proposals")
    .select("*")
    .eq("client_id", params.clientId)
    .order("created_at", { ascending: false });

  if (proposalsError) {
    return <div className="text-red-500">Failed to load proposals: {proposalsError.message}</div>;
  }

  return (
    <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold">
            Proposals for {client.name}
          </h1>
          <Link href={`/add-proposal/${params.clientId}`}>
            <Button size="sm">Add Proposal</Button>
          </Link>
        </div>
        
        <ProposalListClient proposals={proposals ?? []} />
      </div>
    </div>
  );
}
