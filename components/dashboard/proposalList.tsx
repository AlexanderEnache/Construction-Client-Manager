"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Proposal {
  id: string;
  title: string;
  notes: string;
  status: string;
  file_url: string;
  created_at: string;
  client_id: string;      // <-- Add this
  client: {
    id: string,
    name: string
  }
}

interface ProposalListProps {
  proposals: Proposal[];
  className?: string;
}

export function ProposalList({ proposals, className }: ProposalListProps) {
  if (!proposals || proposals.length === 0) {
    return (
      <Card className={cn("p-6 text-center text-muted-foreground", className)}>
        <p>No proposals found.</p>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {proposals.map((proposal, index) => (
        <Card
          key={proposal.id}
          className={cn(
            "border-b border-border px-4 py-2 rounded-none",
            index === proposals.length - 1 && "border-b-0"
          )}
        >
          <div className="flex flex-row items-center gap-4 w-full overflow-hidden">
            {/* Title */}
            <div className="w-1/5 truncate whitespace-nowrap text-sm font-medium">
              {proposal.title}
            </div>

            {/* Notes */}
            <div className="w-2/5 truncate whitespace-nowrap text-sm text-muted-foreground">
              {proposal.notes}
            </div>

            {/* Client Name */}
            <div className="w-1/5 truncate whitespace-nowrap text-sm text-blue-600 hover:underline">
              <a href={`/clients/${proposal.client_id}`}>
                {proposal.client.name}
              </a>
            </div>

            {/* Status + View */}
            <div className="ml-auto flex items-center gap-6">
              <Badge variant="outline" className="capitalize text-sm">
                {proposal.status}
              </Badge>

              <div className="w-24 text-xs whitespace-nowrap">
                {proposal.file_url ? (
                  <a
                    href={`/view-file/${proposal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block text-center"
                  >
                    View File
                  </a>
                ) : (
                  <span className="text-gray-500 italic block text-center">
                    No file
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
