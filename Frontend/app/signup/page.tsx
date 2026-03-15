"use client";

import Link from "next/link";
import axios from "axios";
import type { FormEvent } from "react";

export default function SignupPage() {
  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await axios.post("http://localhost:4000/user/signup", values);
      console.log(response.data);
      alert("User created successfully");
      form.reset();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Signup failed");
      } else {
        alert("Signup failed");
      }
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-black/60">Join Bloggin to write, read, and connect with people.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-black/70">
              Full name
            </label>
            <input
              id="name"
              name="fullName"
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none ring-accent focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-black/70">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none ring-accent focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-black/70">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none ring-accent focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Sign up
          </button>
        </form>

        <p className="mt-5 text-sm text-black/60">
          Already have an account?{" "}
          <Link href="/signin" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>

        <Link href="/" className="mt-4 inline-block text-sm text-black/60 hover:text-black">
          Back to home
        </Link>
      </section>
    </main>
  );
}
