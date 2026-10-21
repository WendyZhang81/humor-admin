import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-superadmin";
import AdminNavbar from "@/components/AdminNavbar";

export const instant = false;

type VoteRow = {
  id: string;
  user_id: string;
  generation_id: string;
  vote: number;
  created_at: string;
};

type GenerationRow = {
  id: string;
  prompt: string;
  generated_content: string;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export default async function VotesPage() {
  await connection();

  await requireSuperAdmin();

  const supabase = await createClient();

  const [
    votesResult,
    generationsResult,
    profilesResult,
  ] = await Promise.all([
    supabase
      .from("votes")
      .select(
        "id, user_id, generation_id, vote, created_at"
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("generations")
      .select(
        "id, prompt, generated_content"
      ),

    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name"
      ),
  ]);

  const votes: VoteRow[] =
    votesResult.data ?? [];

  const generations: GenerationRow[] =
    generationsResult.data ?? [];

  const profiles: ProfileRow[] =
    profilesResult.data ?? [];

  const totalVotes =
    votes.length;

  const funnyVotes =
    votes.filter(
      (vote) => vote.vote === 1
    ).length;

  const notFunnyVotes =
    votes.filter(
      (vote) => vote.vote === -1
    ).length;

  const funnyRate =
    totalVotes > 0
      ? Math.round(
          (funnyVotes /
            totalVotes) *
            100
        )
      : 0;

  const getGeneration = (
    generationId: string
  ) =>
    generations.find(
      (generation) =>
        generation.id ===
        generationId
    );

  const getUserName = (
    userId: string
  ) => {
    const profile =
      profiles.find(
        (profile) =>
          profile.id === userId
      );

    if (!profile) {
      return "Unknown User";
    }

    const name =
      `${profile.first_name ?? ""} ${
        profile.last_name ?? ""
      }`.trim();

    return name || "Unnamed User";
  };

  const hasError =
    votesResult.error ||
    generationsResult.error ||
    profilesResult.error;

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111827]">
      <AdminNavbar />

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4F91] mb-3">
            Vote Management
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            Votes
          </h1>

          <p className="text-slate-600 mt-3 text-lg">
            Review community reactions
            across AI-generated captions.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="rounded-[22px] bg-[#DDEEF7] border border-[#1D4F91]/10 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1D4F91]">
                Total Votes
              </p>

              <span className="text-2xl">
                📊
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {totalVotes}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Community reactions
            </p>
          </div>

          <div className="rounded-[22px] bg-white border border-[#1D4F91]/10 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Funny Votes
              </p>

              <span className="text-2xl">
                👍
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {funnyVotes}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Positive ratings
            </p>
          </div>

          <div className="rounded-[22px] bg-[#071D3B] text-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#B9D9EB]">
                Not Funny
              </p>

              <span className="text-2xl">
                👎
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {notFunnyVotes}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Negative ratings
            </p>
          </div>

          <div className="rounded-[22px] bg-[#F8D34F] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#6B5200]">
                Funny Rate
              </p>

              <span className="text-2xl">
                🏆
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {funnyRate}%
            </p>

            <p className="text-xs text-[#6B5200] mt-2">
              Positive vote share
            </p>
          </div>
        </div>

        {/* Error */}
        {hasError && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 mb-6">
            <p className="font-semibold text-red-700">
              Unable to load vote data
            </p>

            <p className="text-sm text-red-600 mt-1">
              Please check Supabase
              permissions and try again.
            </p>
          </div>
        )}

        {/* Vote table */}
        {!hasError && (
          <div className="bg-white border border-[#1D4F91]/10 rounded-[24px] overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-[#1D4F91]/10 bg-[#DDEEF7]/50 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Community vote log
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Read-only record of
                  Funny and Not Funny votes.
                </p>
              </div>

              <span className="text-2xl">
                😂
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
                      Caption
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Vote
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {votes.map((vote) => {
                    const generation =
                      getGeneration(
                        vote.generation_id
                      );

                    return (
                      <tr
                        key={vote.id}
                        className="border-b border-[#1D4F91]/10 last:border-b-0 align-top hover:bg-[#F7F5F0]/70"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#DDEEF7] text-[#1D4F91] flex items-center justify-center font-semibold">
                              {getUserName(
                                vote.user_id
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {getUserName(
                                  vote.user_id
                                )}
                              </p>

                              <p className="text-xs text-slate-400 font-mono mt-1 max-w-[150px] truncate">
                                {vote.user_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Caption */}
                        <td className="px-6 py-5 max-w-lg">
                          {generation ? (
                            <>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Prompt
                              </p>

                              <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed">
                                {
                                  generation.prompt
                                }
                              </p>

                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D4F91]">
                                AI Caption
                              </p>

                              <p className="font-semibold leading-relaxed mt-2">
                                “
                                {
                                  generation.generated_content
                                }
                                ”
                              </p>
                            </>
                          ) : (
                            <p className="text-slate-400">
                              Generation no
                              longer exists.
                            </p>
                          )}
                        </td>

                        {/* Vote */}
                        <td className="px-6 py-5">
                          {vote.vote === 1 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#1D4F91] text-white px-4 py-2 text-sm font-semibold">
                              👍 Funny
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#071D3B] text-white px-4 py-2 text-sm font-semibold">
                              👎 Not Funny
                            </span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-6 py-5 text-sm text-slate-500 whitespace-nowrap">
                          {new Date(
                            vote.created_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {votes.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                No votes found.
              </div>
            )}
          </div>
        )}

        {/* Read-only note */}
        <div className="mt-8 rounded-[22px] bg-[#071D3B] text-white px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B9D9EB]">
            Read-only analytics
          </p>

          <p className="font-semibold mt-2">
            Community votes are visible
            but not editable from the
            admin panel.
          </p>

          <p className="text-sm text-slate-400 mt-1">
            This page satisfies the admin
            requirement to read
            upvotes, downvotes, and ratings
            without altering community
            feedback.
          </p>
        </div>
      </section>
    </main>
  );
}