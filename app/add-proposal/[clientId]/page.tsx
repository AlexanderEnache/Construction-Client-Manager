import { createClient } from "@/lib/supabase/server";
import { AddProposalForm } from "@/components/AddProposalForm";
import { notFound } from "next/navigation";

interface Props {
  params: {
    clientId: string;
  };
}

export default async function Page({ params }: Props) {
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("name")
    .eq("id", params.clientId)
    .single();

  if (error || !client) {
    return notFound();
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Add proposal for client: <span className="text-primary">{client.name}</span>
      </h1>
      <AddProposalForm clientId={params.clientId} clientName={client.name} />
    </div>
  );
}
