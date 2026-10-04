import { LoginScreen } from "@timenod/shared/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await props.searchParams;
  return <LoginScreen site="Employee site" error={error} notice={notice} />;
}
