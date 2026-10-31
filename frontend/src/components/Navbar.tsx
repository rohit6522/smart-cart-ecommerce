"use client";

import Header from "./Header";

export interface NavbarProps {
  title?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ title, onSearch }: NavbarProps) {
  return <Header />;
}
