"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const RESOURCE_LINKS = [
  { href: "/dashboard/resources/contacts", label: "Contacts" },
  { href: "/dashboard/resources/exec-board", label: "Exec Board" },
];

export function ResourcesNavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm outline-none hover:underline">
        Resources
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="uppercase tracking-wide">
        {RESOURCE_LINKS.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
