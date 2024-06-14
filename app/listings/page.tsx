import ListingHorizontalScroll from "@/components/listing-horizontal-scroll";
import { createClient } from "@/utils/supabase/server";
import { ChevronRight, Filter, Search } from "lucide-react";
import { redirect } from "next/navigation";
import prisma, { listing_type_enum } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
export default async function Index() {
    // const supabase = createClient();
    // const { data, error } = await supabase.auth.getUser();
    // if (error || !data?.user) {
    //     redirect("/login");
    // }
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
        },
    });
    return (
        <div className="flex flex-col items-center w-full p-6">
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
                                <Button variant="ghost"> <Filter size={18} /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit mr-6 ">
                               <div>
                                <h1 className="font-medium text-lg mb-2"> I am looking for...</h1>
                                <div className = "flex justify-between">
                                    <Button variant="ghost" className="w-fit h-fit p-0">
                                        <Badge className="m-0 hover:bg-gray-500 text-[0.8rem]">Receivers</Badge>
                                    </Button>
                                    <Button variant="ghost" className="w-fit h-fit p-0">
                                    <Badge className="m-0 hover:bg-gray-500 text-[0.8rem] ml-4">Givers</Badge>
                                    </Button>
                                       
                                </div>
                                <Separator className="my-4"/>

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

                              <div className="items-top flex space-x-2 mt-2">
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

                              <div className="items-top flex space-x-2 mt-2">
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
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold mt-6">
                            Looking for...
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Check out what other people are requesting for!
                        </p>
                    </div>
                    <Link
                        href="/listings/all-requests-listings"
                        className="text-xs flex items-center justify-center text-gray-600"
                    >
                        View all <ChevronRight />
                    </Link>
                </div>

                <ListingHorizontalScroll listings={requestListings} />
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold mt-6">
                            Giving away...
                        </div>
                        <p className="text-xs text-gray-400 mb-4">
                            Check out what other people are giving away!
                        </p>
                    </div>
                    <Link
                        href="/listings/all-donations-listings"
                        className="text-xs flex items-center justify-center text-gray-600"
                    >
                        View all <ChevronRight />
                    </Link>
                </div>

                <ListingHorizontalScroll listings={donationListings} />
            </main>
        </div>
    );
}
