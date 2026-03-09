import { useNavigate, useParams, useLocation } from "react-router";
import { Box, Download, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";

export default function VisualizerId() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    initialImage?: string;
    initialRendered?: string | null;
    name?: string;
  } | null;

  const displayImage = state?.initialRendered || state?.initialImage || null;
  const name = state?.name || `Residence ${id}`;

  const handleBack = () => navigate("/");
  const handleExport = () => {
    if (!displayImage) return;
    const link = document.createElement("a");
    link.href = displayImage;
    link.download = `floor-plan-ai-${id || "design"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="visualizer">
      <nav className="topbar">
        <a href="/" className="brand">
          <Box className="logo" />
          <span className="name">Floor Plan AI</span>
        </a>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{name}</h2>
              <p className="note">Created by You</p>
            </div>
            <div className="panel-actions">
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!displayImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="render-area">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Floor plan"
                className="render-img"
              />
            ) : (
              <div className="render-placeholder">
                <p className="text-zinc-500 text-sm">
                  No image. Upload from the home page.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
