"use client";

import { useRef, useState } from "react";
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
  {
    href: "https://us06web.zoom.us/j/88469604123?pwd=948rW6ka1crSTpgy7V4Z1cUUJv57XX.1",
    label: "Zoom Meeting",
    external: true,
  },
  {
    href: "https://spacereservations.odu.edu/EmsWebApp/",
    label: "Room Reservations",
    external: true,
  },
];

const CLOSE_DELAY_MS = 150;

export function ResourcesNavMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openNow() {
    cancelClose();
    setOpen(true);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="font-heading text-sm uppercase tracking-wide outline-none hover:underline"
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
      >
        Resources
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="font-heading uppercase tracking-wide"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {RESOURCE_LINKS.map((link) =>
          link.external ? (
            <DropdownMenuItem
              key={link.href}
              render={<a href={link.href} target="_blank" rel="noopener noreferrer" />}
            >
              {link.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
              {link.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
