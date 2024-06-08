import Image from "next/image";
import { Progress } from "./ui/progress";
const ListingItem = ({ listing }: any) => {
    return (
        <div className="flex items-start justify-center flex-col">
            <div className="w-36 h-36">
                <Image
                    className="rounded-lg object-cover"
                    src="https://images.unsplash.com/photo-1495615080073-6b89c9839ce0"
                    width={1000} // Use appropriate width for your design (e.g., 224 for w-56)
                    height={1000} // Use the same height to keep it square
                    alt={listing.title}
                />
            </div>
            <Progress value={45} className="h-[6px] [&>*]:bg-green-700"/>
            <div className="font-medium mt-1">Title of listing</div>
            <p className="overflow-ellipsis line-clamp-2 text-xs text-gray-500">I want some coffee grounds please give me some shit</p>
        </div>
    );
};

export default ListingItem;
