import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/input-otp";
import { Label } from "@repo/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEndIcon, LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SignInSocialButton } from "~/components/sign-in-social-button";

export const Route = createFileRoute("/_guest/login")({
  component: LoginForm,
});

function LoginForm() {
  const { redirectUrl } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const { mutate: sendOtpMutate, isPending: isSending } = useMutation({
    mutationFn: async (userEmail: string) => {
      await authClient.emailOtp.sendVerificationOtp({
        email: userEmail,
        type: "sign-in",
      });
    },
    onSuccess: () => {
      setOtpSent(true);
      toast.success("A verification code has been sent to your email.");
    },
    onError: ({ message }) => {
      toast.error(message || "Failed to send verification code.");
    },
  });

  const { mutate: verifyMutate, isPending: isVerifying } = useMutation({
    mutationFn: async () => {
      await authClient.signIn.emailOtp(
        {
          email,
          otp,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "Invalid verification code.");
          },
        },
      );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(authQueryOptions());
      await navigate({ to: redirectUrl });
    },
  });

  const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) return;
    const formData = new FormData(e.currentTarget);
    const userEmail = formData.get("email") as string;
    if (!userEmail) return;
    setEmail(userEmail);
    sendOtpMutate(userEmail);
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isVerifying || !otp) return;
    verifyMutate();
  };

  return (
    <div className="flex flex-col gap-6">
      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <Link to="/" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEndIcon className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </Link>
              <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a login code.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={isSending}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" size="lg" disabled={isSending}>
                {isSending && <LoaderCircleIcon className="animate-spin" />}
                {isSending ? "Sending code..." : "Continue with email"}
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SignInSocialButton
                provider="github"
                callbackURL={redirectUrl}
                disabled={isSending}
                icon={<SiGithub className="size-4" />}
              />
              <SignInSocialButton
                provider="google"
                callbackURL={redirectUrl}
                disabled={isSending}
                icon={<SiGoogle className="size-4" />}
              />
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <Link to="/" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEndIcon className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </Link>
              <h1 className="text-xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="otp" className="mx-auto">
                  Verification code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isVerifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" className="mt-2 w-full" size="lg" disabled={isVerifying}>
                {isVerifying && <LoaderCircleIcon className="animate-spin" />}
                {isVerifying ? "Verifying..." : "Verify and sign in"}
              </Button>
            </div>
            <button
              type="button"
              className="text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              disabled={isSending}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setEmail("");
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
