export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sendEnvelope } = await import("../../../../scripts/docusign/sendEnvelope.js");
    await sendEnvelope();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DocuSign Error:", error);
    return NextResponse.json({ error: "Failed to send envelope" }, { status: 500 });
  }
}
