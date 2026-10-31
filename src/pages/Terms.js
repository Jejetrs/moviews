import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";

const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    intro:
      "Welcome to Moviews. By using this website you agree to these terms. Moviews lets you discover films and TV shows, keep a watchlist, rate titles and share reviews. If you do not agree, please stop using the service.",
  },
  {
    id: "content",
    title: "Content guidelines",
    intro: "Reviews are public, so we ask everyone to keep them useful and respectful. When you post, you agree to:",
    items: [
      "Write honest reviews based on your own viewing experience",
      "Avoid spoilers or clearly warn readers about them",
      "Respect other opinions, even when you disagree",
      "Avoid spam, advertising and fake or paid reviews",
      "Not post hate speech, threats or harassment",
    ],
  },
  {
    id: "reviews",
    title: "Reviews and ratings",
    intro: "When you submit a review or rating:",
    items: [
      "You confirm the text is your own work",
      "Reviews are limited to 600 characters and should focus on the film or show",
      "You can delete your own reviews at any time",
      "We may remove reviews that break these terms",
    ],
  },
  {
    id: "copyright",
    title: "Copyright and media",
    intro:
      "Posters, images, trailers and descriptions belong to their respective owners and are provided through TMDB and YouTube. You may not:",
    items: [
      "Download or redistribute copyrighted film material",
      "Use posters or promotional images for commercial purposes",
      "Share links to pirated or illegal streams",
      "Copy reviews written by other people",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    intro: "An account is optional for browsing and required only for a profile. If you create one, you:",
    items: [
      "Are responsible for activity under your account",
      "Must keep your password confidential",
      "Must provide a valid email address",
      "Can edit your profile and change your password at any time",
    ],
  },
  {
    id: "moderation",
    title: "Moderation",
    intro: "To keep the community healthy, we reserve the right to:",
    items: [
      "Remove content that violates these terms",
      "Suspend accounts involved in repeated violations",
      "Update features, or pause the service for maintenance",
    ],
  },
  {
    id: "privacy",
    title: "Privacy and your data",
    intro: "We collect only what the service needs:",
    items: [
      "Your watchlist, ratings and reviews are stored in your own browser and are not uploaded",
      "Account details (name, username, email) are stored on our server and your password is saved as a secure hash",
      "We do not sell your personal information",
      "You can ask us to export or delete your account data by emailing support",
    ],
  },
  {
    id: "third-party",
    title: "Third-party services",
    intro:
      "Movie data is provided by TMDB, and trailers are played through YouTube. This product uses the TMDB API but is not endorsed or certified by TMDB. These services have their own terms and privacy policies.",
  },
  {
    id: "contact",
    title: "Contact us",
    intro: "Questions about these terms, or need to report a violation? Email our team at support@Moviews.com and we will respond as soon as we can.",
  },
];

const Terms = () => {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="info-page">
      <PageHero eyebrow="Legal" title="Terms & Conditions" subtitle="The simple rules that keep Moviews friendly, fair and useful for everyone.">
        <p className="info-meta">Last updated: October 30, 2026</p>
      </PageHero>

      <div className="page-wrap terms-layout">
        <nav className="terms-toc" aria-label="Table of contents">
          <p className="footer-title">On this page</p>
          {SECTIONS.map((section, index) => (
            <a key={section.id} href={`#${section.id}`} className={active === section.id ? "is-active" : ""}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          ))}
        </nav>

        <div className="terms-body">
          {SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id} className="terms-card">
              <h2>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <p>{section.intro}</p>
              {section.items && (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="terms-foot">
            Need help instead? Visit the <Link to="/help-center">Help Center</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
