import { Search } from "lucide-react";
import prisma, { listing_item_type_enum, listing_type_enum } from "@/lib/db";
import { Input } from "@/components/ui/input";
import Pills from "@/components/(navbar)/pills";
import ListingVerticalScrollOne from "@/components/listing-vertical-scroll-one";
import AboutUsPopUp from "@/components/aboutus-popup";
import ListingsFilter from "./create/filter";
import DistanceFilterButton from "./distance-filter-btn";
import SearchBox from "./search-box";

function getFilterConditions(filters: string | undefined, search: string | undefined) {
    const conditions: { OR?: any[]; AND?: any[] } = {};

    if (filters) {
        const filterArray = filters.split(" ");
        conditions.OR = conditions.OR || [];

        filterArray.forEach((filter) => {
            if (filter === "greens") {
                conditions.OR!.push({ listing_item_type: "greens" });
            } else if (filter === "browns") {
                conditions.OR!.push({ listing_item_type: "browns" });
            } else if (filter === "compost") {
                conditions.OR!.push({ listing_item_type: "compost" });
            }
        });
    }

    if (search) {
        const searchConditions = {
            OR: [
                { header: { contains: search, mode: 'insensitive' } },
                { body: { contains: search, mode: 'insensitive' } },
            ],
        };

        if (conditions.OR) {
            conditions.AND = conditions.AND || [];
            conditions.AND.push(searchConditions);
        } else {
            conditions.OR = [searchConditions];
        }
    }

    return conditions;
}

export default async function Index({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const type = searchParams["type"];
    const filters = searchParams["filters"] as string | undefined;
    const distance = searchParams["distance"];
    const search = searchParams["search"] as string | undefined;

    const filterConditions = getFilterConditions(filters, search);

    const requestListings = await prisma.listing.findMany({
        where: {
            listing_type: listing_type_enum.receive,
            ...filterConditions,
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
        where: {
            listing_type: listing_type_enum.donate,
            ...filterConditions,
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
                    <SearchBox />
                    <div className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-md">
                        <ListingsFilter type={type} />
                    </div>
                </div>
                <div className="mt-2">
                    <DistanceFilterButton />
                </div>
                {type === "requests" ? (
                    <div className="mb-4">
                        <h1 className="text-md font-semibold my-4">
                            Check out what people are requesting for
                        </h1>
                        <ListingVerticalScrollOne
                            listings={requestListings}
                            isDistanceFilterOn={distance ? true : false}
                        />
                    </div>
                ) : (
                    <div className="mb-4">
                        <h1 className="text-md font-semibold my-4">
                            Check out what people are giving away
                        </h1>
                        <ListingVerticalScrollOne
                            listings={donationListings}
                            isDistanceFilterOn={distance ? true : false}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
