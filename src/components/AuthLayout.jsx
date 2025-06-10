import React from "react";
import { KeyRound } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all dark:bg-gray-800">
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <KeyRound className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
