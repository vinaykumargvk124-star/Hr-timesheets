import { requireUser } from "@timenod/shared/guard";
import { Shell } from "@timenod/shared/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user, allowed } = await requireUser(["APPROVER", "ADMIN"]);
  return (
    <Shell site="Approver site" userName={user.name} role={user.role}>
      {allowed ? (
        <>
          <h1>Pending timesheets</h1>
          <p className="muted">The review queue arrives in the next phase.</p>
        </>
      ) : (
        <>
          <h1>No access</h1>
          <p className="err">Your account is not an approver. Use the employee site instead.</p>
        </>
      )}
    </Shell>
  );
}
