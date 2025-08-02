import { ProposalList } from "@/components/dashboard/proposalList";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  // Step 1: Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <div className="text-red-500">User not authenticated</div>;
  }

  // Step 2: Query proposals where proposal.client_id IN (clients owned by user)
  // You can do this with a single query using `in` operator and a subquery on 'clients'
  // But Supabase doesn't support subqueries directly, so fetch clients first

  // Fetch client IDs for the user
  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id);

  if (clientsError) {
    return <div className="text-red-500">Failed to load clients: {clientsError.message}</div>;
  }

  const clientIds = clients?.map((c) => c.id) ?? [];

  // If no clients, proposals will be empty
  if (clientIds.length === 0) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <p>No proposals found (no clients assigned).</p>
        </div>
      </div>
    );
  }

  // Step 3: Fetch proposals with client_id in clientIds
  const { data: proposals, error: proposalsError } = await supabase
    .from("proposals")
    .select("*")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });

  if (proposalsError) {
    return <div className="text-red-500">Failed to load proposals: {proposalsError.message}</div>;
  }

  return (
    <div className="flex min-h-svh w-full justify-center p-6 md:p-10">
      <div className="w-full">
        <ProposalList proposals={proposals ?? []} />
      </div>
    </div>
  );
}
