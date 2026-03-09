import { useEffect, useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DEMO_VIDEO_SRC = "/application-demo-compressed.mp4";
const DEMO_THUMBNAIL_SRC = "/compressed-demo-thumbnail.webp";

export default function DemoVideoModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    const video = videoRef.current;
    const onCanPlay = () => {
      setLoading(false);
      video.play().catch(() => { /* autoplay may be blocked */ });
    };
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="demo-video-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-video-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="demo-video-modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="demo-video-modal-header">
          <h2 id="demo-video-title" className="demo-video-modal-title">
            Product Demo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="demo-video-modal-close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="demo-video-modal-player-wrap">
          {loading && (
            <>
              <img
                src={DEMO_THUMBNAIL_SRC}
                alt=""
                className="demo-video-modal-thumbnail"
                aria-hidden
              />
              <div className="demo-video-modal-spinner" aria-hidden>
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
            </>
          )}
          <video
            ref={videoRef}
            src={DEMO_VIDEO_SRC}
            controls
            playsInline
            className="demo-video-modal-player"
            preload="auto"
            poster={DEMO_THUMBNAIL_SRC}
            style={{ opacity: loading ? 0 : 1 }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
