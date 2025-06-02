"use client"
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { FaArrowUpRightFromSquare, FaHeart, FaRegHeart, FaShareSquare } from "react-icons/fa6"; // Added FaShareSquare
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // For redirecting to login

export default function GridItem({ item, contextObj, onLikeUpdate }) { // Added onLikeUpdate prop
    const { viewPop } = useContext(contextObj);
    const { user } = useAuth(); // Get current user
    const router = useRouter();

    const {
        id: mediaId, // Renamed for clarity
        file_url: imgSrc,
        alt_text: imgAlt,
        uploader_id: photographer,
        file_type: type,
        embedded_text: embeddedText,
        file_name,
        like_count: initialLikeCount // From fetchSupabaseMedia
    } = item;

    const [localLikeCount, setLocalLikeCount] = useState(initialLikeCount || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false); // To prevent double clicks

    useEffect(() => {
        // Initial check if current user has liked this item
        const checkUserLike = async () => {
            if (user && mediaId) {
                try {
                    const { data, error } = await supabase
                        .from('likes')
                        .select('id')
                        .eq('media_id', mediaId)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (error) {
                        // console.error('Error checking like status:', error);
                        // Don't toast here, might be too noisy
                    } else if (data) {
                        setHasLiked(true);
                    } else {
                        setHasLiked(false);
                    }
                } catch (e) { /* console.error('Exception checking like:', e) */ }
            } else {
                setHasLiked(false); // No user, so cannot have liked it
            }
        };
        checkUserLike();
    }, [user, mediaId]);

    // Update local like count if initialLikeCount changes (e.g. parent re-fetches)
    useEffect(() => {
        setLocalLikeCount(initialLikeCount || 0);
    }, [initialLikeCount]);


    const handleLikeClick = async (e) => {
        e.stopPropagation(); // Prevent modal from opening
        if (!user) {
            toast.error("Please log in to like media.");
            router.push('/login');
            return;
        }
        if (isLiking) return; // Already processing a like action
        setIsLiking(true);

        if (hasLiked) {
            // Unlike action
            const { error } = await supabase
                .from('likes')
                .delete()
                .match({ media_id: mediaId, user_id: user.id });

            if (error) {
                toast.error("Failed to unlike.");
                // console.error("Unlike error:", error);
            } else {
                setHasLiked(false);
                const newCount = Math.max(0, localLikeCount - 1);
                setLocalLikeCount(newCount);
                if(onLikeUpdate) onLikeUpdate(mediaId, newCount, false); // Notify parent
            }
        } else {
            // Like action
            const { error } = await supabase
                .from('likes')
                .insert({ media_id: mediaId, user_id: user.id });

            if (error) {
                toast.error("Failed to like.");
                // console.error("Like error:", error);
            } else {
                setHasLiked(true);
                const newCount = localLikeCount + 1;
                setLocalLikeCount(newCount);
                 if(onLikeUpdate) onLikeUpdate(mediaId, newCount, true); // Notify parent
            }
        }
        setIsLiking(false);
    };

    function viewHandler() {
        viewPop(item); // Pass the whole item
    }

    const isVideo = type && type.startsWith('video/');

    return (
        <div className="mb-4 break-inside-avoid">
            <div // Changed button to div for main click to avoid button-in-button issues
                title={imgAlt || file_name}
                className={`h-fit w-full peer relative overflow-hidden cursor-pointer group active:opacity-80 active:translate-y-1 active:scale-[0.99] hover:z-10 hover:shadow-xl item bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md transition-all duration-150 ease-out`}
                onClick={viewHandler}
            >
                {isVideo ? (
                    <video
                        src={imgSrc}
                        controls
                        controls
                        className="w-full object-contain group-hover:scale-110 duration-300 ease-out rounded-t-lg"
                    />
                ) : (
                    <Image
                        width={600}
                        height={800}
                        className="w-full object-contain group-hover:scale-110 duration-300 ease-out rounded-t-lg"
                        src={imgSrc}
                        alt={imgAlt || file_name}
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                    <FaArrowUpRightFromSquare className="text-white text-4xl" />
                </div>
                <span className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-md z-10">
                    ID: {String(photographer).substring(0, 6)}...
                </span>
            </div>
            {/* Content below image: Embedded text and Like button */}
            <div className="p-3 bg-white dark:bg-gray-750 rounded-b-lg shadow-lg">
                {embeddedText && (
                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mb-2">
                        {embeddedText}
                    </p>
                )}
                <div className="flex items-center justify-between text-sm">
                    <button
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        title={hasLiked ? "Unlike" : "Like"}
                        className={`flex items-center space-x-1 p-1 rounded transition-colors duration-150 focus:outline-none
                                    ${hasLiked
                                        ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    } ${isLiking ? 'cursor-not-allowed' : ''}`}
                    >
                        {hasLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{localLikeCount}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening
                            const shareUrl = `${window.location.origin}/?mediaId=${mediaId}`;
                            navigator.clipboard.writeText(shareUrl)
                                .then(() => {
                                    toast.success("Link copied to clipboard!");
                                })
                                .catch(err => {
                                    // console.error('Failed to copy link: ', err);
                                    toast.error("Failed to copy link.");
                                });
                        }}
                        title="Share"
                        className="flex items-center space-x-1 p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150 focus:outline-none"
                    >
                        <FaShareSquare />
                        {/* Optionally add text like "Share" */}
                    </button>
                </div>
            </div>
        </div>
    )
}
