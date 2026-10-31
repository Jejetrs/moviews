import React from "react";
import { Link } from "react-router-dom";
import {
  IoBookmarkOutline,
  IoChatbubbleEllipsesOutline,
  IoFilmOutline,
  IoOptionsOutline,
  IoPeopleOutline,
  IoPlayCircleOutline,
  IoSearchOutline,
  IoStarOutline,
} from "react-icons/io5";
import PageHero from "../components/PageHero";

const FEATURES = [
  { Icon: IoFilmOutline, title: "Trending & new releases", text: "Daily and weekly trending lists, now-playing films and top-rated classics, refreshed from live data." },
  { Icon: IoOptionsOutline, title: "Smart browsing", text: "Filter movies and TV shows by genre, minimum rating, release year and sort order, all saved in the link." },
  { Icon: IoPlayCircleOutline, title: "Official trailers", text: "Watch the official trailer in a distraction-free player before you commit two hours." },
  { Icon: IoStarOutline, title: "Your own ratings", text: "Score anything from one to five stars, change your mind any time and see your ratings on the title page." },
  { Icon: IoChatbubbleEllipsesOutline, title: "Honest reviews", text: "Read short, spoiler-free reviews from the community and sort them by newest or top rated." },
  { Icon: IoBookmarkOutline, title: "Personal watchlist", text: "Bookmark titles from any poster and come back to a tidy list sorted the way you like." },
];

const STEPS = [
  { n: "01", title: "Discover", text: "Search, browse by genre or start from the trending row to find something that fits your mood." },
  { n: "02", title: "Decide", text: "Check the score, cast, overview and trailer on the title page, then save it or skip it." },
  { n: "03", title: "Share", text: "After watching, rate it and leave a short review so the next person can decide faster." },
];

const AboutUs = () => (
  <div className="info-page">
    <PageHero
      eyebrow="About Moviews"
      title="A calmer way to choose what to watch"
      subtitle="Moviews helps film and series fans discover great titles, keep track of what they want to see and share honest opinions without the noise."
    >
      <div className="info-actions">
        <Link to="/browse" className="btn btn-primary btn-lg">
          Start browsing
        </Link>
        <Link to="/register" className="btn btn-ghost btn-lg">
          Create an account
        </Link>
      </div>
    </PageHero>

    <div className="page-wrap">
      <section className="about-split">
        <div>
          <p className="eyebrow">Our mission</p>
          <h2>Less scrolling, more watching.</h2>
          <p>
            Choosing a film should not take longer than watching one. We bring scores, trailers, cast information and community reviews
            together on a single page so you can decide in minutes and spend the evening enjoying the movie.
          </p>
          <p>
            Every title is powered by The Movie Database (TMDB), so the information you see is detailed and kept up to date by a large
            community of contributors.
          </p>
        </div>
        <div className="about-quote">
          <IoPeopleOutline />
          <p>"Built by movie lovers who were tired of ten open tabs just to pick one film."</p>
          <span>The Moviews team</span>
        </div>
      </section>

      <section className="about-section">
        <div className="section-head">
          <div>
            <h2>What you can do here</h2>
            <p>Everything you need between “what should I watch?” and “that was great”.</p>
          </div>
        </div>
        <div className="feature-grid">
          {FEATURES.map(({ Icon, title, text }) => (
            <article key={title} className="feature-card">
              <span className="feature-icon">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="section-head">
          <div>
            <h2>How it works</h2>
            <p>Three steps from curiosity to couch.</p>
          </div>
        </div>
        <div className="steps">
          {STEPS.map((step) => (
            <article key={step.n} className="step">
              <b>{step.n}</b>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Questions or feedback?</h2>
          <p>Our Help Center covers the most common questions, and we read every message sent to support.</p>
        </div>
        <div className="info-actions">
          <Link to="/help-center" className="btn btn-primary">
            <IoSearchOutline /> Visit Help Center
          </Link>
          <a href="mailto:support@Moviews.com" className="btn btn-ghost">
            support@Moviews.com
          </a>
        </div>
      </section>
    </div>
  </div>
);

export default AboutUs;
