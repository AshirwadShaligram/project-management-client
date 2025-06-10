"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const ResetPassword = () => {
  const params = useParams();
  const resetToken = params.token;
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8) {
        passwordErrors.push("at least 8 characters");
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("one uppercase letter");
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push("one number");
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        passwordErrors.push("one special character");
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(
          ", "
        )}`;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        resetPassword({
          resetToken,
          password: formData.password,
        })
      ).unwrap();

      setIsPasswordReset(true);
      toast.success("Password reset successfully", {
        description: "You can now sign in with your new password",
      });
    } catch (error) {
      toast.error("Password reset failed", {
        description: error || "An error occurred while resetting your password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPasswordReset) {
    return (
      <AuthLayout
        title="Password reset successful"
        subtitle="Your password has been updated"
      >
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <Button type="button" fullWidth onClick={() => router.push("/login")}>
            Sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="New Password"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset password
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

export default ResetPassword;
