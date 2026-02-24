"use client";

import React, { useEffect, useState } from "react";
import { loginAction } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);


  function getCookie(name: string) {
    return document.cookie.split("; ").reduce((r, v) => {
      const parts = v.split("=");
      return parts[0] === name ? decodeURIComponent(parts.slice(1).join("=")) : r;
    }, "");
  }

  useEffect(() => {
    const v = getCookie("auth");
    if (v) setLoggedIn(true);
  }, []);


  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card w-full max-w-md bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          {loggedIn ? (
            <div className="text-center">You&apos;re logged in.</div>
          ) : (
            <form action={loginAction} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-between items-center">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
              <Link href="/" className="link">
                Back
              </Link>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
