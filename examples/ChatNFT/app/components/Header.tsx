'use client';

import { Navbar } from "flowbite-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const currentPath = usePathname();

  return (
    <Navbar
      fluid={true}
      className="fixed w-full" 
    >
      <Navbar.Brand href="/">
        <img
          src="/billy.svg"
          className="mr-3 h-6 sm:h-9"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {currentPath === "/" && <p>ChatNFT</p>}
            {currentPath === "/docs" && <p>What is this?</p>}
            {currentPath === "/contributions" && <p>Contribute vectorDB indexes</p>}
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
          About
        </Navbar.Link>
        <Navbar.Link
          href="/contributions"
          active={currentPath == "/contributions"}
        >
          Contributions
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}