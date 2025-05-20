import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create a single Supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function registerUser(
  email: string,
  password: string,
  fullName: string
) {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "citizen",
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError };
    }

    if (!authData.user) {
      console.error("No user data returned from signUp");
      return { error: "Failed to create user" };
    }

    // Insert into user_profiles table (no foreign key constraint)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          email: email,
          full_name: fullName,
          role: "citizen",
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { error: profileError };
    }

    return { data: authData };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register user" };
  }
}

export async function syncProfileAfterLogin(userId: string) {
  // Check if profile already exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    // Fetch from user_profiles
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userProfile) {
      // Insert into profiles (id must match auth.users.id)
      await supabase.from("profiles").insert([
        {
          id: userId,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          created_at: userProfile.created_at,
        },
      ]);
    }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // After successful login, sync profile
    if (data.user) {
      await syncProfileAfterLogin(data.user.id);
    }

    return { data };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to login" };
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error };
    }
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Failed to logout" };
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      return { error };
    }
    return { user };
  } catch (error) {
    console.error("Get user error:", error);
    return { error: "Failed to get user" };
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}
