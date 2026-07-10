import { Link } from "react-router";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 border-b">
      <div className="flex items-center justify-between w-full gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
            <HiOutlineSquares2X2 className="size-4" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
            PIPELINES
          </span>
        </Link>

        <div className="flex items-center gap-2 2xsm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
