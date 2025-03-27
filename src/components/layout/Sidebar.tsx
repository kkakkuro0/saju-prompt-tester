"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const menuItems = [
    { name: "프로젝트", path: "/projects" },
    { name: "템플릿", path: "/templates" },
    { name: "시스템 프롬프트", path: "/system-prompts" },
    { name: "프롬프트 템플릿", path: "/prompt-templates" },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive(item.path)
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
