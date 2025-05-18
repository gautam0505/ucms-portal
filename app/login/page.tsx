"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { loginUser, getUserProfile } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";

const passwordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  role: z.enum(["citizen", "official", "admin"]),
});

const otpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, {
    message: "Please enter a valid 10-digit mobile number.",
  }),
  otp: z
    .string()
    .length(6, {
      message: "OTP must be 6 digits.",
    })
    .optional(),
  role: z.enum(["citizen", "official", "admin"]),
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [error, setError] = useState<string | null>(null);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "citizen",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      mobile: "",
      otp: "",
      role: "citizen",
    },
  });

  const handleSendOTP = async () => {
    const mobile = otpForm.getValues("mobile");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      otpForm.setError("mobile", {
        type: "manual",
        message: "Please enter a valid 10-digit mobile number.",
      });
      return;
    }

    try {
      // Call API to send OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
          role: otpForm.getValues("role"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send OTP");
      }

      // OTP sent successfully
      setOtpSent(true);
      setOtpResendTimer(30);

      // Start countdown timer
      const timer = setInterval(() => {
        setOtpResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "OTP Sent",
        description: "A one-time password has been sent to your mobile number.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await loginUser(values.email, values.password);
      if (error) {
        setError("Invalid email or password");
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile and redirect based on role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await getUserProfile(user.id);
        if (profile) {
          if (profile.role === "citizen") {
            router.push("/complaints");
          } else if (profile.role === "official" || profile.role === "admin") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }

      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    if (!values.otp) {
      otpForm.setError("otp", {
        type: "manual",
        message: "OTP is required.",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: values.mobile,
          otp: values.otp,
          role: values.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Invalid OTP");
      }

      const data = await response.json();

      // Redirect based on role after successful login
      if (values.role === "citizen") {
        router.push("/complaints");
      } else {
        router.push("/dashboard");
      }

      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(error instanceof Error ? error.message : "Invalid OTP");
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Access your account to manage complaints
          </CardDescription>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="password"
            onValueChange={(value) => setActiveTab(value as "password" | "otp")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={passwordForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login As</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="citizen">Citizen</SelectItem>
                            <SelectItem value="official">Official</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="otp">
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={otpForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login As</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="citizen">Citizen</SelectItem>
                            <SelectItem value="official">Official</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={otpForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="10-digit mobile number"
                              {...field}
                              disabled={otpSent}
                              inputMode="numeric"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpSent && otpResendTimer > 0}
                          >
                            {otpSent
                              ? otpResendTimer > 0
                                ? `${otpResendTimer}s`
                                : "Resend OTP"
                              : "Send OTP"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {otpSent && (
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OTP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit OTP"
                              {...field}
                              maxLength={6}
                              inputMode="numeric"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !otpSent}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login with OTP
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
