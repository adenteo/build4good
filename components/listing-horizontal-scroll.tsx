import { Listing, Prisma } from "@prisma/client";
import ListingItem from "./listing-item";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export type ListingWithTransactionAndImage = Prisma.ListingGetPayload<{
    include: {
        Transaction: true;
        ListingImage: true;
    };
}>;

interface ListingHorizontalScrollProps {
    listings: ListingWithTransactionAndImage[];
}

const ListingHorizontalScroll = async ({
    listings,
}: ListingHorizontalScrollProps) => {
    return (
        <ScrollArea className="">
            <div className="flex space-x-4">
                {listings.map((listing, index: number) => (
                    <ListingItem key={index} listing={listing} />
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>
    );
};

export default ListingHorizontalScroll;
