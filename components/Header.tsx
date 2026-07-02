import React from 'react'
import { APP_NAME } from "@/lib/utils/constants";
import Link from "next/link";
import {Show, SignInButton, SignUpButton, UserButton} from "@clerk/nextjs";

const Header = () => {
  return (
    <>
        <header className="flex items-center justify-between gap-6 border-b border-zinc-200 bg-white px-6 py-4 text-zinc-950">
            <Link href="/" className="font-semibold tracking-tight">
              {APP_NAME}
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="/#features"
                className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
              >
                How It Works
              </Link>
              <Link
                href="/#memory"
                className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
              >
                Memory
              </Link>
            </nav>
            <nav className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </nav>
          </header>
    </>
  )
}

export default Header