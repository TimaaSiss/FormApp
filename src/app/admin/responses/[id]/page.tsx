import { getResponseById } from "@/actions/getResponseById";
import ResponseDetailsClient from "@/app/components/responseDetails";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function ResponseDetails({ params }: Props) {
  const { id } = params;
  const { response } = await getResponseById(id);

  if (!response) {
    return notFound();
  }

  return <ResponseDetailsClient response={response} />;
}
