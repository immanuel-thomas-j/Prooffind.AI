import { NextRequest, NextResponse } from "next/server";
import { LiveInspectionService } from "../../../services/liveInspectionService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceType, sourceUrl } = body;

    if (!sourceType || !sourceUrl) {
      return NextResponse.json(
        { error: "sourceType and sourceUrl are required." },
        { status: 400 }
      );
    }

    const result = await LiveInspectionService.inspectGenericSource(
      sourceType,
      sourceUrl
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Inspection error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to inspect live source." },
      { status: 500 }
    );
  }
}
