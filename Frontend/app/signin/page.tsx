"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      alert("Please enter your email and password.");
      return;
    }

    const values = { email, password };

    try {
      const response = await axios.post("http://localhost:4000/user/signin", values);
      // Handle successful signin (e.g., store token, redirect)
      const token=response.data?.token as string | undefined;
      if(!token){
        alert("Signin failed: No token received");
        return;
      }
      localStorage.setItem("token",token);
      form.reset();
      router.push("/dashboard");
    } catch (error) {
      // Handle signin error
      alert("Signin failed: " + String(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-black/60">Sign in to continue to your Bloggin account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none ring-accent focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-5 text-sm text-black/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>

        <Link href="/" className="mt-4 inline-block text-sm text-black/60 hover:text-black">
          Back to home
        </Link>
      </section>
    </main>
  );
}
