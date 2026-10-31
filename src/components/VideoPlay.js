import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const VideoPlay = ({ videoKey, title, close }) => {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <div className="modal-backdrop dark" onClick={close}>
      <div className="video-shell" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-close" onClick={close} aria-label="Close trailer">
          <IoClose />
        </button>
        {videoKey ? (
          <iframe
            title={`${title} trailer`}
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-empty">No trailer available for this title.</div>
        )}
      </div>
    </div>
  );
};

export default VideoPlay;
