import { supabase } from './supabaseClient'; // Adjusted path assuming supabaseClient.js is in the same lib folder

// Bucket name for Supabase storage
const BUCKET_NAME = 'photobooth';
const IMAGE_FOLDER = 'images';
const VIDEO_FOLDER = 'videos';

// Default values for data object, similar to Pexels structure
const DEFAULT_PHOTOGRAPHER = "N/A";
const DEFAULT_PHOTOGRAPHER_URL = "#";
const DEFAULT_AVG_COLOR = "#CCCCCC";

// Helper function to construct data object from Supabase file object
const constructMediaObject = (file, type, folder) => {
    const filePath = `${folder}/${file.name}`;
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
        id: file.id, // Use Supabase file id
        src: {
            original: publicUrlData.publicUrl, // Public URL for the media
        },
        alt: file.name, // Use Supabase file name as alt text
        photographer: DEFAULT_PHOTOGRAPHER,
        photographer_url: DEFAULT_PHOTOGRAPHER_URL,
        avg_color: DEFAULT_AVG_COLOR,
        type: type, // 'image' or 'video'
    };
};

export const fetchImageApi = async (pageNumber) => {
    try {
        // Fetch images from Supabase storage
        const { data: imageFiles, error: imageError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(IMAGE_FOLDER, {
                limit: 20, // Number of images per page
                offset: (pageNumber - 1) * 20 // Calculate offset for pagination
            });

        if (imageError) {
            console.error('Error fetching images from Supabase:', imageError);
            throw imageError;
        }

        // Fetch videos from Supabase storage
        const { data: videoFiles, error: videoError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(VIDEO_FOLDER, {
                limit: 10, // Number of videos per page
                offset: (pageNumber - 1) * 10 // Calculate offset for pagination
            });

        if (videoError) {
            console.error('Error fetching videos from Supabase:', videoError);
            throw videoError;
        }

        // Construct data objects for images
        const images = imageFiles ? imageFiles.map(file => constructMediaObject(file, 'image', IMAGE_FOLDER)) : [];
        // Construct data objects for videos
        const videos = videoFiles ? videoFiles.map(file => constructMediaObject(file, 'video', VIDEO_FOLDER)) : [];

        // Combine and return images and videos
        // This simple concatenation might need more sophisticated merging logic based on desired display order
        return [...images, ...videos];

    } catch (error) {
        console.error('Error in fetchImageApi:', error);
        return []; // Return empty array on error
    }
}

export async function fetchImageApi_search(query) {
    try {
        // Fetch images from Supabase storage with search query
        const { data: imageFiles, error: imageError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(IMAGE_FOLDER, {
                search: query // Supabase search parameter
            });

        if (imageError) {
            console.error('Error searching images in Supabase:', imageError);
            throw imageError;
        }

        // Fetch videos from Supabase storage with search query
        const { data: videoFiles, error: videoError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(VIDEO_FOLDER, {
                search: query // Supabase search parameter
            });

        if (videoError) {
            console.error('Error searching videos in Supabase:', videoError);
            throw videoError;
        }

        // Construct data objects for images
        const images = imageFiles ? imageFiles.map(file => constructMediaObject(file, 'image', IMAGE_FOLDER)) : [];
        // Construct data objects for videos
        const videos = videoFiles ? videoFiles.map(file => constructMediaObject(file, 'video', VIDEO_FOLDER)) : [];

        // Combine and return search results
        return [...images, ...videos];

    } catch (error) {
        console.error('Error in fetchImageApi_search:', error);
        return []; // Return empty array on error
    }
}

export const downloadHandler = async ({
    imgSrc,
    imgAlt,
    type // Added type to determine file extension
}) => {
    const imageUrl = imgSrc;
    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
    }

    const blob = await response.blob();
    const outputUrl = URL.createObjectURL(blob);

    const linkElement = document.createElement("a");
    linkElement.href = outputUrl;

    // Determine file extension based on type or blob content if possible
    let extension = '.jpeg'; // Default for images
    if (type === 'video') {
        // Try to get a more specific video extension from blob.type or imgSrc
        if (blob.type.includes('mp4')) extension = '.mp4';
        else if (blob.type.includes('webm')) extension = '.webm';
        else if (blob.type.includes('ogg')) extension = '.ogv';
        // Add more video types if needed
        else extension = '.mp4'; // fallback video extension
    } else {
        // For images, try to get a more specific image extension
        if (blob.type.includes('png')) extension = '.png';
        else if (blob.type.includes('gif')) extension = '.gif';
        else if (blob.type.includes('webp')) extension = '.webp';
    }

    linkElement.setAttribute("download", `${imgAlt.replace(/\W/g, '_')}_PhotoBooth${extension}`);
    
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
};   