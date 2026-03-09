import { Cloud } from "lucide-react";
import Button from "./ui/Button";
import { useEffect } from "react";

type Props = {
  onContinue: () => void;
  onCancel: () => void;
};

export default function PuterConsentModal({ onContinue, onCancel }: Props) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onCancel]);

  return (
    <div
      className="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="puter-consent-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Close"
        >
          <span className="text-lg leading-none">×</span>
        </button>
        <div className="icon">
          <Cloud className="alert" aria-hidden />
        </div>
        <h3 id="puter-consent-title" className="font-serif font-bold text-black">
          Sign in with Puter
        </h3>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Floor Plan AI uses Puter for secure sign-in and cloud storage so your
          projects are saved and available across devices. You’ll see Puter’s
          approval screen next.
        </p>
        <div className="actions flex flex-row gap-3 items-center justify-center">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="confirm" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
