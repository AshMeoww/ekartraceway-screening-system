alter table public.parsed_profiles
add column if not exists extraction_method text not null default 'direct'
  check (extraction_method in ('direct', 'ocr')),
add column if not exists extraction_source text not null default 'unknown'
  check (extraction_source in ('pdf', 'docx', 'image', 'unknown'));

update public.parsed_profiles
set
  extraction_source = case
    when lower(coalesce(documents.mime_type, '')) = 'application/pdf'
      or lower(documents.file_name) like '%.pdf' then 'pdf'
    when lower(coalesce(documents.mime_type, '')) =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      or lower(documents.file_name) like '%.docx' then 'docx'
    when lower(coalesce(documents.mime_type, '')) like 'image/%'
      or lower(documents.file_name) ~ '\.(png|jpg|jpeg|webp|bmp|tif|tiff)$' then 'image'
    else public.parsed_profiles.extraction_source
  end,
  extraction_method = case
    when lower(coalesce(documents.mime_type, '')) like 'image/%'
      or lower(documents.file_name) ~ '\.(png|jpg|jpeg|webp|bmp|tif|tiff)$' then 'ocr'
    else public.parsed_profiles.extraction_method
  end
from public.documents
where documents.application_id = parsed_profiles.application_id
  and parsed_profiles.extraction_source = 'unknown';
