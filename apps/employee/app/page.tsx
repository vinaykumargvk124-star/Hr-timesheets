import { requireUser } from "@timenod/shared/guard";
import { Shell } from "@timenod/shared/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user } = await requireUser();
  return (
    <Shell site="Employee site" userName={user.name} role={user.role}>
      <h1>My timesheets</h1>
      <p className="muted">Uploading timesheet screenshots arrives in the next phase.</p>
    </Shell>
  );
}
