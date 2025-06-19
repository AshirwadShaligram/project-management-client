"use client";
import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "@/redux/slice/authSlice";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get auth state from Redux
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Password validation
  const passwordRequirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.password.length > 0;

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Registration failed", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // registration success
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Registration successful!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (!passwordsMatch) {
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

    if (!validateForm()) return;

    try {
      await dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      // Clear form on success
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <AuthLayout title="Create an account" subtitle="Sign up to get started">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="name"
          id="name"
          placeholder="John Doe"
          icon={<User size={18} />}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          autoComplete="name"
        />

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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
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
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-500" />
            ) : (
              <Eye size={18} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-medium">Password Requirements:</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {Object.entries(passwordRequirements).map(([key, isValid]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 ${
                    isValid ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isValid ? "bg-green-600" : "bg-muted-foreground"
                    }`}
                  />
                  {key === "length" && "At least 8 characters"}
                  {key === "uppercase" && "One uppercase letter"}
                  {key === "number" && "One number"}
                  {key === "special" && "One special character"}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
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
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} className="text-gray-500" />
            ) : (
              <Eye size={18} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* Password match indicator */}
        {formData.confirmPassword && (
          <Alert
            className={
              passwordsMatch
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription
              className={passwordsMatch ? "text-green-700" : "text-red-700"}
            >
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" fullWidth isLoading={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
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

export default Register;
