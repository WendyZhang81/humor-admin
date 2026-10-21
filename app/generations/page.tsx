import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-superadmin";
import AdminNavbar from "@/components/AdminNavbar";
import GenerationsManager from "@/components/GenerationsManager";

export const instant = false;

export default async function GenerationsPage() {
  await connection();

  const { user } = await requireSuperAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, user_id, prompt, generated_content, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  const generations = data ?? [];

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111827]">
      <AdminNavbar />

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4F91] mb-3">
              Content Management
            </p>

            <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Generations
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Create, review, edit, and delete AI-generated
              captions from the Campus Laughs community.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load generations
            </p>

            <p className="text-sm text-red-600 mt-1">
              {error.message}
            </p>
          </div>
        ) : (
          <GenerationsManager
            initialGenerations={generations}
            adminUserId={user.id}
          />
        )}
      </section>
    </main>
  );
}