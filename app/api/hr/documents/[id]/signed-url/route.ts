import { NextResponse } from "next/server";
import { getCurrentHrUser, getSupabaseServiceClient } from "@/lib/supabase/server";

type DocumentRow = {
  file_name: string;
  storage_path: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const hrUser = await getCurrentHrUser();

  if (!hrUser) {
    return NextResponse.json({ error: "HR access is required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role credentials are required." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("documents")
    .select("file_name, storage_path")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const document = data as unknown as DocumentRow;
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("applicant-cvs")
    .createSignedUrl(document.storage_path, 300, {
      download: document.file_name,
    });

  if (signedUrlError) {
    return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}
