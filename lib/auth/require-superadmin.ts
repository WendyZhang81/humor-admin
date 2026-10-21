import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireSuperAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, avatar_url, is_superadmin"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Error checking admin profile:",
      error.message
    );

    redirect("/unauthorized");
  }

  if (!profile?.is_superadmin) {
    redirect("/unauthorized");
  }

  return {
    user,
    profile,
  };
}
