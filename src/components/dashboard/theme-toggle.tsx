import { toggleTheme } from "@/utils/theme";

interface ThemeToggleProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={() => toggleTheme(theme, setTheme)}
      className="absolute top-4 right-4 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
    >
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
