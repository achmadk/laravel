import GuestLayout from "@/layouts/guest-layout";
import { Head, useForm } from "@inertiajs/react";
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ResetPasswordProps {
  token: string;
  email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token,
    email,
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => reset("password", "password_confirmation");
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/reset-password");
  };

  return (
    <>
      <Head title="Reset Password" />

      <form onSubmit={submit} className="space-y-5">
        {/* Email */}
        <div className="animate-fade-up stagger-1">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-[var(--fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
              errors.email
                ? "border-danger-500"
                : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
            }`}
            autoComplete="username"
            autoFocus
          />
          {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="animate-fade-up stagger-2">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Password Baru</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Minimal 8 karakter"
              className={`h-11 w-full rounded-xl border bg-white px-4 pr-11 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="animate-fade-up stagger-3">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              placeholder="Ulangi password"
              className={`h-11 w-full rounded-xl border bg-white px-4 pr-11 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password_confirmation
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
              tabIndex={-1}
            >
              {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-danger-500">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Submit */}
        <div className="animate-fade-up stagger-4">
          <button
            type="submit"
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 active:scale-[0.985] focus:ring-3 focus:ring-[var(--primary-subtle)] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

ResetPassword.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Reset Password"
    description="Masukkan email dan password baru Anda."
    children={page}
  />
);
