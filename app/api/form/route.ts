import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newForm } = body;

    if (!newForm || typeof newForm !== "object") {
      return NextResponse.json({ error: "Missing newForm payload" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "SampleData", "form.json");
    const fileContents = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileContents);

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Invalid form.json contents" }, { status: 500 });
    }

    const nextJson = {
      ...parsed,
      form: Array.isArray(parsed.form) ? [...parsed.form, newForm] : [newForm],
    };

    await fs.writeFile(filePath, JSON.stringify(nextJson, null, 2), "utf-8");

    return NextResponse.json({ success: true, form: newForm });
  } catch (error) {
    console.error("/api/form error", error);
    return NextResponse.json({ error: "Unable to save form" }, { status: 500 });
  }
}
