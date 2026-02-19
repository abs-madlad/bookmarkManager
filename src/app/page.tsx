"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import Bookmarks from "@/components/Bookmarks";

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUserId(data.session?.user.id ?? null);
      })
      .catch((e) => {
        setError("Auth error");
      })
      .finally(() => setLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  function signIn() {
    const supabase = getSupabase();
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }

  function signOut() {
    const supabase = getSupabase();
    supabase.auth.signOut();
  }

  if (loading) return <div className="text-center">Checking session…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Smart Bookmark App</h1>
        {userId ? (
          <button onClick={signOut} className="rounded bg-gray-800 px-4 py-2 text-white">Sign out</button>
        ) : (
          <button onClick={signIn} className="rounded bg-green-600 px-4 py-2 text-white">Sign in with Google</button>
        )}
      </div>
      {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}
      {userId ? (
        <Bookmarks userId={userId} />
      ) : (
        <div className="rounded border bg-white p-6 text-center">Sign in to manage bookmarks</div>
      )}
    </div>
  );
}
