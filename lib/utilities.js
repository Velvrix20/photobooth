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

/**
 * Fetches media records from the 'media' table in Supabase, ordered by creation date.
 * Implements pagination.
 * @param {number} page - The current page number (1-indexed).
 * @param {number} limit - The number of items per page.
 * @returns {Promise<Array>} - A promise that resolves to an array of media items.
 */
export const fetchSupabaseMedia = async (page = 1, limit = 10) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  try {
    // Fetch media and count of likes for each media item.
    // This requires a 'likes' table with a foreign key 'media_id' referencing 'media.id'.
    // And RLS allowing reads on 'likes' table.
    const { data, error, count } = await supabase
      .from('media')
      .select('*, likes(count)', { count: 'exact' }) // Select all media fields and the count of related likes
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching media with like counts from Supabase table:', error);
      // If the error is about 'likes' relation not existing, you need to ensure:
      // 1. 'likes' table exists.
      // 2. 'likes' table has a 'media_id' foreign key column referencing 'media.id'.
      // 3. RLS policies on 'likes' table allow read access.
      // For now, fallback to fetching without like counts if there's an error here.
      // This is a simplistic fallback; a more robust solution would identify specific errors.
      console.warn('Falling back to fetching media without like counts.');
      const fallbackData = await supabase
        .from('media')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (fallbackData.error) {
        console.error('Error in fallback fetchSupabaseMedia:', fallbackData.error);
        return [];
      }
      // Add a default likes count if not fetched
      return fallbackData.data.map(item => ({ ...item, likes: [{count: 0}] })); // Mimic structure {likes: [{count: N}]}
    }

    // Supabase returns `likes` as an array (e.g., `[{count: 5}]`) when counting related rows.
    // We need to transform this into a more usable format, e.g., `like_count: 5`.
    const processedData = data.map(item => {
      const like_count = item.likes && item.likes.length > 0 ? item.likes[0].count : 0;
      // Create a new object to avoid mutating the original item directly if it's not desired,
      // though here we are essentially replacing item.likes with item.like_count.
      // It's often cleaner to create a new object.
      const { likes, ...restOfItem } = item; // Remove original 'likes' array
      return {
        ...restOfItem,
        like_count: like_count
      };
    });

    return processedData;

  } catch (error) {
    console.error('Error in fetchSupabaseMedia (outer catch):', error);
    return []; // Return empty array on error
  }
};

/**
 * Adds a log entry to the 'logs' table in Supabase.
 * @param {string} action - The action being logged (e.g., "USER_LOGIN_SUCCESS").
 * @param {object} details - A JSON object containing additional details about the action.
 * @param {string|null} user_id_param - The ID of the user performing the action. If null, tries to get current auth user.
 */
export const addLogEntry = async (action, details = {}, user_id_param = null) => {
  let final_user_id = user_id_param;

  if (!final_user_id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        final_user_id = user.id;
      }
    } catch (e) {
      // Non-critical, proceed without user_id if not explicitly provided and not fetchable
    }
  }

  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        action: action,
        details: details,
        user_id: final_user_id,
      });

    if (error) {
      console.error('Error adding log entry to Supabase:', error.message, { action, details, final_user_id });
    }
    // No need to return true/false or throw unless critical for calling function
  } catch (error) {
    console.error('Exception when adding log entry:', error.message);
  }
};