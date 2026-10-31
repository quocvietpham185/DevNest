import { useEffect, useState } from "react";
import { fetchAccountStatus, type AccountStatus } from "../lib/admin";
import { useSession } from "./useSession";

const NONE: AccountStatus = { isAdmin: false, isBanned: false, bannedReason: null };

// UI gate only — real enforcement is RLS + is_admin()/is_banned() in schema.sql.
export function useAccountStatus() {
  const { session, loading: sessionLoading } = useSession();
  const [status, setStatus] = useState<AccountStatus>(NONE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setStatus(NONE);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAccountStatus(session.user.id)
      .then(setStatus)
      .catch(() => setStatus(NONE))
      .finally(() => setLoading(false));
  }, [session, sessionLoading]);

  return { ...status, loading };
}
