"use client"
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";

export default function NavBar() {
    const searchBox = useRef();
    const pathName = usePathname();
    const [placeholder, setPlaceholder] = useState("CTRL + K");
    const [searchText, setSearchText] = useState(pathName ? `${pathName.slice(1).replace(/%20/g, ' ')}` : "");
    const router = useRouter();
    const [searchLoading, startTransition] = useTransition();
    const { user, role, logout, logoUrl, loading: authLoading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const onSearchHandler = (path) => {
        startTransition(() => {
            router.push(path);
        });
    };

    const handleShortCut = (e) => {
        if ((e.ctrlKey || e.metaKey) && ["KeyK", "KeyS", "KeyL", "KeyF"].includes(e.code)) {
            e.preventDefault();
            searchBox.current?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearchHandler(searchText ? `/${searchText}` : `/`);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        document.addEventListener("keydown", handleShortCut);
        return () => document.removeEventListener("keydown", handleShortCut);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Main Navigation Bar */}
            <header className="w-full py-4 sm:px-12 px-5 flex bg-white dark:bg-[#161618] justify-between duration-500 border-b border-black/10 shadow-xl shadow-black/10 sticky top-0 z-[200] items-center">
                {/* Logo and Site Name */}
                <Link href="/" className="font-bold text-lg uppercase cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <Image
                        src={logoUrl || "/sly.svg"}
                        alt="Site Logo"
                        height={25}
                        width={25}
                        className="dark:brightness-0 dark:invert"
                        unoptimized={!!logoUrl}
                    />
                    <span className="max-sm:hidden font-bold">Photobooth</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-4 ml-6">
                    <Link href="/about" className="text-sm sm:text-base hover:opacity-80 transition-opacity">About</Link>
                    {!authLoading && user && (
                        <Link href="/account" className="text-sm sm:text-base hover:opacity-80 transition-opacity">Account</Link>
                    )}
                    {!authLoading && user && role === 'admin' && (
                        <Link href="/admin" className="text-sm sm:text-base hover:opacity-80 transition-opacity">Admin</Link>
                    )}
                    {!authLoading && user && (role === 'admin' || role === 'moderator') && (
                        <Link href="/moderator" className="text-sm sm:text-base hover:opacity-80 transition-opacity">Moderator Panel</Link>
                    )}
                </nav>

                {/* Desktop Search */}
                <div className="hidden md:flex items-center gap-2 ml-auto mr-4">
                    {searchLoading && (
                        <Image
                            src="/spinner.svg"
                            alt="Loading spinner"
                            width={20}
                            height={20}
                            className="dark:invert"
                        />
                    )}
                    <form onSubmit={handleSubmit} className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            ref={searchBox}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border-2 border-transparent focus:border-black dark:focus:border-white bg-gray-100 dark:bg-gray-700 focus:bg-transparent focus:w-64 transition-all duration-200 outline-none"
                            placeholder={placeholder}
                            onFocus={() => setPlaceholder("Search...")}
                            onBlur={() => setPlaceholder("CTRL + K")}
                        />
                    </form>
                </div>

                {/* Auth and Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {!authLoading && user ? (
                            <>
                                <span className="text-sm hidden lg:inline truncate max-w-xs">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !authLoading && !user ? (
                            <>
                                <Link href="/login" className="text-sm hover:opacity-80 transition-opacity">Login</Link>
                                <Link href="/signup" className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Sign Up</Link>
                            </>
                        ) : (
                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[190] pt-16" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-white dark:bg-[#161618] shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <FaSearch className="text-gray-400" />
                                <input
                                    type="search"
                                    ref={searchBox}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="flex-1 py-2 outline-none bg-transparent"
                                    placeholder="Search..."
                                    autoFocus
                                />
                                {searchLoading && (
                                    <Image
                                        src="/spinner.svg"
                                        alt="Loading spinner"
                                        width={20}
                                        height={20}
                                        className="dark:invert"
                                    />
                                )}
                            </form>
                        </div>

                        <nav className="flex flex-col">
                            <Link href="/about" className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            
                            {!authLoading && user && (
                                <Link href="/account" className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                            )}
                            
                            {!authLoading && user && role === 'admin' && (
                                <Link href="/admin" className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                            )}
                            
                            {!authLoading && user && (role === 'admin' || role === 'moderator') && (
                                <Link href="/moderator" className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Moderator Panel</Link>
                            )}

                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                {!authLoading && user ? (
                                    <>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email}</div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : !authLoading && !user ? (
                                    <div className="flex flex-col gap-2">
                                        <Link href="/login" className="text-center py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                        <Link href="/signup" className="text-center py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                                    </div>
                                ) : (
                                    <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
