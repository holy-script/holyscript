"use client";

import { useTheme } from "@/providers/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 shadow-md text-gray-900 dark:text-white transition-all"
    >
      {isDarkMode ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
