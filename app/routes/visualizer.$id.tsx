import {
  useNavigate,
  useOutletContext,
  useParams,
  useLocation,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import { AlertCircle, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Logo from "../../components/Logo";
import { createProject, getProjectById } from "../../lib/puter.action";
import {
  downloadImageFromUrl,
  shareImageFromUrl,
} from "../../lib/utils";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

const baseName = (id: string) => `floor-plan-${id}`;

export default function VisualizerId() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<"ok" | "copy" | "unsupported" | null>(null);

  const locationState = location.state as {
    initialImage?: string;
    initialRendered?: string | null;
    name?: string;
  } | null;

  const handleBack = () => navigate("/");

  const handleExport = async (url: string, label: "original" | "rendered") => {
    if (!url || !id) return;
    const name = `${baseName(id)}-${label}`;
    await downloadImageFromUrl(url, name);
  };

  const handleShare = async (url: string, label: "original" | "rendered") => {
    if (!url || !id) return;
    const name = `${baseName(id)}-${label}`;
    const ok = await shareImageFromUrl(url, name, `${project?.name || "Floor Plan"} – ${label}`);
    if (ok) {
      setShareFeedback("ok");
    } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareFeedback("copy");
      } catch {
        setShareFeedback("unsupported");
      }
    } else {
      setShareFeedback("unsupported");
    }
    setTimeout(() => setShareFeedback(null), 2500);
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    setGenerationError(null);
    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        const updatedItem: DesignItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) setProject(saved);
      } else {
        setGenerationError("Rendering didn’t return an image. Please try again.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rendering failed. Please try again.";
      setGenerationError(message);
      console.error("Generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoadError(null);

    const loadProject = async () => {
      if (!id) {
        setLoadError("Missing project ID.");
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);
      setLoadError(null);

      try {
        const fetchedProject = await getProjectById({ id });

        if (!isMounted) return;

        if (fetchedProject) {
          setProject(fetchedProject);
        } else if (locationState?.initialImage) {
          setProject({
            id,
            name: locationState.name || `Residence ${id}`,
            sourceImage: locationState.initialImage,
            renderedImage: locationState.initialRendered || undefined,
            timestamp: Date.now(),
          });
        } else {
          setLoadError("Project not found. It may have been deleted or the link is invalid.");
        }
      } catch (e) {
        if (!isMounted) return;
        setLoadError("Failed to load project. Please try again.");
        console.error("Load project failed:", e);
      } finally {
        if (isMounted) setIsProjectLoading(false);
        hasInitialGenerated.current = false;
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  const sourceImage = project?.sourceImage ?? null;
  const renderedImage = project?.renderedImage ?? null;

  if (loadError) {
    return (
      <div className="visualizer">
        <nav className="topbar">
          <a href="/" className="brand">
            <Logo className="logo" />
            <span className="name">Floor Plan AI</span>
          </a>
          <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
            <X className="icon" /> Exit Editor
          </Button>
        </nav>
        <section className="content">
          <div className="visualizer-state visualizer-error">
            <AlertCircle className="state-icon" />
            <h2>Something went wrong</h2>
            <p>{loadError}</p>
            <Button onClick={handleBack} className="mt-4">
              Back to home
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (isProjectLoading && !project) {
    return (
      <div className="visualizer">
        <nav className="topbar">
          <a href="/" className="brand">
            <Logo className="logo" />
            <span className="name">Floor Plan AI</span>
          </a>
          <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
            <X className="icon" /> Exit Editor
          </Button>
        </nav>
        <section className="content">
          <div className="visualizer-skeleton">
            <div className="skeleton-compare">
              <div className="skeleton-compare-head">
                <div className="skeleton-block h-5 w-24" />
                <div className="skeleton-block h-4 w-40" />
              </div>
              <div className="skeleton-compare-stage" />
            </div>
            <div className="skeleton-panels">
              <div className="skeleton-panel">
                <div className="skeleton-panel-head flex items-center gap-2">
                  <div className="skeleton-block h-4 w-20" />
                  <div className="skeleton-block h-4 w-28" />
                </div>
                <div className="skeleton-panel-image" />
              </div>
              <div className="skeleton-panel">
                <div className="skeleton-panel-head flex items-center gap-2">
                  <div className="skeleton-block h-4 w-20" />
                  <div className="skeleton-block h-4 w-28" />
                </div>
                <div className="skeleton-panel-image" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="visualizer">
      <nav className="topbar">
        <a href="/" className="brand">
          <Logo className="logo" />
          <span className="name">Floor Plan AI</span>
        </a>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        {/* 1. Comparison at top */}
        <div className="panel compare compare-first">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before &amp; After</h3>
            </div>
            <span className="compare-hint">Drag the slider to compare</span>
            <div className="panel-actions">
                <Button
                  size="sm"
                  onClick={() => renderedImage && handleExport(renderedImage, "rendered")}
                  className="export"
                  disabled={!renderedImage}
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => renderedImage && handleShare(renderedImage, "rendered")}
                  className="share"
                  disabled={!renderedImage}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
          </div>
          <div className="compare-stage">
            {sourceImage && renderedImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={sourceImage}
                    alt="Original floor plan"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={renderedImage}
                    alt="Rendered"
                    className="compare-img"
                  />
                }
              />
            ) : sourceImage ? (
              <div className="compare-fallback">
                <img src={sourceImage} alt="Original" className="compare-img" />
                {isProcessing && (
                  <div className="compare-render-overlay">
                    <div className="panel-image-placeholder processing">
                      <RefreshCcw className="spinner" />
                      <span>Rendering…</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="compare-fallback">
                <span className="text-zinc-400 text-sm">Loading…</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Original and Rendered side by side */}
        <div className="panels-row">
          <div className="panel panel-half">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Original</p>
                <h3>Floor plan</h3>
              </div>
              <div className="panel-actions">
                <Button
                  size="sm"
                  onClick={() => sourceImage && handleExport(sourceImage, "original")}
                  className="export"
                  disabled={!sourceImage}
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => sourceImage && handleShare(sourceImage, "original")}
                  className="share"
                  disabled={!sourceImage}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            <div className="panel-image-wrap">
              {sourceImage ? (
                <img src={sourceImage} alt="Original floor plan" className="panel-img" />
              ) : (
                <div className="panel-image-placeholder">No image</div>
              )}
            </div>
          </div>

          <div className="panel panel-half">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Rendered</p>
                <h3>3D visualization</h3>
              </div>
              <div className="panel-actions">
                <Button
                  size="sm"
                  onClick={() => renderedImage && handleExport(renderedImage, "rendered")}
                  className="export"
                  disabled={!renderedImage}
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => renderedImage && handleShare(renderedImage, "rendered")}
                  className="share"
                  disabled={!renderedImage}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            <div className="panel-image-wrap">
              {renderedImage ? (
                <img src={renderedImage} alt="Rendered" className="panel-img" />
              ) : generationError ? (
                <div className="panel-image-placeholder error">
                  <AlertCircle className="state-icon" />
                  <p>{generationError}</p>
                  <Button
                    size="sm"
                    onClick={() => project && runGeneration(project)}
                    disabled={isProcessing}
                  >
                    Try again
                  </Button>
                </div>
              ) : isProcessing ? (
                <div className="panel-image-placeholder processing">
                  <RefreshCcw className="spinner" />
                  <span>Rendering…</span>
                </div>
              ) : (
                <div className="panel-image-placeholder">Not generated yet</div>
              )}
            </div>
          </div>
        </div>

        {shareFeedback && (
          <div className="visualizer-toast" role="status">
            {shareFeedback === "ok" && "Shared successfully."}
            {shareFeedback === "copy" && "Link copied to clipboard."}
            {shareFeedback === "unsupported" && "Share not available; try Export to save the image."}
          </div>
        )}
      </section>
    </div>
  );
}
