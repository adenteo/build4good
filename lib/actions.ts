"use server";
import prisma, {Prisma, listing_item_type_enum, listing_type_enum, tag_type_enum , scrap_type_enum, compost_type_enum } from "./db";
import {
    getCurrentUser,
    getCurrentUserId,
    getUserProfileFromUserId,
} from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { en } from "@faker-js/faker";
import { z } from "zod";
import { CreateListingFormSchema } from "@/app/listings/create/page";
import { cookies } from "next/headers";
import { calculateDistance } from './utils';


// Functions related to Current User
// --------------------------------------------------------

async function getCurrentUserCoords(): Promise<{ lat: number; lon: number } | null> {
    // Replace this with your actual logic to get the current user's coordinates
    const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("User not found");
        }
    const profile = await getUserProfileFromUserId(userId);
    if (profile && profile.coords_lat !== null && profile.coords_long !== null) {
      return { lat: profile.coords_lat, lon: profile.coords_long };
    }
    return null;
  }
  
export async function getCurrentDistanceToInstance(instance: { coords_lat: number | null, coords_long: number | null }): Promise<number | null> {
    try {
    const userCoords = await getCurrentUserCoords();
    if (!userCoords) {
        throw new Error('Current user coordinates not found');
    }
    if (instance.coords_lat === null || instance.coords_long === null) {
        throw new Error('Instance coordinates not found');
    }
    const distance = calculateDistance(
        userCoords.lat,
        userCoords.lon,
        instance.coords_lat,
        instance.coords_long
    );
    return distance;
    } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
    }
}

// Functions related to Comments
// --------------------------------------------------------
export async function hasUserLikedComment(commentId: string): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) {
        return false;
    }
    const like = await prisma.commentLike.findUnique({
        where: {
            profile_id_comment_id: {
                profile_id: userId,
                comment_id: commentId,
            },
        },
    });

    return like !== null;
}

export async function likeComment(commentId: string) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return false;
    }
    await prisma.commentLike.create({
        data: {
            profile_id: userId,
            comment_id: commentId,
        },
    });
    await prisma.listingComment.update({
        where: { id: commentId },
        data: { like_count: { increment: 1 } },
    });
}

export async function unlikeComment(commentId: string) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return false;
    }
    await prisma.commentLike.delete({
        where: {
            profile_id_comment_id: {
                profile_id: userId,
                comment_id: commentId,
            },
        },
    });

    await prisma.listingComment.update({
        where: { id: commentId },
        data: { like_count: { decrement: 1 } },
    });
}

export async function createComment(
    body: string,
    listingId: number,
    parentId: string | null = null
) {
    const userId = await getCurrentUserId();
    if (!userId) {
        throw new Error("User session not found");
    }
    try {
        await prisma.listingComment.create({
            data: {
                body_text: body,
                profile_id: userId,
                listing_id: listingId,
                parent_id: parentId,
            },
        });
    } catch (error) {
        throw new Error("Error creating comment: " + error);
    }
}

// Functions related to Profiles
// --------------------------------------------------------
export async function getProfileByUsername(username: string) {
    const profile = await prisma.profiles.findUnique({
        where: { username },
    });
    return profile;
}
//update profile: input is id, update optional: username, coords, roles, url.
interface UpdateProfileData {
    username?: string;
    coords_lat?: number;
    coords_long?: number;
    is_composter?: boolean;
    is_donor?: boolean;
    is_gardener?: boolean;
    social_media_url?: string;
}

export async function updateProfile(id: string, data: UpdateProfileData) {
    try {
        const updatedProfile = await prisma.profiles.update({
            where: { id },
            data,
        });
        return updatedProfile;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}

export async function getListingsByProfileId(profileId: string) {
    try {
    const listings = await prisma.listing.findMany({
        where: { profile_id: profileId },
        include: {
        ListingComment: true,
        ListingImage: true,
        ListingTag: true,
        Transaction: true,
        },
    });

    return listings;
    } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
    } 
}

// Functions related to Listings
// --------------------------------------------------------
export async function createListing(
    data: Omit<z.infer<typeof CreateListingFormSchema>, "image"> & {
        image: string;
    }
) {
    console.log("data", data);
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("User not found");
        }
        const profile = await getUserProfileFromUserId(userId);
        // Fetch profile to get default coordinates if not provided

        if (!profile) {
            throw new Error("Profile not found");
        }

        const has_progress = data.action === "receive";
        // Use profile's coordinates if not specified
        const coords_lat = data.location.latitude ?? profile.coords_lat;
        const coords_long = data.location.longitude ?? profile.coords_long;
        const listing = await prisma.listing.create({
            data: {
                profile_id: profile.id,
                header: data.title,
                body: data.description,
                total_amount: data.amount,
                deadline: data.deadline,
                listing_type: data.action,
                listing_item_type: data.type,
                has_progress: has_progress,
                coords_lat: coords_lat,
                coords_long: coords_long,
            },
        });

        cookies().set("listingId", listing.id.toString(), { path: "/" });

        return listing;
    } catch (error) {
        console.error("Error creating listing:", error);
        throw error;
    }
}

//adding tags to listing via listing id
interface AddTagsToListingData {
    listing_id: number;
    tag_type: tag_type_enum;
    scrap_type?: scrap_type_enum;
    compost_type?: compost_type_enum;
  }

export async function addTagsToListing(data: AddTagsToListingData) {
    try {
    // Validate tag type and corresponding enum
    if (data.tag_type === tag_type_enum.scrap && !data.scrap_type) {
        throw new Error('scrap_type is required when tag_type is "scrap"');
    }

    if (data.tag_type === tag_type_enum.compost && !data.compost_type) {
        throw new Error('compost_type is required when tag_type is "compost"');
    }
    const scrapType = data.scrap_type ?? null;
    const compostType = data.compost_type ?? null;
    // Create the ListingTag
    const ListingTag = await prisma.listingTag.create({
        data: {
        listing_id: data.listing_id,
        tag_type: data.tag_type,
        scrap_type: scrapType,
        compost_type: compostType,
        },
    });
    return ListingTag;
    } catch (error) {
    console.error('Error adding tag to listing:', error);
    throw error;
    }
}
//listings search
interface SearchListingsParams {
    tags?: Prisma.ListingTagWhereInput[];
    isActive?: boolean;
    listingType?: listing_type_enum;
    listingItemType?: listing_item_type_enum;
    withinKm?: number;
    currentUserCoords?: { lat: number; lon: number };
    orderBy?: 'created_at' | 'deadline';
    orderDirection?: 'asc' | 'desc';
    topK?: number;
}
export async function searchListings(params: SearchListingsParams) {
    try {
    const {
        tags,
        isActive,
        listingType,
        listingItemType,
        withinKm,
        currentUserCoords,
        orderBy = 'created_at',
        orderDirection = 'asc',
        topK = 10,
    } = params;

    // Building the where clause dynamically
    const where: Prisma.ListingWhereInput = {
        AND: [
        ...(tags ? [{ ListingTag: { every: { OR: tags } } }] : []),
        ...(isActive !== undefined ? [{ is_active: isActive }] : []),
        ...(listingType ? [{ listing_type: listingType }] : []),
        ...(listingItemType ? [{ listing_item_type: listingItemType }] : []),
        ],
    };

    // Fetch listings
    let listings = await prisma.listing.findMany({
        where,
        include: { ListingTag: true },
        orderBy: { [orderBy]: orderDirection },
        take: topK,
    });

    // Filter by distance if withinKm and currentUserCoords are provided
    if (withinKm && currentUserCoords) {
        listings = listings.filter(listing => {
        if (listing.coords_lat !== null && listing.coords_long !== null) {
            const distance = calculateDistance(
            listing.coords_lat,
            listing.coords_long,
            currentUserCoords.lat,
            currentUserCoords.lon
            );
            return distance <= withinKm;
        }
        return false;
        });
    }

    return listings;
    } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
    }
}

//check and mark listing as fulfilled or expired
export async function checkListingStatus(listingId: number): Promise<void> {
    try {
      // Fetch the listing with its transactions
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { Transaction: true },
      });
  
      if (!listing) {
        throw new Error(`Listing with id ${listingId} not found`);
      }
  
      let isActive = true;
  
      // Check if the listing is expired
      if (new Date() > listing.deadline) {
        isActive = false;
      } else {
        if (listing.listing_type === listing_type_enum.receive) {
          // Calculate the total donated amount for receive listings
          const totalDonated = listing.Transaction
            .filter(transaction => transaction.approved_at !== null)
            .reduce((sum, transaction) => sum + transaction.donated_amount, 0);
  
          if (totalDonated >= listing.total_amount) {
            isActive = false;
          }
        } else if (listing.listing_type === listing_type_enum.donate) {
          // we assume that for donations any approved transaction means the listing is fulfilled
          const hasApprovedTransaction = listing.Transaction.some(
            transaction => transaction.approved_at !== null
          );
  
          if (hasApprovedTransaction) {
            isActive = false;
          }
        }
      }
      // Update the listing's is_active status
      await prisma.listing.update({
        where: { id: listing.id },
        data: { is_active: isActive },
      });
  
      console.log(`Listing ${listingId} status updated. Active: ${isActive}`);
    } catch (error) {
      console.error('Error checking listing status:', error);
      throw error;
    }
  }

// Functions related to Transactions
// --------------------------------------------------------
//create transaction
export async function createTransaction(
    listingId: number,
    donatedAmount: number,
    otherId: string // the id of the user who is contributing to the listing
) {
    try {
        //ensure listingId is valid, listing is active, otherId is valid
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            throw new Error(`Listing with id ${listingId} not found`);
        }
        if (!listing.is_active) {
            throw new Error(`Listing with id ${listingId} is not active`);
        }
        const otherProfile = await prisma.profiles.findUnique({
            where: { id: otherId },
        });
        if (!otherProfile) {
            throw new Error(`Profile with id ${otherId} not found`);
        }
        const transaction = await prisma.transaction.create({
            data: {
                other_id: otherId,
                listing_id: listingId,
                donated_amount: donatedAmount,
                created_at: new Date(),
            },
        });
        return transaction;
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}
//approve transaction
export async function approveTransaction(transactionId: string) {
    try {
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { approved_at: new Date() },
        });
        return transaction;
    } catch (error) {
        console.error("Error approving transaction:", error);
        throw error;
    }
}
//mark transaction as completed
export async function completeTransaction(transactionId: string) {
    // ensure transactionId is approved
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
    });
    if (!transaction) {
        throw new Error(`Transaction with id ${transactionId} not found`);
    }
    if (!transaction.approved_at) {
        throw new Error(`Transaction with id ${transactionId} is not approved yet`);
    }
    try {
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { completed_at: new Date() },
        });
        return transaction;
    } catch (error) {
        console.error("Error completing transaction:", error);
        throw error;
    }
}