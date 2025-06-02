"use client"
import { fetchSupabaseMedia } from "@/lib/utilities"; // Changed import
import AllPhotos from "./components/AllPhotos";
import NavBar from "./components/navBar"
import React, { useEffect, useRef, useState } from "react";
import LoadindDiv from "./elements/LoadindDiv";
import PopModal from "./components/PopModal";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "./context/AuthContext"; // Import useAuth

export const MyContext = React.createContext();
export default function Home() {
  const { footerText } = useAuth(); // Consume footerText from AuthContext
  const [photosArray, setPhotosArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const divRef = useRef(null);
  const btnRef = useRef();
  const [popData, setPopData] = useState({
    imgSrc: "",
    imgAlt: "",
    photographer: "",
    photographerLink: "",
    avg_color: "",
    status: false
  });

  useEffect(() => {
    const divElement = divRef.current;


    const handleScroll = () => {
      const scrollHeight = divElement.scrollHeight;
      const clientHeight = divElement.clientHeight;
      const scrollTop = divElement.scrollTop;

      const distanceToRight = scrollHeight - clientHeight - scrollTop;

      const threshold = 700;

      if (distanceToRight <= threshold) {
        btnRef.current.click();
      }
    };

    divElement.addEventListener("scroll", handleScroll);

    btnRef.current.click();
    return () => {
      divElement.removeEventListener("scroll", handleScroll);
    };

  }, []);

  const fetchHandler = async () => {
    setIsLoading(true);
    try {
      // Using fetchSupabaseMedia now
      const mediaResults = await fetchSupabaseMedia(currentPage, 15); // Assuming limit of 15, adjust as needed

      if (mediaResults && mediaResults.length > 0) {
        setPhotosArray(prevPhotos => [...prevPhotos, ...mediaResults]);
        setCurrentPage(prevPage => prevPage + 1);
        setHasError(false);
      } else if (currentPage === 1 && mediaResults.length === 0) {
        // Initial load and no media found
        setPhotosArray([]); // Clear any existing photos
        // Optionally, set a state here to show a "No media found" message
        console.log("No media found in Supabase.");
      }
      // If mediaResults is empty but not initial load, it means no more photos to load.

    } catch (error) {
      console.error("Error in fetchHandler:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const viewPop = (item) => { // item is now an object from our 'media' table
    // Adapt this based on fields in 'media' table and what PopModal expects
    // Current PopModal expects: imgSrc, imgAlt, photographer, photographerLink, avg_color
    // Media table has: file_url, alt_text, embedded_text, uploader_id
    setPopData({
      mediaId: item.id, // Added mediaId
      imgSrc: item.file_url,
      imgAlt: item.alt_text || item.file_name,
      photographer: item.uploader_id,
      photographerLink: "#",
      avg_color: "#CCCCCC",
      embedded_text: item.embedded_text,
      file_type: item.file_type,
      status: true
    });
  }

  const handleLikeUpdateInPage = (mediaId, newLikeCount, newHasLiked) => {
    setPhotosArray(prevPhotos =>
      prevPhotos.map(photo => {
        if (photo.id === mediaId) {
          // It's important that GridItem's local state for hasLiked is the source of truth for its display,
          // but we update the like_count here to reflect in the array for potential re-renders or other uses.
          // The 'has_liked' status for the *current user* is primarily managed within GridItem's state after initial check.
          return { ...photo, like_count: newLikeCount };
        }
        return photo;
      })
    );
    // Note: We don't necessarily need to store 'has_liked_by_current_user' in photosArray
    // as GridItem handles its own 'hasLiked' state based on its initial check and user interaction.
    // If we did want to, it would be:
    // return { ...photo, like_count: newLikeCount, has_liked_by_current_user: newHasLiked };
    // However, this could become complex if multiple users are interacting with the same client.
  };

  return (
    <MyContext.Provider value={{ viewPop }}>
      <main className="w-screen h-screen overflow-auto relative" ref={divRef}>
        <Toaster />
        <NavBar />
        <div className="p-1 md:px-4 sm:px-2 px-1 ">
          <AllPhotos
            photoGrid={photosArray}
            contextObj={MyContext}
            onLikeUpdate={handleLikeUpdateInPage} // Pass the handler
          />
        </div>
        {isLoading && <LoadindDiv />}
        {!isLoading && !hasError && photosArray.length > 0 && <div className="p-3 mx-auto justify-center text-center">You&apos;ve reached the end</div>}
        {hasError && photosArray.length === 0 && <div className="p-3 mx-auto justify-center text-center">Oops! an error occured, refresh page</div>}
        {hasError && photosArray.length > 0 && <div className="p-3 mx-auto justify-center text-center">Oops! an error occured, can&apos;t fetch more Photos</div>}
        <div className="btn hidden" ref={btnRef} onClick={() => fetchHandler()}></div>
        <PopModal
          avg={popData.avg_color}
          imgAlt={popData.imgAlt}
          imgSrc={popData.imgSrc}
          photographer={popData.photographer}
          photographerUrl={popData.photographerLink}
          status={popData.status}
          key={popData.imgSrc} // Changed key to something more unique if popData.avg_color is always default
          clean={setPopData}
          // Pass all popData props to PopModal
          mediaId={popData.mediaId}
          embedded_text={popData.embedded_text}
          file_type={popData.file_type}
        />

      <footer className="fixed sm:bottom-10 bottom-5 sm:right-10 right-5 opacity-60 hover:opacity-100 group z-[90] text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {footerText ? (
          <span dangerouslySetInnerHTML={{ __html: footerText }} /> // Allow HTML in footer text
        ) : (
          <span>Made by <Link href={"https://fabiconcept.online"} className="font-semibold hover:text-blue-500 dark:hover:text-blue-400" target="_blank" rel="noopener noreferrer">@Fabiconcept</Link></span>
        )}
      </footer>
      </main>
    </MyContext.Provider>
  )
}