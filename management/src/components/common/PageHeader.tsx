import React from "react";
import { HiChevronLeft } from "react-icons/hi2";
import { useNavigate } from "react-router";
import PageBreadcrumb from "./PageBreadCrumb";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  backTo?: string;
  back?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, backTo, back, children, className = "" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (back) {
      navigate(-1);
    } else if (backTo) {
      navigate(backTo);
    }
  };

  return (
    <div className={"flex items-center justify-between gap-4 " + className}>
      <div className="flex items-center gap-3">
        {(backTo || back) && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 shrink-0 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <HiChevronLeft className="size-5" />
          </button>
        )}
        <div>
          <PageBreadcrumb pageTitle={title} />
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
};

export default PageHeader;
