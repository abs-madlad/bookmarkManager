"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
};

export default function Bookmarks({ userId }: { userId: string }) {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const supabase = getSupabase();

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks", filter: `user_id=eq.${userId}` },
        () => {
          fetchData();
        }
      );
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  async function fetchData() {
    const { data } = await getSupabase()
      .from("bookmarks")
      .select("id,user_id,url,title,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function addBookmark() {
    if (!url || !title) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ url, title, user_id: userId })
      .select("id,user_id,url,title,created_at")
      .single();
    if (!error && data) {
      setItems((prev) => [data, ...prev]);
      setToast({ message: "Bookmark added", type: "success" });
    } else {
      await fetchData();
      setToast({ message: "Failed to add", type: "error" });
    }
    setUrl("");
    setTitle("");
    setLoading(false);
  }

  async function removeBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", userId);
    if (!error) {
      setItems((prev) => prev.filter((b) => b.id !== id));
      setToast({ message: "Bookmark deleted", type: "success" });
    } else {
      await fetchData();
      setToast({ message: "Failed to delete", type: "error" });
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="fixed right-4 top-4 z-50">
        {toast && (
          <div
            className={
              toast.type === "success"
                ? "rounded bg-green-600 px-4 py-2 text-white shadow"
                : "rounded bg-red-600 px-4 py-2 text-white shadow"
            }
          >
            {toast.message}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="flex-1 rounded border px-3 py-2"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={addBookmark}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded border bg-white p-3">
            <div className="flex-1">
              <a href={b.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700">
                {b.title}
              </a>
              <div className="text-sm text-gray-600 truncate">{b.url}</div>
            </div>
            <button
              onClick={() => removeBookmark(b.id)}
              className="ml-3 rounded bg-red-600 px-3 py-1 text-white"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
