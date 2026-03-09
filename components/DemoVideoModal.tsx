import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DEMO_VIDEO_SRC = "/application-demo-compressed.mp4";

export default function DemoVideoModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

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
        <video
          src={DEMO_VIDEO_SRC}
          controls
          playsInline
          className="demo-video-modal-player"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
