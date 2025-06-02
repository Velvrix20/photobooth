    "use client"
    import Image from "next/image";
    import Link from "next/link";
    import { useRouter, usePathname } from "next/navigation";
    import { useEffect, useRef, useState, useTransition } from "react";
    import { useAuth } from "../context/AuthContext";
    import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger and Close icons

    export default function NavBar() {
        const searchBox = useRef();
        const pathName = usePathname();
        const [placeholder, setPlaceholder] = useState("CTRL + K");
        const [searchText, setSearchText] = useState(pathName ? `${pathName.slice(1).replace(/%20/g, ' ')}` : "");
        const router = useRouter();
        const [searchLoading, startTransition] = useTransition();
        const { user, role, logout, logoUrl, loading: authLoading } = useAuth();
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

        const onSearchHandler = (path) => {
            startTransition(() => {
                router.push(path);
            });
        };

        const handleShortCut = (e) => {
            const { ctrlKey, code } = e;

            if (ctrlKey && code === "KeyK") {
                e.preventDefault();
                searchBox.current?.focus();
                return
            }
            
            if (ctrlKey && code === "KeyS") {
                e.preventDefault();
                searchBox.current?.focus();
                return
            }
            
            if (ctrlKey && code === "KeyL") {
                e.preventDefault();
                searchBox.current?.focus();
                return
            }
            
            if (ctrlKey && code === "KeyF") {
                e.preventDefault();
                searchBox.current?.focus();
                return
            }
        }

        const handleSubmit = (e) => {
            e.preventDefault();

            if (String(searchText).length > 0) {
                onSearchHandler(`/${searchText}`);
            } else {
                onSearchHandler(`/`);
            }
        }

        useEffect(() => {
            document.addEventListener("keydown", (e) => handleShortCut(e));
            return (
                document.removeEventListener("keydown", (e) => handleShortCut(e))
            );
        }, []);

        const handleLogout = async () => {
            await logout();
            // Optionally, redirect here if not handled in AuthContext
            // router.push('/');
        };

        return (
            <section className="w-full py-4 sm:px-12 px-5 flex bg-white dark:bg-[#161618] justify-between duration-[.5s] border-b border-b-black/10 focus-within:border-b-black/25 shadow-xl shadow-black/10 focus-within:sticky max-sm:sticky top-0 z-[200] items-center">
                {/* Logo and Site Name */}
                <Link href={"/"} className="font-bold text-lg uppercase cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <Image
                        src={logoUrl || "/sly.svg"}
                        alt="Site Logo"
                        height={25}
                        width={25}
                        className={`dark:brightness-0 dark:invert ${searchText || placeholder !== "CTRL + K" ? "max-sm:w-8" : ""}`}
                        unoptimized={!!logoUrl}
                    />
                    <span className={`font-bold ${searchText || placeholder !== "CTRL + K" || isMobileMenuOpen ? "max-sm:hidden" : ""}`}>Photobooth</span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center space-x-4 ml-6">
                    <Link href={"/about"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200">About</Link>
                    {!authLoading && user && (
                        <Link href={"/account"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200">Account</Link>
                    )}
                    {!authLoading && user && role === 'admin' && (
                        <Link href={"/admin"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200">Admin</Link>
                    )}
                    {!authLoading && user && (role === 'admin' || role === 'moderator') && (
                         <Link href={"/moderator"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200">Moderator Panel</Link>
                    )}
                </nav>

                {/* Search Bar - Placed after desktop nav links and before auth links/hamburger on right */}
                 <div className={`hidden md:flex rounded-lg items-center gap-2 ${searchText || placeholder !== "CTRL + K" ? "border-black dark:border-white" : "focus-within:border-black focus-within:dark:border-white"} border-2 border-transparent overflow-hidden px-3 py-2 capitalize ml-auto mr-4`}>
                    {searchLoading && <Image
                        src="/spinner.svg"
                        alt="Loading spinner"
                        width={20}
                        height={20}
                        className="dark:invert"
                    />}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="search"
                            ref={searchBox}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border-none outline-none bg-transparent placeholder-shown:w-[5.5rem] focus:w-40 lg:focus:w-56 w-32 capitalize"
                            placeholder={`${placeholder}`}
                            onFocus={() => setPlaceholder("Find item...")}
                            onBlur={() => setPlaceholder("CTRL + K")}
                        />
                    </form>
                </div>


                {/* Desktop Auth Links & Hamburger Button Container */}
                <div className="flex items-center">
                    {/* Desktop Auth Links */}
                    <div className="hidden md:flex items-center">
                        {!authLoading && user ? (
                            <>
                                <span className="text-sm sm:text-base mr-4 hidden lg:inline">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !authLoading && !user ? (
                            <>
                                <Link href={"/login"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200 ml-2">Login</Link>
                                <Link href={"/signup"} className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200 ml-2">Sign Up</Link>
                            </>
                        ) : (
                          <div className="ml-4 h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        )}
                    </div>

                    {/* Hamburger Menu Button - visible only on md and smaller screens */}
                    <div className="md:hidden ml-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </section>

            {/* Mobile Menu Dropdown/Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#161618] shadow-lg z-[190] border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-col space-y-2 px-4 py-3">
                        {/* Search Bar in Mobile Menu */}
                        <div className={`flex md:hidden rounded-lg items-center gap-2 ${searchText || placeholder !== "CTRL + K" ? "border-black dark:border-white" : "focus-within:border-black focus-within:dark:border-white"} border-2 border-gray-300 dark:border-gray-600 overflow-hidden px-3 py-2 capitalize w-full mb-2`}>
                             {searchLoading && <Image src="/spinner.svg" alt="Loading spinner" width={20} height={20} className="dark:invert"/>}
                            <form onSubmit={handleSubmit} className="w-full">
                                <input
                                    type="search" ref={searchBox} value={searchText} onChange={(e) => setSearchText(e.target.value)}
                                    className="border-none outline-none bg-transparent placeholder-shown:w-full w-full capitalize"
                                    placeholder="Search..."
                                />
                            </form>
                        </div>

                        <Link href={"/about"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                        {!authLoading && user && (
                            <Link href={"/account"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                        )}
                        {!authLoading && user && role === 'admin' && (
                            <Link href={"/admin"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                        )}
                        {!authLoading && user && (role === 'admin' || role === 'moderator') && (
                             <Link href={"/moderator"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Moderator Panel</Link>
                        )}
                        <hr className="border-gray-200 dark:border-gray-600 my-2"/>
                        {/* Mobile Auth Links */}
                        {!authLoading && user ? (
                            <>
                                <span className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-700/30"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !authLoading && !user ? (
                            <>
                                <Link href={"/login"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                <Link href={"/signup"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                            </>
                        ) : (
                          <div className="px-3 py-2">
                            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                          </div>
                        )}
                    </nav>
                </div>
            )}
            {/* End Mobile Menu */}
            {/* Removed the potentially redundant div that was here, as search for mobile is in the menu now */}
            </section>
        );
    }