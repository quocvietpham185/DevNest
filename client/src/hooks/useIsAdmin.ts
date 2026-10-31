import { useEffect, useState } from "react";
import { fetchIsAdmin } from "../lib/admin";
import { useSession } from "./useSession";

// UI gate only — real enforcement is RLS + public.is_admin()/set_user_role() in schema.sql.
export function useIsAdmin() {
  const { session, loading: sessionLoading } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchIsAdmin(session.user.id)
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, [session, sessionLoading]);

  return { isAdmin, loading };
}
