import { EditProposalForm } from "@/components/editProposal";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <EditProposalForm proposalId={params.id} />;
}
