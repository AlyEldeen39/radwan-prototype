"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoginCredentials } from "@/types";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  role: "student" | "parent" | "instructor";
  apiEndpoint?: string;
  redirectTo?: string;
  showSocialLogin?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  role,
  redirectTo,
  showSocialLogin = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { login, isLoggedIn, user, isLoading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;

    if (isLoggedIn && user) {
      const defaultRedirects: Record<string, string> = {
        student: "/dashboard/student",
        parent: "/dashboard/parent",
        instructor: "/dashboard/instructor",
      };
      const redirectPath =
        redirectTo ||
        defaultRedirects[user.role || "student"] ||
        `/dashboard/${user.role}`;

      // Only redirect if we're not already on the target page
      if (pathname !== redirectPath) {
        router.push(redirectPath);
      }
    }
  }, [authLoading, isLoggedIn, user, router, redirectTo, pathname]);

  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState<string>("");

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Clear login error
      if (loginError) {
        setLoginError("");
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "رقم الهاتف أو البريد الإلكتروني مطلوب";
    }

    if (!formData.password.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      // Use email/phone as identifier
      await login(formData.identifier, formData.password);

      // Redirect based on role preference or default
      const defaultRedirects: Record<string, string> = {
        student: "/dashboard/student",
        parent: "/dashboard/parent",
        instructor: "/dashboard/instructor",
      };

      const redirectPath = redirectTo || defaultRedirects[role] || "/dashboard";
      router.push(redirectPath);
    } catch (error: unknown) {
      console.error("Login error:", error);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    // TODO: Implement social login
    console.log(`Login with ${provider} for ${role}`);
  };

  const getRegisterLink = () => {
    switch (role) {
      case "instructor":
        return "/instructor/register";
      case "parent":
        return "/parent/register";
      case "student":
        return "/student/register";
      default:
        return "/register";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Login Error */}
      {loginError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm text-center">{loginError}</p>
        </div>
      )}

      {/* Identifier Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          رقم الهاتف أو البريد الإلكتروني
        </label>
        <Input
          type="text"
          placeholder="01xxxxxxxxx أو example@email.com"
          value={formData.identifier}
          onChange={handleInputChange("identifier")}
          error={errors.identifier}
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          كلمة المرور
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="ادخل كلمة المرور"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={handleInputChange("remember")}
            className="ml-2 rounded border-gray-300 text-primary focus:ring-primary"
          />
          تذكرني
        </label>
        <Link
          href="/forgot-password"
          className="text-primary hover:text-accent transition-colors"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        className="w-full"
      >
        تسجيل الدخول
      </Button>

      {/* Social Login - Only for students and parents */}
      {showSocialLogin && role !== "instructor" && (
        <>
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center gap-2"
            >
              <FaGoogle className="text-red-500" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center justify-center gap-2"
            >
              <FaFacebook className="text-blue-600" />
              Facebook
            </Button>
          </div>
        </>
      )}

      {/* Register Link */}
      <div className="text-center text-sm">
        <span className="text-gray-600">ليس لديك حساب؟ </span>
        <Link
          href={getRegisterLink()}
          className="text-primary hover:text-accent font-medium transition-colors"
        >
          إنشاء حساب جديد
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
