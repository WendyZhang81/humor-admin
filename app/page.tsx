import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-superadmin";
import AdminNavbar from "@/components/AdminNavbar";

export const instant = false;

type Generation = {
  id: string;
  prompt: string;
  generated_content: string;
};

type Vote = {
  generation_id: string;
  vote: number;
};

export default async function AdminHomePage() {
  await connection();

  const { profile } = await requireSuperAdmin();
  const supabase = await createClient();

  const [
    profilesResult,
    generationsResult,
    votesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id"),

    supabase
      .from("generations")
      .select(
        "id, prompt, generated_content"
      ),

    supabase
      .from("votes")
      .select("generation_id, vote"),
  ]);

  const profiles =
    profilesResult.data ?? [];

  const generations: Generation[] =
    generationsResult.data ?? [];

  const votes: Vote[] =
    votesResult.data ?? [];

  const totalUsers =
    profiles.length;

  const totalGenerations =
    generations.length;

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

  const generationStats =
    generations.map(
      (generation) => {
        const generationVotes =
          votes.filter(
            (vote) =>
              vote.generation_id ===
              generation.id
          );

        const upvotes =
          generationVotes.filter(
            (vote) =>
              vote.vote === 1
          ).length;

        const downvotes =
          generationVotes.filter(
            (vote) =>
              vote.vote === -1
          ).length;

        return {
          ...generation,
          totalVotes:
            generationVotes.length,
          score:
            upvotes -
            downvotes,
        };
      }
    );

  generationStats.sort(
    (a, b) =>
      b.totalVotes -
      a.totalVotes
  );

  const mostVoted =
    generationStats[0] ?? null;

  const displayName =
    profile?.first_name
      ? `${profile.first_name} ${
          profile.last_name ?? ""
        }`.trim()
      : "Admin";

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#111827]">
      <AdminNavbar />

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4F91] mb-3">
              Campus Laughs Admin
            </p>

            <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
              Dashboard
            </h1>

            <p className="text-slate-600 mt-3 text-lg">
              Welcome back,{" "}
              <span className="font-semibold">
                {displayName}
              </span>
              . Here&apos;s what&apos;s
              happening in the community.
            </p>
          </div>

          <div className="rounded-full bg-[#DDEEF7] text-[#1D4F91] px-4 py-2 text-sm font-semibold">
            ✓ Superadmin
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Users */}
          <div className="rounded-[22px] bg-[#DDEEF7] border border-[#1D4F91]/10 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#1D4F91]">
                Total Users
              </p>

              <span className="text-2xl">
                👥
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {totalUsers}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Registered profiles
            </p>
          </div>

          {/* Captions */}
          <div className="rounded-[22px] bg-white border border-[#1D4F91]/10 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                AI Captions
              </p>

              <span className="text-2xl">
                ✨
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {totalGenerations}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Generated content
            </p>
          </div>

          {/* Votes */}
          <div className="rounded-[22px] bg-[#071D3B] text-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#B9D9EB]">
                Total Votes
              </p>

              <span className="text-2xl">
                😂
              </span>
            </div>

            <p className="text-4xl font-bold mt-5">
              {totalVotes}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Community reactions
            </p>
          </div>

          {/* Funny Rate */}
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
              Positive community votes
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vote breakdown */}
          <div className="rounded-[26px] bg-white border border-[#1D4F91]/10 p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4F91]">
              Vote Breakdown
            </p>

            <h2 className="text-2xl font-bold mt-3">
              Community reactions
            </h2>

            <p className="text-sm text-slate-500 mt-2 mb-8">
              How the community is reacting
              to AI-generated captions.
            </p>

            {/* Funny */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">
                  👍 Funny
                </p>

                <p className="font-bold">
                  {funnyVotes}
                </p>
              </div>

              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1D4F91]"
                  style={{
                    width:
                      totalVotes > 0
                        ? `${(
                            funnyVotes /
                            totalVotes
                          ) *
                          100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Not Funny */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">
                  👎 Not Funny
                </p>

                <p className="font-bold">
                  {notFunnyVotes}
                </p>
              </div>

              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{
                    width:
                      totalVotes > 0
                        ? `${(
                            notFunnyVotes /
                            totalVotes
                          ) *
                          100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#DDEEF7] px-5 py-4">
              <p className="text-sm text-[#1D4F91]">
                <span className="font-bold">
                  {funnyRate}%
                </span>{" "}
                of all community votes are
                currently positive.
              </p>
            </div>
          </div>

          {/* Most voted */}
          <div className="rounded-[26px] bg-[#071D3B] text-white p-7 md:p-8 flex flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B9D9EB]">
                Most Voted
              </p>

              <h2 className="text-2xl font-bold mt-3">
                Community hotspot
              </h2>
            </div>

            {mostVoted ? (
              <div className="mt-8 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Prompt
                </p>

                <p className="text-slate-300 mt-2 leading-relaxed">
                  {mostVoted.prompt}
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B9D9EB] mt-7">
                  AI Caption
                </p>

                <p className="text-2xl font-bold leading-snug mt-3">
                  “
                  {
                    mostVoted.generated_content
                  }
                  ”
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                    {mostVoted.totalVotes}{" "}
                    {mostVoted.totalVotes === 1
                      ? "vote"
                      : "votes"}
                  </span>

                  <span className="rounded-full bg-[#F8D34F] text-[#071D3B] px-4 py-2 text-sm font-semibold">
                    Score{" "}
                    {mostVoted.score}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex-1 flex items-center justify-center">
                <p className="text-slate-400">
                  No generations available yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Admin note */}
        <div className="mt-8 rounded-[22px] border border-[#1D4F91]/10 bg-white px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-semibold">
              Superadmin access confirmed
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Manage users, generations,
              and community votes using
              the navigation above.
            </p>
          </div>

          <div className="flex gap-2">
            <span className="rounded-full bg-[#DDEEF7] text-[#1D4F91] px-3 py-1.5 text-xs font-semibold">
              Users
            </span>

            <span className="rounded-full bg-[#DDEEF7] text-[#1D4F91] px-3 py-1.5 text-xs font-semibold">
              Content
            </span>

            <span className="rounded-full bg-[#DDEEF7] text-[#1D4F91] px-3 py-1.5 text-xs font-semibold">
              Votes
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}