import ListingVerticalScroll from "@/components/listing-vertical-scroll";
import { createClient } from "@/utils/supabase/server";
import { ChevronRight, Filter, Search } from "lucide-react";
import { redirect } from "next/navigation";
import prisma, { listing_type_enum } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Pills from "@/components/(navbar)/pills";
import ListingVerticalScrollOne from "@/components/listing-vertical-scroll-one";
import AboutUsPopUp from "@/components/aboutus-popup";
export default async function Index({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const requestListings = await prisma.listing.findMany({
        take: 10,
        where: {
            listing_type: listing_type_enum.receive,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            Transaction: true,
            ListingImage: true,
            profiles: true,
        },
    });

    const donationListings = await prisma.listing.findMany({
        take: 10,
        where: {
            listing_type: listing_type_enum.donate,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            Transaction: true,
            ListingImage: true,
            profiles: true,
        },
    });
    return (
        <div className="flex flex-col items-center w-full p-6">
            <div className="hidden">
                <AboutUsPopUp />
            </div>
            <Pills />
            <main className="flex-1 flex flex-col w-full">
                <div className="flex justify-center items-center space-x-2">
                    <div className="relative w-full ml-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                        />
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-md">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost">
                                    {" "}
                                    <Filter size={18} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit mr-6 ">
                                <div>
                                    <h1 className="font-medium text-lg">
                                        Filter by...
                                    </h1>
                                    <Separator className="my-2" />
                                    <div className="items-top flex space-x-2">
                                        <Checkbox id="greens" />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Greens
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Vegetables
                                            </p>
                                        </div>
                                    </div>
                                    <div className="items-top flex space-x-2 mt-4">
                                        <Checkbox id="browns" />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Browns
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Coffee Grounds...
                                            </p>
                                        </div>
                                    </div>

                                    <div className="items-top flex space-x-2 mt-4">
                                        <Checkbox id="greens" />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="others"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Others
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                Fungible Worms etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                {searchParams["type"] === "requests" ? (
                    <div className="mb-4">
                        <h1 className="text-md font-semibold my-4">
                            Check out what people are requesting for
                        </h1>
                        <ListingVerticalScrollOne listings={requestListings} />
                    </div>
                ) : (
                    <div className="mb-4">
                        <h1 className="text-md font-semibold my-4">
                            Check out what people are giving away
                        </h1>
                        <ListingVerticalScrollOne listings={donationListings} />
                    </div>
                )}
            </main>
        </div>
    );
}
