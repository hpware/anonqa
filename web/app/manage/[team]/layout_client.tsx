"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { ThemeProvider } from "./themeProvider";
import { useTheme } from "./themeProvider";
import Link from "next/link";
import { HamburgerIcon, HomeIcon, MenuIcon, XIcon } from "lucide-react";
import gsap from "gsap";

export default function ManagementPageLayout({
  children,
  userId,
  fname,
  slug,
}: Readonly<{
  children: React.ReactNode;
  userId: string;
  fname: string;
  slug: string;
}>) {
  const [scrolled, setScrolled] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (openMobileMenu) {
      // Show menu before animating
      gsap.set(mobileMenuRef.current, {
        visibility: "visible",
        opacity: 0,
      });

      // Create timeline for menu and items
      const tl = gsap.timeline();

      // Animate backdrop and menu
      tl.fromTo(
        mobileMenuRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.1,
          ease: "power2.out",
        },
      );

      // Animate menu items
      tl.fromTo(
        ".menu-item",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.1,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2", // Overlap with previous animation
      );
    } else if (mobileMenuRef.current) {
      // Timeline for closing animations
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(mobileMenuRef.current, { visibility: "hidden" });
        },
      });

      // Animate out menu items first
      tl.to(".menu-items", {
        opacity: 0,
        y: 20,
        duration: 0.1,
        stagger: 0.05,
        ease: "power2.in",
      });

      // Then fade out the backdrop
      tl.to(
        mobileMenuRef.current,
        {
          opacity: 0,
          duration: 0.1,
          ease: "power2.in",
        },
        "-=0.2",
      );
    }
  }, [openMobileMenu]);

  const links = [
    {
      text: "Switch teams",
      link: `/manage/selectTeams`,
    },
    {
      text: "Team Home",
      link: `/manage/${slug}/`,
    },
    {
      text: "Settings",
      link: `/manage/${slug}/settings`,
    },
  ];

  return (
    <div className="min-h-screen transition-colors bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-col">
        <div
          className={`md:hidden flex min-h-12 fixed z-50 inset-x-0 flex-row justify-between text-center border transition-all duration-300 ${scrolled ? "mt-5 rounded-2xl mx-7 shadow border-gray-300/30 p-2 backdrop-blur-lg " : "mt-0 p-4 rounded-xl border-gray-300/0"}`}
        >
          <div></div>
          <button
            className="cursor-pointer"
            onClick={() => setOpenMobileMenu(true)}
          >
            <MenuIcon />
          </button>
        </div>
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-[60] bg-white/70 backdrop-blur-lg dark:bg-gray-900 flex flex-col"
          style={{ visibility: "hidden" }} // Initial state
        >
          <div className="flex justify-end p-4">
            <button
              className="cursor-pointer"
              onClick={() => setOpenMobileMenu(false)}
            >
              <XIcon />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 h-full pb-20">
            <span className="text-lg font-medium mb-4 ph-no-capture">
              You are logged in as {fname}!
            </span>
            {links.map((i) => (
              <Link
                href={i.link}
                key={i.text}
                onClick={() => setOpenMobileMenu(false)}
              >
                <button className=" w-48 px-6 py-4 text-lg bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  {i.text}
                </button>
              </Link>
            ))}
            <a href="/auth/logout" onClick={() => setOpenMobileMenu(false)}>
              <button className="w-48 px-6 py-4 text-lg bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Logout
              </button>
            </a>
          </div>
        </div>
        <div
          className={`md:flex hidden min-h-12 fixed z-50 inset-x-0 flex-row justify-between text-center border transition-all duration-300 ${scrolled ? "mt-5 rounded-2xl mx-7 shadow border-gray-300/30 p-2 backdrop-blur-lg " : "mt-0 p-4 rounded-xl border-gray-300/0"}`}
        >
          <div className="flex flex-row items-center justify-center text-center px-2 gap-1">
            {links.map((i) => (
              <Link href={i.link} key={i.text}>
                <button className="px-3 py-2 text-sm sm:text-base bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  {i.text}
                </button>
              </Link>
            ))}
            <a href="/auth/logout">
              <button className="px-3 py-2 text-sm sm:text-base bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Logout
              </button>
            </a>
            <span className="geint-sans">You are logged in as {fname}!</span>
          </div>
          <div></div>
        </div>
        <div className="pt-12 mt-6">{children}</div>
      </div>
    </div>
  );
}
