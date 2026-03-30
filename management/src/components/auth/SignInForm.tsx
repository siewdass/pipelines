import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import { useForm } from "../../hooks/useForm";
import { useAuthStore } from "../../state/auth";
import Button from "../ui/button/Button";
import { useToast } from "../../hooks/useToast";

const SIGN_IN_SCHEMA = {
  type: 'vertical',
  items: [
    { type: 'string', name: 'email', label: 'Email', pattern: 'email', required: true },
    { type: 'string', name: 'password', label: 'Password', pattern: 'password', required: true, min: 6 }
  ]
};

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const auth = useAuthStore();
  const toast = useToast();

  const [onSubmit, Form] = useForm(SIGN_IN_SCHEMA);

  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      console.log(formData)
      await auth.login(formData.email, formData.password);
      navigate("/");
      toast.success("Logged in successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <HiChevronLeft className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <FcGoogle className="size-5" />
                Sign in with Google
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <FaXTwitter className="size-5" />
                Sign in with X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <Form />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900" />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div>
                <Button 
                  className="w-full" 
                  size="sm" 
                  disabled={loading} 
                  onClick={() => onSubmit(handleSave)}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
