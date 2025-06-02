"use client"
import { FaDownload, FaEyeDropper, FaUserAstronaut, FaX, FaShareSquare } from "react-icons/fa6"; // Added FaShareSquare
import "../styles/popModal.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { copyToClipboard } from "../lib/utils";
import { downloadHandler } from "@/lib/utilities";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { useAuth } from "@/app/context/AuthContext"; // Import useAuth to get current user

// Added mediaId to props to fetch comments, and user for posting
export default function PopModal({
    imgSrc, imgAlt, photographer, avg, photographerUrl,
    status, clean, type, embedded_text,
    mediaId // Expect mediaId to be passed now (from item.id in page.js)
}) {
    const { user } = useAuth(); // Get current logged-in user
    const [modalShowing, setModalShowing] = useState(status);
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const fetchComments = async () => {
        if (!mediaId) return;
        setIsLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles(id, email)') // Adjust if your profile table or columns are different
                .eq('media_id', mediaId)
                .order('created_at', { ascending: true });

            if (error) {
                // console.error("Error fetching comments:", error);
                toast.error("Could not load comments.");
            } else {
                setComments(data || []);
            }
        } catch (e) { /* console.error("Exception fetching comments:", e); */ toast.error("Error loading comments."); }
        setIsLoadingComments(false);
    };

    useEffect(() => {
        if (status && mediaId) { // If modal is shown and mediaId is available
            setModalShowing(true);
            fetchComments();
        } else {
            setModalShowing(false);
        }
    }, [status, mediaId]);


    useEffect(()=>{
        if(!modalShowing) {
            clean({ // This is from the parent (app/page.js popData state)
                imgSrc: "", imgAlt: "", photographer: "",
                photographerLink: "", avg_color: "", status: false,
                type: "", embedded_text: "", mediaId: null
            });
            setComments([]); // Clear comments when modal closes
            setNewCommentText("");
        }
    }, [modalShowing, clean]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please log in to comment.");
            return;
        }
        if (!newCommentText.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        setIsSubmittingComment(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    media_id: mediaId,
                    user_id: user.id,
                    comment_text: newCommentText.trim()
                })
                .select('*, profiles(id, email)') // Select the new comment with profile info
                .single();

            if (error) {
                // console.error("Error submitting comment:", error);
                toast.error("Failed to submit comment.");
            } else if (data) {
                setComments(prevComments => [...prevComments, data]); // Add new comment to local state
                setNewCommentText(""); // Clear input
                toast.success("Comment posted!");
            }
        } catch (e) { /* console.error("Exception submitting comment:", e); */ toast.error("Error posting comment.");}
        setIsSubmittingComment(false);
    };

    const performDownload = () => {
        // Adjust download logic if needed for videos, e.g., naming or specific handling
        const mediaType = type === 'video' ? 'Video' : 'Image';
        const promise = downloadHandler({imgAlt, imgSrc, type}); // Pass type to downloadHandler
        toast.promise(promise, {
            loading: `Downloading ${mediaType}...`,
            error: `Failed to download ${mediaType}.`,
            success: `${mediaType} downloaded successfully.`
        });
    }

    return (
        <div className={`popModal sm:p-4 md:p-8 lg:p-[5rem] ${modalShowing ? "in" : "out"}`}> {/* Adjusted padding for better responsiveness */}
            {/* Added flex flex-col to modal and overflow-y-auto to content wrapper */}
            <div className="modal flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] w-full max-w-3xl"> {/* max-w-3xl for large screens, w-full for smaller */}
                {/* Header with close button */}
                <div className="flex justify-end p-2 sticky top-0 bg-white dark:bg-gray-800 z-10 border-b dark:border-gray-700">
                    <button title="Close modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" onClick={()=>setModalShowing(false)}>
                        <FaX className="text-sm text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-grow">
                    {/* Conditional rendering for image or video */}
                    <div className="img relative" style={type !== 'video' ? {background: `${avg}`, color: `${avg}`} : {background: '#000', color: '#000'} }> {/* Removed backgroundImage for Next Image */}
                        {/* Removed absolute close button from here, moved to header */}
                        <FaX className="text-sm" />
                    </div>
                        {imgSrc && type === 'video' ? (
                            <video src={imgSrc} controls autoPlay className="w-full max-h-[60vh] object-contain" />
                        ) : imgSrc ? (
                            // Using Next/Image. Ensure 'imgSrc' is a relative path or a whitelisted domain in next.config.js
                            // For simplicity if imgSrc can be external and varied, consider a regular <img> or ensure domain whitelisting.
                            // The 'className=""' was empty, can be removed or used for styling.
                            <Image layout="responsive" width={700} height={700} objectFit="contain" src={imgSrc} alt={imgAlt || 'Modal image'} className="max-h-[60vh]" />
                        ) : <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><p>No image</p></div>}
                    </div>
                    {imgAlt && <section className="p-3 md:p-4 bg-slate-100 dark:bg-[#1f1f22] text-center border-b dark:border-gray-700">
                        <span className="text-sm md:text-base text-gray-700 dark:text-gray-200 text-ellipsis">{imgAlt}</span>
                    </section>}
                    {/* Section for Embedded Text */}
                    {embedded_text && (
                        <section className="p-3 md:p-4 bg-gray-50 dark:bg-[#2a2a2e] border-b dark:border-gray-700">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Caption</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{embedded_text}</p>
                        </section>
                    )}
                    {/* Comments Section */}
                    <section className="p-3 md:p-4 bg-gray-100 dark:bg-[#222225] max-h-60 overflow-y-auto border-b dark:border-gray-700"> {/* This part is already scrollable */}
                        <h3 className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Comments ({comments.length})</h3>
                        {isLoadingComments ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
                        ) : comments.length > 0 ? (
                            <ul className="space-y-3">
                                {comments.map(comment => (
                                    <li key={comment.id} className="text-sm p-2 bg-white dark:bg-gray-700 rounded shadow">
                                        <div className="flex items-center mb-1">
                                            <strong className="text-xs text-indigo-600 dark:text-indigo-400 mr-2">
                                                {comment.profiles?.email || comment.user_id.substring(0,8) + '...'}
                                            </strong>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(comment.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{comment.comment_text}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
                        )}
                    </section>

                    {/* Add Comment Form Section */}
                    {user ? (
                        <section className="p-3 md:p-4 bg-white dark:bg-[#1f1f22] border-b dark:border-gray-700">
                            <form onSubmit={handleCommentSubmit} className="space-y-2">
                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows="2"
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    disabled={isSubmittingComment}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment || !newCommentText.trim()}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:focus:ring-offset-gray-800"
                                >
                                    {isSubmittingComment ? "Posting..." : "Post Comment"}
                                </button>
                            </form>
                        </section>
                    ) : (
                        <section className="p-3 md:p-4 bg-gray-50 dark:bg-[#1f1f22] text-center border-b dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">Log in</Link> to post a comment.
                            </p>
                        </section>
                    )}
                </div> {/* End Scrollable Content Area */}

                {/* Footer Actions - sticky at the bottom of the modal */}
                <section className="w-full p-3 md:p-4 bg-white dark:bg-[#161618] dark:text-white flex justify-around items-center flex-wrap gap-2 border-t dark:border-gray-700">
                    <span className="sm:min-w-[10rem] min-w-[1rem] flex-1 justify-center flex gap-4 items-center text-red-500 cursor-pointer hover:scale-105 active:scale-95" onClick={performDownload}>
                        <FaDownload className="text-lg font-light"/>
                        <span className="max-sm:hidden">Download</span>
                    </span>
                    <Link href={photographerUrl} target="_blank" className="min-w-[10rem] flex-1 justify-center flex gap-2 items-center cursor-pointer hover:scale-105 active:scale-95">
                        <FaUserAstronaut className="text-lg font-light" />
                        <span className="whitespace-nowrap max-sm text-sm">{photographer}</span> 
                    </Link>
                    <span className="sm:min-w-[10rem] min-w-[1rem] flex-1 justify-center flex gap-4 items-center cursor-grab hover:scale-105 active:scale-95" onClick={()=>copyToClipboard(avg)}>
                        <FaEyeDropper className="text-lg font-light" />
                        <div className={`color text-xs flex items-center justify-center max-sm:hidden`} style={{background: `${avg}`}}></div>
                    </span>
                     <button
                        title="Copy link to media"
                        onClick={() => {
                            const shareUrl = `${window.location.origin}/?mediaId=${mediaId}`;
                            navigator.clipboard.writeText(shareUrl)
                                .then(() => toast.success("Link copied to clipboard!"))
                                .catch(() => toast.error("Failed to copy link."));
                        }}
                        className="sm:min-w-[10rem] min-w-[1rem] flex-1 justify-center flex gap-4 items-center text-blue-500 cursor-pointer hover:scale-105 active:scale-95 dark:text-blue-400"
                    >
                        <FaShareSquare className="text-lg font-light"/>
                        <span className="max-sm:hidden">Share</span>
                    </button>
                </section>
            </div>
            <div className="background" onClick={()=>setModalShowing(false)}></div>
        </div>
    )
}
