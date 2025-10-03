import { getResponseById } from "@/actions";
import ResponseDetailsClient from "@/components/responseDetails";
import { notFound } from "next/navigation";

export default async function ResponseDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { response } = await getResponseById(id);

  if (!response) {
    return notFound();
  }

  return <ResponseDetailsClient response={response} />;
}
