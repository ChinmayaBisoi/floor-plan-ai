import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
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
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
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
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      const items = await getProjects();
      setProjects(items);
      setIsLoadingProjects(false);
    };
    fetchProjects();
  }, []);

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
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest work and shared community projects, all in one
                place.
              </p>
            </div>
          </div>

          <div className="projects-grid">
            {isLoadingProjects ? (
              <div className="empty">
                <span className="loading">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="empty">
                No projects yet. Upload a floor plan above to get started.
              </div>
            ) : (
              projects.map(
                ({ id, name, renderedImage, sourceImage, timestamp }) => (
                  <div
                    key={id}
                    className="project-card group"
                    onClick={() => navigate(`/visualizer/${id}`)}
                  >
                    <div className="preview">
                      <img
                        src={renderedImage || sourceImage}
                        alt="Project"
                      />
                      <div className="badge">
                        <span>Community</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div>
                        <h3>{name}</h3>
                        <div className="meta">
                          <Clock size={12} />
                          <span>
                            {new Date(timestamp).toLocaleDateString()}
                          </span>
                          <span>By You</span>
                        </div>
                      </div>
                      <div className="arrow">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
