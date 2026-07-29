import { redirect } from "next/navigation"

export default function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  // Server component that redirects to the rooms page
  // The actual join logic will happen client-side
  redirect("/rooms")
}