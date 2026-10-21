"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Generation = {
  id: string;
  user_id: string;
  prompt: string;
  generated_content: string;
  created_at: string;
};

type GenerationsManagerProps = {
  initialGenerations: Generation[];
  adminUserId: string;
};

export default function GenerationsManager({
  initialGenerations,
  adminUserId,
}: GenerationsManagerProps) {
  const router = useRouter();

  const [generations, setGenerations] =
    useState<Generation[]>(initialGenerations);

  const [creating, setCreating] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [prompt, setPrompt] =
    useState("");

  const [caption, setCaption] =
    useState("");

  const [editPrompt, setEditPrompt] =
    useState("");

  const [editCaption, setEditCaption] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const handleCreate = async () => {
    if (!prompt.trim() || !caption.trim()) {
      setMessage(
        "Please enter both a prompt and an AI caption."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("generations")
      .insert({
        user_id: adminUserId,
        prompt: prompt.trim(),
        generated_content: caption.trim(),
      })
      .select(
        "id, user_id, prompt, generated_content, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Create generation error:",
        error.message
      );

      setMessage(
        `Unable to create generation: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setGenerations((current) => [
      data,
      ...current,
    ]);

    setPrompt("");
    setCaption("");
    setCreating(false);

    setMessage(
      "Generation created successfully."
    );

    setSaving(false);

    router.refresh();
  };

  const startEditing = (
    generation: Generation
  ) => {
    setEditingId(generation.id);
    setEditPrompt(generation.prompt);
    setEditCaption(
      generation.generated_content
    );
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrompt("");
    setEditCaption("");
  };

  const handleUpdate = async (
    id: string
  ) => {
    if (
      !editPrompt.trim() ||
      !editCaption.trim()
    ) {
      setMessage(
        "Prompt and caption cannot be empty."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("generations")
      .update({
        prompt: editPrompt.trim(),
        generated_content:
          editCaption.trim(),
      })
      .eq("id", id)
      .select(
        "id, user_id, prompt, generated_content, created_at"
      )
      .single();

    if (error) {
      console.error(
        "Update generation error:",
        error.message
      );

      setMessage(
        `Unable to update generation: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setGenerations((current) =>
      current.map((generation) =>
        generation.id === id
          ? data
          : generation
      )
    );

    cancelEditing();

    setMessage(
      "Generation updated successfully."
    );

    setSaving(false);

    router.refresh();
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this generation? This action cannot be undone."
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Delete generation error:",
        error.message
      );

      setMessage(
        `Unable to delete generation: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setGenerations((current) =>
      current.filter(
        (generation) =>
          generation.id !== id
      )
    );

    setMessage(
      "Generation deleted successfully."
    );

    setSaving(false);

    router.refresh();
  };

  return (
    <>
      {/* Summary + Create */}
      <div className="grid md:grid-cols-[1fr_auto] gap-5 mb-7">
        <div className="rounded-[22px] bg-[#DDEEF7] border border-[#1D4F91]/10 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4F91]">
              Content Library
            </p>

            <p className="text-sm text-slate-600 mt-2">
              AI-generated captions stored in Supabase.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              Total Generations
            </p>

            <p className="text-3xl font-bold mt-1">
              {generations.length}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreating(!creating);
            setMessage("");
          }}
          className="rounded-[18px] bg-[#1D4F91] text-white px-7 py-4 font-semibold hover:bg-[#163d70] transition"
        >
          {creating
            ? "Cancel"
            : "+ Create Generation"}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-[26px] bg-white border border-[#1D4F91]/10 p-7 md:p-8 mb-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4F91]">
              New Content
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Create a generation
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Add an admin-created prompt and caption directly
              to the community database.
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">
              Prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) =>
                setPrompt(e.target.value)
              }
              rows={3}
              className="w-full rounded-xl border border-[#1D4F91]/15 bg-[#F7F5F0] px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#B9D9EB]"
              placeholder="Enter the original prompt..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              AI Caption
            </label>

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              rows={4}
              className="w-full rounded-xl border border-[#1D4F91]/15 bg-[#F7F5F0] px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#B9D9EB]"
              placeholder="Enter the AI-generated caption..."
            />
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="rounded-full bg-[#1D4F91] text-white px-6 py-3 font-semibold hover:bg-[#163d70] disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Generation"}
          </button>
        </div>
      )}

      {/* Status */}
      {message && (
        <div className="rounded-[18px] bg-[#DDEEF7] border border-[#1D4F91]/10 px-5 py-4 mb-6 text-sm font-medium text-[#1D4F91]">
          {message}
        </div>
      )}

      {/* Generations */}
      <div className="space-y-5">
        {generations.map(
          (generation, index) => {
            const isEditing =
              editingId === generation.id;

            return (
              <article
                key={generation.id}
                className="rounded-[24px] bg-white border border-[#1D4F91]/10 overflow-hidden"
              >
                {/* Card header */}
                <div
                  className={`px-6 py-4 border-b border-[#1D4F91]/10 flex items-center justify-between ${
                    index % 2 === 0
                      ? "bg-[#DDEEF7]/60"
                      : "bg-[#F7F5F0]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                      ✨
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1D4F91]">
                        AI Generation
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Campus Laughs content
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(
                      generation.created_at
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                <div className="p-7">
                  {isEditing ? (
                    <>
                      {/* Edit prompt */}
                      <div className="mb-5">
                        <label className="block text-sm font-semibold mb-2">
                          Prompt
                        </label>

                        <textarea
                          value={editPrompt}
                          onChange={(e) =>
                            setEditPrompt(
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full rounded-xl border border-[#1D4F91]/15 bg-[#F7F5F0] px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#B9D9EB]"
                        />
                      </div>

                      {/* Edit caption */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2">
                          AI Caption
                        </label>

                        <textarea
                          value={editCaption}
                          onChange={(e) =>
                            setEditCaption(
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full rounded-xl border border-[#1D4F91]/15 bg-[#F7F5F0] px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-[#B9D9EB]"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdate(
                              generation.id
                            )
                          }
                          disabled={saving}
                          className="rounded-full bg-[#1D4F91] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEditing
                          }
                          className="rounded-full border border-[#1D4F91]/15 px-5 py-2.5 text-sm font-semibold hover:bg-[#F7F5F0]"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                          {/* Prompt */}
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Prompt
                          </p>

                          <p className="text-slate-600 mt-2 leading-relaxed">
                            {generation.prompt}
                          </p>

                          {/* Caption */}
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4F91] mt-6">
                            AI Caption
                          </p>

                          <p className="text-2xl font-bold leading-snug mt-3 max-w-4xl">
                            “
                            {
                              generation.generated_content
                            }
                            ”
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                generation
                              )
                            }
                            className="rounded-full border border-[#1D4F91]/20 px-4 py-2 text-sm font-semibold text-[#1D4F91] hover:bg-[#DDEEF7]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                generation.id
                              )
                            }
                            disabled={saving}
                            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          }
        )}

        {generations.length === 0 && (
          <div className="rounded-[24px] bg-white border border-[#1D4F91]/10 p-12 text-center">
            <div className="text-4xl">
              ✨
            </div>

            <h2 className="text-xl font-bold mt-4">
              No generations found
            </h2>

            <p className="text-slate-500 mt-2">
              Create the first AI-generated caption from the
              admin panel.
            </p>
          </div>
        )}
      </div>

      {/* Admin note */}
      <div className="mt-8 rounded-[22px] bg-[#071D3B] text-white px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B9D9EB]">
          Full CRUD Access
        </p>

        <p className="font-semibold mt-2">
          Administrators can create, read, update, and delete
          AI-generated media.
        </p>

        <p className="text-sm text-slate-400 mt-1">
          Changes are written directly to the Supabase
          generations table and reflected in the Campus Laughs
          user app.
        </p>
      </div>
    </>
  );
}