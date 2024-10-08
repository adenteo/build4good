"use client";
import Tabs from "./tabs";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "./user-menu";
import { User } from "@supabase/supabase-js";

export function Navbar() {
    const pathname = usePathname();
    if (pathname.startsWith("/listings/") || pathname.startsWith("/chats/"))
        return null;
    return (
        <nav
            className={`w-full flex justify-between py-4 items-center px-6 ${
                pathname == "/map" ? "z-[401] absolute top-0" : ""
            }`}
        >
            <Tabs />
            {/* <div className="flex justify-center items-center space-x-3">
                {children}
                <UserMenu user={user} />
            </div> */}
        </nav>
    );
}
