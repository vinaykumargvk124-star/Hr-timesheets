import { SetPasswordScreen } from "@timenod/shared/ui";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage(props: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await props.searchParams;
  return <SetPasswordScreen token={token} error={error} />;
}
