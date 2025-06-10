"use client";
import React, { useState } from "react";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await dispatch(forgotPassword(formData.email)).unwrap();
      setIsEmailSent(true);
      toast.success("Password reset email sent!", {
        description: "Check your email for reset instructions",
      });
    } catch (error) {
      toast.error("Failed to send reset email", {
        description: error || "An error occurred while sending the reset email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a link to reset your password"
      >
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent an email to <strong>{formData.email}</strong> with
            instructions to reset your password.
          </p>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push("/login")}
          >
            Return to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          id="email"
          placeholder="your@email.com"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send reset instructions
        </Button>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
