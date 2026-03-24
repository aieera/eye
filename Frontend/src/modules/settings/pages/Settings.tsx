import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Info, Server } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useChangePasswordMutation } from "@/modules/auth/api/authApi";
import PageContainer from "@/shared/components/PageContainer";

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

function ProfileTab() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap();
      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to change password");
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Info</CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Name</Label>
            <p className="font-medium mt-0.5">{user?.name ?? "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Email</Label>
            <p className="font-medium mt-0.5">{user?.email ?? "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Role</Label>
            <div className="mt-0.5">
              <Badge variant="secondary">{user?.role ?? "—"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  {...register("currentPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  {...register("newPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
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
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {info.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium font-mono text-xs bg-muted px-2 py-0.5 rounded">{value}</span>
            </div>
          ))}
          <Separator />
          <div className="text-sm">
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              <Info className="h-3.5 w-3.5" />
              Open API Documentation (Swagger)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Eye Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Eye is a Digital Signage Platform built for Dubai Duty Free. It manages product
            displays on Android tablet screens across airport terminal locations.
          </p>
          <Separator />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Technology Stack</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Backend: Node.js + Express + TypeScript + Prisma (MySQL)</li>
              <li>Frontend: React 18 + Vite + Redux Toolkit + Tailwind CSS</li>
              <li>Realtime: Socket.IO</li>
              <li>Jobs: BullMQ + Redis</li>
              <li>Data: Oracle DB via oracledb driver</li>
              <li>Display: React Native (Android tablets)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  return (
    <PageContainer title="Settings">
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
        <TabsContent value="about"><AboutTab /></TabsContent>
      </Tabs>
    </PageContainer>
  );
}
