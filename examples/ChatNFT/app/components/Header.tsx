'use client';

import { Navbar } from "flowbite-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const currentPath = usePathname();

  return (
    <Navbar
      fluid={true}
      rounded={true}
    >
      <Navbar.Brand href="/">
        <img
          src="/billy.svg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {currentPath === "/" && <p>Search NFT with ChatGPT</p>}
            {currentPath === "/docs" && <p>Documentation</p>}
            {currentPath === "/contributes" && <p>Contribute vectorDB indexes</p>}
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link
          href="/"
          active={currentPath =="/"}
        >
          Home
        </Navbar.Link>
        <Navbar.Link
          href="/docs"
          active={currentPath == "/docs"}
        >
          Docs
        </Navbar.Link>
        <Navbar.Link
          href="/contributes"
          active={currentPath == "/contributes"}
        >
          Contributes
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}