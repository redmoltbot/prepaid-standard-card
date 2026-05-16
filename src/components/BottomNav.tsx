"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CreditCard, Search, Bell } from "lucide-react";

const TABS = [
  { label: "Home", route: "/home", Icon: Home },
  { label: "Customers", route: "/customers", Icon: Users },
  { label: "Cards", route: "/cards", Icon: CreditCard },
  { label: "Find", route: "/find", Icon: Search },
  { label: "Push", route: "/push", Icon: Bell },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
      <div className="flex">
        {TABS.map(({ label, route, Icon }) => {
          const active = pathname === route;
          return (
            <Link
              key={route}
              href={route}
              className={`flex-1 flex flex-col items-center py-3 transition-colors
                ${active
                  ? "text-[var(--clr-primary)] border-t-2 border-[var(--clr-primary)] -mt-px"
                  : "text-muted-foreground"}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
