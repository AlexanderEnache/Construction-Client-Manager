import { NextRequest, NextResponse } from "next/server";
const docusign = require("docusign-esign");

export const runtime = "nodejs"; // ensure we can use Buffer

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signerName, signerEmail, fileUrl } = body;

    if (!signerName || !signerEmail || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Step 1: Download the file from Supabase or public URL
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Failed to download document." }, { status: 400 });
    }

    const fileBuffer = await fileRes.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString("base64");

    // Step 2: Setup Docusign API Client
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath("https://demo.docusign.net/restapi");
    apiClient.setOAuthBasePath("account-d.docusign.com");

    const integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY!;
    const userId = process.env.DOCUSIGN_USER_ID!;
    const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, "utf-8");

    const jwtResult = await apiClient.requestJWTUserToken(
      integratorKey,
      userId,
      "signature",
      privateKey,
      3600
    );

    const accessToken = jwtResult.body.access_token;
    apiClient.addDefaultHeader("Authorization", `Bearer ${accessToken}`);

    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;

    // Step 3: Create and Send Envelope
    const envelopeDefinition = {
      emailSubject: "Please sign this document",
      documents: [
        {
          documentBase64: fileBase64,
          name: "Proposal.pdf",
          fileExtension: "pdf",
          documentId: "1",
        },
      ],
      recipients: {
        signers: [
          {
            email: signerEmail,
            name: signerName,
            recipientId: "1",
            routingOrder: "1",
            tabs: {
              signHereTabs: [
                {
                  anchorString: "/sign_here/",
                  anchorUnits: "pixels",
                  anchorYOffset: "10",
                  anchorXOffset: "20",
                },
              ],
            },
          },
        ],
      },
      status: "sent",
    };

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition,
    });

    return NextResponse.json({ envelopeId: envelope.envelopeId });
  } catch (err) {
    console.error("DocuSign Error:", err);
    return NextResponse.json({ error: "Failed to send envelope." }, { status: 500 });
  }
}
