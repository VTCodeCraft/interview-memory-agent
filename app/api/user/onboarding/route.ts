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
    const name = formData.get("name");
    const role = formData.get("role");
    const company = formData.get("company");
    const experience = formData.get("experience");
    const resume = formData.get("resume");

    if (!role || typeof role !== "string") {
      return NextResponse.json(fail("Target role is required"), { status: 400 });
    }

    if (resume && resume instanceof File) {
      if (!ALLOWED_TYPES.includes(resume.type)) {
        const isImage = resume.type.startsWith("image/");
        return NextResponse.json(
          fail(
            isImage
              ? `Cannot read "${resume.name}" (this model does not support image input). Please upload a PDF or DOCX file instead.`
              : `"${resume.name}" is not a supported format. Only PDF and DOCX files are accepted.`
          ),
          { status: 400 }
        );
      }
      if (resume.size > MAX_SIZE) {
        return NextResponse.json(fail("File exceeds 10 MB limit"), { status: 400 });
      }
    }

    // TODO: persist onboarding data + resume to storage/database
    return NextResponse.json(
      ok({ name, role, company, experience, resume: resume instanceof File ? resume.name : null })
    );
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Onboarding failed";
    return NextResponse.json(fail(message), { status: 500 });
  }
}
