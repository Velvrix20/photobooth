"use client"
import Masonry from "react-masonry-css";
import "../styles/masonry.css";
import "../styles/grid.css";
import GridItem from "../elements/GridItem";

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    850: 2,
    700: 2,
    500: 1
};

// Added onLikeUpdate to props
export default function AllPhotos({photoGrid, contextObj, onLikeUpdate}) {

    return (
        <div className="w-fit overflow-x-hidden pt-3">
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid group-item sm:gap-4"
                columnClassName="my-masonry-grid_column"
            >
                {photoGrid?.map((item) => (
                    <GridItem
                        item={item} // Pass the whole item
                        contextObj={contextObj}
                        key={item.id}
                        onLikeUpdate={onLikeUpdate} // Pass the handler down
                        // Removed individual props like imgSrc, photographer etc. as GridItem now takes 'item'
                    />
                ))}
            </Masonry>
        </div>
    )
}