// // Force Node.js runtime so cookies() is sync-compatible
// export const runtime = 'nodejs';

// import { NextRequest, NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// export async function POST(req: NextRequest) {
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: cookies(), // ✅ now valid
//     }
//   );

//   try {
//     const { proposalId, envelopeId } = await req.json();

//     if (!proposalId || !envelopeId) {
//       return NextResponse.json({ error: "Missing proposalId or envelopeId" }, { status: 400 });
//     }

//     const { error } = await supabase
//       .from("proposals")
//       .update({
//         docusign_id: envelopeId,
//         status: "Sent",
//       })
//       .eq("id", proposalId);

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ message: "Proposal updated successfully" });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
