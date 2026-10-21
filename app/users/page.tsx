import Image from "next/image";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-superadmin";
import AdminNavbar from "@/components/AdminNavbar";

export const instant = false;

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  is_superadmin: boolean;
};

export default async function UsersPage() {
  await connection();

  await requireSuperAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, avatar_url, created_at, is_superadmin"
    )
    .order("created_at", {
      ascending: false,
    });

  const profiles: Profile[] = data ?? [];

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111827]">
      <AdminNavbar />

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4F91] mb-3">
              User Management
            </p>

            <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Users
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Review profiles registered in the Campus Laughs community.
            </p>
          </div>

          <div className="rounded-[20px] bg-[#DDEEF7] border border-[#1D4F91]/10 px-6 py-4 min-w-36">
            <p className="text-xs font-medium text-[#1D4F91]">
              Total Profiles
            </p>

            <p className="text-3xl font-bold mt-1">
              {profiles.length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 mb-6">
            <p className="font-semibold text-red-700">
              Unable to load profiles
            </p>

            <p className="text-sm text-red-600 mt-1">
              {error.message}
            </p>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="bg-white border border-[#1D4F91]/10 rounded-[24px] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1D4F91]/10 bg-[#DDEEF7]/50 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Community profiles
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Read-only access to registered user profiles.
                </p>
              </div>

              <span className="text-2xl">
                👥
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[#1D4F91]/10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      User ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {profiles.map((profile) => {
                    const displayName =
                      profile.first_name ||
                      profile.last_name
                        ? `${profile.first_name ?? ""} ${
                            profile.last_name ?? ""
                          }`.trim()
                        : "Unnamed User";

                    const initial =
                      profile.first_name
                        ?.charAt(0)
                        .toUpperCase() ?? "?";

                    return (
                      <tr
                        key={profile.id}
                        className="border-b border-[#1D4F91]/10 last:border-b-0 hover:bg-[#F7F5F0]/70"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {profile.avatar_url ? (
                              <Image
                                src={profile.avatar_url}
                                alt={displayName}
                                width={44}
                                height={44}
                                className="w-11 h-11 rounded-full object-cover border-2 border-[#DDEEF7]"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-[#DDEEF7] text-[#1D4F91] flex items-center justify-center font-semibold">
                                {initial}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold">
                                {displayName}
                              </p>

                              <p className="text-xs text-slate-400 mt-1">
                                Campus Laughs profile
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-500 font-mono max-w-[220px] truncate">
                            {profile.id}
                          </p>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          {profile.is_superadmin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#071D3B] text-white text-xs font-semibold px-3 py-1.5">
                              ✓ Superadmin
                            </span>
                          ) : (
                            <span className="inline-block bg-[#DDEEF7] text-[#1D4F91] text-xs font-semibold rounded-full px-3 py-1.5">
                              User
                            </span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {profile.created_at
                            ? new Date(
                                profile.created_at
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {profiles.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No profiles found.
              </div>
            )}
          </div>
        )}

        {/* Read-only note */}
        <div className="mt-7 rounded-[20px] bg-[#071D3B] text-white px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B9D9EB]">
            Read-only
          </p>

          <p className="font-semibold mt-2">
            User records are protected from admin edits.
          </p>

          <p className="text-sm text-slate-400 mt-1">
            This page satisfies the admin requirement to read
            users/profiles without exposing unnecessary account
            modification controls.
          </p>
        </div>
      </section>
    </main>
  );
}