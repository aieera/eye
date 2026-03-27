import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Info, Server, User } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useChangePasswordMutation } from "@/modules/auth/api/authApi";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "system", label: "System", icon: Server },
  { value: "about", label: "About", icon: Info },
];

function ProfileTab() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap();
      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to change password");
    }
  };

  const initials = user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  return (
    <div className="space-y-5 max-w-lg">
      {/* Profile card */}
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <h3 className="text-sm font-medium mb-4">Account Info</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-lg font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div>
            <p className="font-medium">{user?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded mt-1 inline-block capitalize">
              {user?.role ?? "admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Change Password
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input id="currentPassword" type={showCurrent ? "text" : "password"} {...register("currentPassword")} className="h-9 pr-9" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrent((v) => !v)}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input id="newPassword" type={showNew ? "text" : "password"} {...register("newPassword")} className="h-9 pr-9" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNew((v) => !v)}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="h-9" />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SystemTab() {
  const info = [
    { label: "Platform", value: "Eye Digital Signage" },
    { label: "Version", value: "1.0.0" },
    { label: "API Base", value: import.meta.env.VITE_API_URL ?? "/api/v1" },
    { label: "Environment", value: import.meta.env.MODE },
  ];

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-muted-foreground" /> System Information
        </h3>
        <div className="space-y-3">
          {info.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-xs font-mono font-medium bg-muted text-foreground px-2 py-0.5 rounded">{value}</span>
            </div>
          ))}
          <Separator />
          <a href="/api-docs" target="_blank" rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Open API Documentation (Swagger)
          </a>
        </div>
      </div>
    </div>
  );
}

function AboutTab() {
  const stack = ["Node.js + Express + TypeScript", "Prisma + MySQL", "React 18 + Vite + Tailwind", "Redux Toolkit + RTK Query", "Socket.IO (realtime)", "BullMQ + Redis", "Oracle DB (ingestion)", "React Native (Android)"];

  return (
    <div className="max-w-lg">
      <div className="bg-card rounded-xl border border-border/60 p-5">
        <h3 className="text-sm font-medium mb-2">About Eye Platform</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Eye is a Digital Signage Platform built for Dubai Duty Free. It manages product
          displays on Android tablet screens across airport terminal locations.
        </p>
        <Separator className="mb-4" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Technology Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span key={s} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6 animate-in fade-in duration-200">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and platform settings</p>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "w-full flex items-center gap-3 h-9 rounded-lg px-3 text-sm transition-colors",
                    activeTab === tab.value
                      ? "bg-primary/[0.08] text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "system" && <SystemTab />}
          {activeTab === "about" && <AboutTab />}
        </div>
      </div>
    </div>
  );
}
