"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-sm text-center">
        <p className="text-sm font-semibold text-gray-500 mb-3">
          HUMOR ADMIN
        </p>

        <h1 className="text-3xl font-bold mb-3">
          Admin Sign In
        </h1>

        <p className="text-gray-600 mb-8">
          Sign in with your authorized Google account to continue.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-black text-white rounded-lg px-5 py-3 hover:bg-gray-800"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}