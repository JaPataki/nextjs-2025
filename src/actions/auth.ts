"use server";

import { getDb } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const msg = encodeURIComponent("Missing email or password");
    redirect(`/login?error=${msg}`);
  }

  const db = getDb();

  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    const msg = encodeURIComponent("User not found");
    redirect(`/login?error=${msg}`);
  }

  
  if (user.password !== password) {
    const msg = encodeURIComponent("Invalid credentials");
    redirect(`/login?error=${msg}`);
  }

  
  (await cookies()).set({ name: "auth", value: String(user.id), path: "/", maxAge: 60 * 60 * 24 * 7 });

  
  redirect("/");
}

export async function logoutAction() {
 
  (await cookies()).set({ name: "auth", value: "", path: "/", maxAge: 0 });
  redirect("/login");
}


