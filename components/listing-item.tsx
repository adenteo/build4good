"use client";
import Image from "next/image";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { ListingWithTransactionAndImage } from "./listing-horizontal-scroll";
import { Apple, Recycle, Sprout, Trash } from "lucide-react";
import { listing_type_enum } from "@/lib/db";

interface ListingItemProps {
    listing: ListingWithTransactionAndImage;
    showDescription?: boolean;
}

const ListingItem = ({ listing, showDescription }: ListingItemProps) => {
    const router = useRouter();
    const progress = listing.Transaction.filter(
        (transaction) => transaction.completed_at
    ).reduce((acc, transaction) => acc + transaction.donated_amount, 0);
    return (
        <div
            className="flex items-start flex-col w-36 cursor-pointer"
            onClick={() => {
                router.push(`/listings/${listing.id}`);
            }}
        >
            <div className="relative w-36 h-36">
                <div
                    className={`text-[0.6rem] text-white absolute -left-[1px] top-2 p-1 rounded-r-md z-10 ${
                        listing.listing_item_type === "greens"
                            ? "bg-green-600 bg-opacity-90 "
                            : listing.listing_item_type === "browns"
                            ? "bg-amber-700 bg-opacity-90"
                            : "bg-cyan-700 bg-opacity-90"
                    }`}
                >
                    {listing.listing_item_type}
                </div>
                <Image
                    className="rounded-lg object-cover h-36 w-36"
                    src={
                        listing.ListingImage.length > 0
                            ? listing.ListingImage[0].url
                            : "https://images.unsplash.com/photo-1594498653385-d5172c532c00?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    }
                    fill
                    alt={listing.header}
                />
            </div>
           {listing.listing_type === listing_type_enum.receive && (<> <Progress
                value={(progress / listing.total_amount) * 100}
                className={`mt-2 h-[6px] [&>*]:bg-green-700`
                }
            />
            <div className="flex justify-between w-full">
                <label
                    className={`text-xs mt-1 text-green-700`}
                >
                    <span className="font-bold">
                        {progress}/{listing.total_amount}kg
                    </span>{" "}
                        contributed
                </label>
            </div></>)}
            <div className="font-medium text-base mt-1 line-clamp-2 w-36 text-left">
                {listing.header}
            </div>
            {showDescription && (
                <div className="font-light text-sm line-clamp-2 w-36 mb-1 text-left">
                    {listing.body}
                </div>
            )}
            {listing.listing_type === listing_type_enum.donate && (
              <div className="text-xs text-green-700 font-semibold">{listing.total_amount}kg available</div>
            )}
        </div>
    );
};

export default ListingItem;
