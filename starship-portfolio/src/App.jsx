import React, { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Admin from "./Admin";
import LoginModal from "./LoginModal";
import { currentStardate, sortByStardate } from "./portfolioData";
import "./App.css";

function App() {
  const [currentSection, setCurrentSection] = useState("about");
  const [appData, setAppData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stardate, setStardate] = useState(() => currentStardate());

  useEffect(() => {
    // Fetch data from data.json
    fetch("/api/data")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => setAppData(data))
      .catch((error) => setLoadError(error.message));

    // Update stardate every second
    const interval = setInterval(() => {
      setStardate(currentStardate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setShowAdmin(true);
  };

  const handleLogout = async () => {
    const response = await fetch("/api/login", { method: "DELETE" });
    if (!response.ok) return;
    setIsLoggedIn(false);
    setShowAdmin(false);
  };

  // Show admin panel if authenticated and admin mode is active
  if (showAdmin && isLoggedIn) {
    return <Admin onLogout={handleLogout} onDataChange={setAppData} />;
  }

  // Show loading state while data is being fetched
  if (!appData) {
    return (
      <div className="app loading">
        <div className="loading-text">{loadError || "LOADING STARSHIP INTERFACE..."}</div>
      </div>
    );
  }

  const renderSection = () => {
    const section = appData[currentSection];

    if (!section) return null;

    if (currentSection === "about") {
      return (
        <div className="about-section">
          <h2>{section.title}</h2>
          {section.image && (
            <img src={section.image} alt="Profile" className="profile-image" />
          )}
          <p>{section.bio}</p>
          <p>{section.inspiration}</p>
          <p>{section.closing}</p>
        </div>
      );
    }

    if (currentSection === "projects") {
      return (
        <div className="projects-section">
          <h2>PROJECTS</h2>
          <div className="projects-grid">
            {sortByStardate(section).map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-stardate">{project.stardate}</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    VIEW PROJECT →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentSection === "mission_update") {
      return (
        <div className="mission-section">
          <h2>MISSION UPDATES</h2>
          <div className="mission-timeline">
            {sortByStardate(section).map((update, index) => (
              <div key={index} className="mission-item">
                <div className="mission-stardate">{update.stardate}</div>
                <h3>{update.update_title}</h3>
                <p>{update.update_desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentSection === "contact") {
      return (
        <div className="contact-section">
          <h2>CONTACT</h2>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">EMAIL:</span>
              <a href={`mailto:${section.email}`}>{section.email}</a>
            </div>
            <div className="contact-item">
              <span className="contact-label">GITHUB:</span>
              <a href={section.github} target="_blank" rel="noopener noreferrer">
                {section.github}
              </a>
            </div>
            <div className="contact-item">
              <span className="contact-label">LINKEDIN:</span>
              <a href={section.linkedin} target="_blank" rel="noopener noreferrer">
                {section.linkedin}
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (currentSection === "edumaxim") {
      return (
        <div className="edumaxim-section">
          <h2>{section.title}</h2>
          <h3>{section.subtitle}</h3>
          <p>{section.description}</p>
          <div className="mission-text">
            <h4>Our Mission</h4>
            <p>{section.mission}</p>
          </div>
          <div className="features-list">
            <h4>Platform Features:</h4>
            <ul>
              {section.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="platform-access">
            <a
              href={section.platform_link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
            >
              {section.call_to_action} →
            </a>
          </div>
        </div>
      );
    }

    if (currentSection === "digital_services") {
      const services = [
        {
          code: "01",
          title: "Meeting & Webinar Hosting",
          description:
            "Reliable technical hosting and support for meetings, webinars, and online sessions, from setup through close-down.",
        },
        {
          code: "02",
          title: "Automation Scripts",
          description:
            "Practical scripts that remove repetitive work, connect everyday tools, and help your team spend more time on the work that matters.",
        },
        {
          code: "03",
          title: "Website Development & Maintenance",
          description:
            "Websites built around your needs, with ongoing updates, improvements, and technical maintenance to keep them working well.",
        },
        {
          code: "04",
          title: "Active Directory Setup & Maintenance",
          description:
            "Structured Active Directory setup and dependable maintenance for organisations that need a secure, manageable IT foundation.",
        },
      ];

      return (
        <div className="digital-services-section">
          <div className="services-intro">
            <p className="services-eyebrow">SHW DIGITAL SERVICES // ONLINE</p>
            <h2>Technology that keeps work moving.</h2>
            <p className="services-lede">
              Practical digital support for people and organisations that need
              technology to be useful, reliable, and ready for the next task.
            </p>
            <a
              className="services-cta"
              href="https://shwdigitalservices.site"
              target="_blank"
              rel="noopener noreferrer"
            >
              VISIT SHW DIGITAL SERVICES <span aria-hidden="true">-&gt;</span>
            </a>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.code}>
                <span className="service-code">SERVICE {service.code}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>

          <div className="services-contact">
            <span>READY TO DISCUSS YOUR REQUIREMENTS?</span>
            <a href="https://shwdigitalservices.site" target="_blank" rel="noopener noreferrer">
              SHWDIGITALSERVICES.SITE
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app">
      <audio src="/ambient.mp3" autoPlay loop />
      <SpeedInsights />

      <header className="header">
        <div className="header-content">
          <div className="header-title">SCOTT HARVEY-WHITTLE PORTFOLIO INTERFACE</div>
          <div className="header-info">
            <span className="stardate">STARDATE: {stardate}</span>
            <span className="status">UPLINK STATUS: ACTIVE</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <button
            className={`nav-button ${currentSection === "about" ? "active" : ""}`}
            onClick={() => setCurrentSection("about")}
          >
            ABOUT
          </button>
          <button
            className={`nav-button ${currentSection === "projects" ? "active" : ""}`}
            onClick={() => setCurrentSection("projects")}
          >
            PROJECTS
          </button>
          <button
            className={`nav-button ${
              currentSection === "mission_update" ? "active" : ""
            }`}
            onClick={() => setCurrentSection("mission_update")}
          >
            MISSION UPDATE
          </button>
          <button
            className={`nav-button ${currentSection === "contact" ? "active" : ""}`}
            onClick={() => setCurrentSection("contact")}
          >
            CONTACT
          </button>
          <button
            className={`nav-button ${currentSection === "edumaxim" ? "active" : ""}`}
            onClick={() => setCurrentSection("edumaxim")}
          >
            EDUMAXIM
          </button>
          <button
            className={`nav-button ${
              currentSection === "digital_services" ? "active" : ""
            }`}
            onClick={() => setCurrentSection("digital_services")}
          >
            DIGITAL SERVICES
          </button>
          {isLoggedIn && (
            <button
              className="nav-button logout-button"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          )}
        </aside>
        <main className="content-panel">{renderSection()}</main>
      </div>

      <footer className="footer-admin">
        <span className="admin-link" onClick={handleLogin} title="Admin Access">
          ⚙
        </span>
      </footer>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
