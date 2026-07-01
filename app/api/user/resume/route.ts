import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/utils/api";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(fail("Resume file is required"), { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      const isImage = file.type.startsWith("image/");
      return NextResponse.json(
        fail(
          isImage
            ? `Cannot read "${file.name}" (this model does not support image input). Please upload a PDF or DOCX file instead.`
            : `"${file.name}" is not a supported format. Only PDF and DOCX files are accepted.`
        ),
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(fail("File exceeds 10 MB limit"), { status: 400 });
    }

    // TODO: persist resume to storage/database
    return NextResponse.json(ok({ filename: file.name, size: file.size }));
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Resume upload failed";
    return NextResponse.json(fail(message), { status: 500 });
  }
}
