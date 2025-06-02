"use client"
import { fetchImageApi_search } from "@/lib/utilities";
import PopModal from "../components/PopModal";
import NavBar from "../components/navBar";
import React, { useEffect, useState, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import AllPhotos from "../components/AllPhotos";
import LoadindDiv from "../elements/LoadindDiv";
import NoImage from "../elements/NoImage";

export const searchContext = React.createContext();
export default function SearchResultsPage({ params: { query } }) {
    const [photosArray, setPhotosArray] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [popData, setPopData] = useState({
        imgSrc: "",
        imgAlt: "",
        photographer: "",
        photographerLink: "",
        avg_color: "",
        status: false
    });

    const searchHandler = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        setPhotosArray([]);
        try {
            const photosResult = await fetchImageApi_search(query);
            setPhotosArray(photosResult);
            if (photosResult.length > 0) {
                toast.success(`Search Results: ${photosResult.length}`, {
                    style: {
                        border: '1px solid #713200',
                        padding: '16px',
                        color: '#713200',
                    },
                    iconTheme: {
                        primary: '#713200',
                        secondary: '#FFFAEE',
                    },
                });
            }
        } catch (error) {
            console.error("Search error:", error);
            setHasError(true);
            toast.error("Failed to fetch search results", {
                style: {
                    border: '1px solid #ff0000',
                    padding: '16px',
                    color: '#ff0000',
                },
            });
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        searchHandler();
    }, [searchHandler]);

    const viewPop = useCallback((data) => {
        const { src, alt, photographer, photographerLink, avg_color } = data;
        setPopData({
            imgSrc: src,
            imgAlt: alt,
            photographer,
            photographerLink,
            avg_color,
            status: true
        });
    }, []);

    const closeModal = useCallback(() => {
        setPopData(prev => ({ ...prev, status: false }));
    }, []);

    return (
        <searchContext.Provider value={{ viewPop }}>
            <main className="w-screen h-screen overflow-auto">
                <NavBar />
                <Toaster
                    position="bottom-right"
                    reverseOrder={false}
                />
                <div className="p-1">
                    {!hasError && !isLoading && photosArray.length > 0 && (
                        <AllPhotos photoGrid={photosArray} contextObj={searchContext} />
                    )}
                    {isLoading && <LoadindDiv />}
                    {!isLoading && !hasError && photosArray.length === 0 && <NoImage />}
                    {!isLoading && !hasError && photosArray.length > 0 && (
                        <div className="p-3 mx-auto justify-center text-center">
                            You&apos;ve reached the end
                        </div>
                    )}
                    {hasError && (
                        <div className="p-3 mx-auto justify-center text-center">
                            Oops! An error occurred. Please refresh the page or try again later.
                        </div>
                    )}
                </div>
                <PopModal
                    avg={popData.avg_color}
                    imgAlt={popData.imgAlt}
                    imgSrc={popData.imgSrc}
                    photographer={popData.photographer}
                    photographerUrl={popData.photographerLink}
                    status={popData.status}
                    key={popData.avg_color}
                    clean={closeModal}
                />
            </main>
        </searchContext.Provider>
    )
              }
