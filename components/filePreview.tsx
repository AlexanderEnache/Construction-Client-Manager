"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileViewerWrapperProps {
  proposalId: string;
  fileUrl: string | null;
  signerName: string;
  signerEmail: string;
  proposalTitle: string;
}

export default function FilePreview({
  proposalId,
  fileUrl,
  signerName,
  signerEmail,
  proposalTitle,
}: FileViewerWrapperProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSendDocuSign() {
    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/docusign/send-envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerEmail, signerName, fileUrl, proposalTitle }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server response is not valid JSON.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to send document.");
      }

      setMessage("✅ Document sent via DocuSign successfully!");
    } catch (error: any) {
      setMessage(`❌ Failed to send document: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  if (!fileUrl) {
    return <p>No file available to preview.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border rounded p-4">
        {fileUrl.endsWith(".pdf") ? (
          <iframe
            src={fileUrl}
            title="Proposal Document"
            width="100%"
            height={600}
            className="border"
          />
        ) : (
          <img
            src={fileUrl}
            alt="Proposal Document"
            className="max-w-full max-h-[600px]"
          />
        )}
      </div>

      <Button onClick={handleSendDocuSign} disabled={sending}>
        {sending ? "Sending..." : "Send via DocuSign"}
      </Button>

      {message && (
        <p
          className={`text-sm mt-2 ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
