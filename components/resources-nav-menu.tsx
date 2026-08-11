"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const RESOURCE_LINKS = [{ href: "/dashboard/resources/contacts", label: "Contacts" }];

export function ResourcesNavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm outline-none hover:underline">
        Resources
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {RESOURCE_LINKS.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
