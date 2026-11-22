"use client";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@base-ui/react/avatar";
import { Camera, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "VH"
  );
}

// Clerk caps avatar uploads at 10MB; reject early with a clear message rather
// than letting the request fail opaquely.
const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export function ProfileView() {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Seed the form from Clerk exactly once it loads; after that the inputs own
  // their state so typing isn't clobbered by re-renders.
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  if (isLoaded && user && !seeded) {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setSeeded(true);
  }

  if (!isLoaded || !user) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="size-6 animate-spin text-fg-3" aria-hidden />
      </div>
    );
  }

  const name = user.fullName ?? user.username ?? "Guest";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const dirty =
    firstName !== (user.firstName ?? "") || lastName !== (user.lastName ?? "");

  async function saveProfile() {
    if (!user || !dirty) return;
    setSaving(true);
    try {
      await user.update({ firstName, lastName });
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't update your profile");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      await user.setProfileImage({ file });
      toast.success("Photo updated");
    } catch {
      toast.error("Couldn't update your photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 font-display text-3xl text-fg-1">
          <UserRound aria-hidden className="size-6 text-terracotta" strokeWidth={2} />
          Profile
        </h1>
        <p className="text-md leading-relaxed text-fg-2">
          Manage how you appear across VisionHome.
        </p>
      </header>

      <div className="flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar.Root className="grid size-20 place-items-center overflow-hidden rounded-full bg-terracotta-muted text-xl font-semibold text-terracotta">
              <Avatar.Image
                src={user.imageUrl}
                alt={name}
                className="size-full object-cover"
              />
              <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
            </Avatar.Root>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
              className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-surface bg-terracotta text-white shadow-sm transition-colors duration-fast hover:bg-terracotta-dark disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Camera aria-hidden className="size-4" strokeWidth={2} />
              )}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAvatar(file);
                event.target.value = "";
              }}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate font-display text-lg text-fg-1">{name}</p>
            {email && <p className="truncate text-sm text-fg-3">{email}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-1">First name</span>
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-1">Last name</span>
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
            />
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="flex items-baseline gap-1.5 text-sm font-medium text-fg-1">
              Email
              <span className="text-xs font-normal text-fg-3">
                managed by your sign-in
              </span>
            </span>
            <Input value={email} readOnly disabled />
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={saveProfile}
            disabled={!dirty || saving}
            className="shadow-primary"
          >
            {saving ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
