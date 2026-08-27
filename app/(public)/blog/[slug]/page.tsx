import { redirect } from "next/navigation";

export default async function BlogPostRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/write-ups/${slug}`);
}
