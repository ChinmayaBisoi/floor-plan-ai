import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Floor Plan AI" },
    {
      name: "description",
      content:
        "Build beautiful spaces at the speed of thought with Floor Plan AI.",
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useOutletContext<AuthContext>();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const isCreatingProjectRef = useRef(false);

  const handleUploadComplete = async (base64Image: string) => {
    if (isCreatingProjectRef.current) return;
    isCreatingProjectRef.current = true;

    try {
      const newId = Date.now().toString();
      const name = `Residence ${newId}`;

      const newItem: DesignItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      const saved = await createProject({
        item: newItem,
        visibility: "private",
      });

      if (!saved) {
        console.error("Failed to create project");
        setProjects((prev) => [newItem, ...prev]);
        navigate(`/visualizer/${newId}`, {
          state: {
            initialImage: base64Image,
            initialRendered: null,
            name,
          },
        });
        return;
      }

      setProjects((prev) => [saved, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name,
        },
      });
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      setProjects([]);
      setIsLoadingProjects(false);
      return;
    }
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      const items = await getProjects();
      setProjects(items);
      setIsLoadingProjects(false);
    };
    fetchProjects();
  }, [isSignedIn]);

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse" />
          </div>
          <p>Introducing Floor Plan AI</p>
        </div>

        <h1>
          Build beautiful spaces at the speed of thought with Floor Plan AI
        </h1>

        <p className="subtitle">
          Floor Plan AI is an AI-first design environment that helps you
          visualize, render, and ship architectural projects faster than ever.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, formats up to 10MB</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="projects-inner">
          <header className="projects-head">
            <h2>Projects</h2>
            <p>Your floor plans and renders in one place.</p>
          </header>

          <div className="projects-grid">
            {!isSignedIn && (
              <div className="projects-empty">
                <p>Log in to view your projects.</p>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("floorplan:openSignIn"))
                  }
                  className="projects-empty-cta"
                >
                  Log in
                </button>
              </div>
            )}
            {isSignedIn && isLoadingProjects && (
              <div className="projects-empty">
                <span className="projects-loading">Loading…</span>
              </div>
            )}
            {isSignedIn && !isLoadingProjects && projects.length === 0 && (
              <div className="projects-empty">
                <p>No projects yet. Upload a floor plan above to get started.</p>
              </div>
            )}
            {isSignedIn && !isLoadingProjects && projects.length > 0 && (
              <>
                {projects.map(
                  ({ id, name, renderedImage, sourceImage, timestamp }) => (
                    <article
                      key={id}
                      className="project-card group"
                      onClick={() => navigate(`/visualizer/${id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        navigate(`/visualizer/${id}`)
                      }
                    >
                      <div className="project-card-preview">
                        <img
                          src={renderedImage || sourceImage}
                          alt=""
                        />
                      </div>
                      <div className="project-card-body">
                        <h3>{name}</h3>
                        <div className="project-card-meta">
                          <Clock size={12} aria-hidden />
                          <span>{new Date(timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="project-card-arrow">
                          <ArrowUpRight size={18} aria-hidden />
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
