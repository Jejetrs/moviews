import React, { useMemo, useState } from "react";
import {
  IoBookmarkOutline,
  IoBuildOutline,
  IoChatbubbleEllipsesOutline,
  IoChevronDown,
  IoMailOutline,
  IoPersonOutline,
  IoRocketOutline,
  IoSearch,
} from "react-icons/io5";
import PageHero from "../components/PageHero";
import { ARTICLES, CATEGORIES } from "../data/helpData";

const ICONS = {
  rocket: IoRocketOutline,
  bookmark: IoBookmarkOutline,
  chat: IoChatbubbleEllipsesOutline,
  person: IoPersonOutline,
  build: IoBuildOutline,
};

const highlight = (text, term) => {
  if (!term) return text;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
};

const HelpCenter = () => {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState("what-is");
  const [form, setForm] = useState({ topic: "Account problem", email: "", message: "" });

  const query = term.trim();
  const results = useMemo(() => {
    const lower = query.toLowerCase();
    return ARTICLES.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!lower || item.q.toLowerCase().includes(lower) || item.a.toLowerCase().includes(lower))
    );
  }, [query, category]);

  const popular = ARTICLES.filter((item) => item.popular);

  const jumpTo = (id) => {
    setTerm("");
    setCategory("all");
    setOpen(id);
    setTimeout(() => document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  const sendMail = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`[Help] ${form.topic}`);
    const body = encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`);
    window.location.href = `mailto:support@Moviews.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="info-page">
      <PageHero eyebrow="Help Center" title="How can we help you?" subtitle="Search answers about your watchlist, ratings, reviews and account.">
        <div className="help-search">
          <IoSearch />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for answers, e.g. password, trailer, watchlist"
            aria-label="Search help articles"
          />
        </div>
        <div className="help-popular">
          <span>Popular:</span>
          {popular.slice(0, 5).map((item) => (
            <button key={item.id} type="button" onClick={() => jumpTo(item.id)}>
              {item.q.replace(/\?$/, "")}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="page-wrap">
        <section className="help-cats">
          {CATEGORIES.map((item) => {
            const Icon = ICONS[item.icon];
            const count = ARTICLES.filter((article) => article.category === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                className={`help-cat ${category === item.id ? "is-active" : ""}`}
                onClick={() => setCategory(category === item.id ? "all" : item.id)}
              >
                <span className="feature-icon">
                  <Icon />
                </span>
                <b>{item.title}</b>
                <small>{item.blurb}</small>
                <em>{count} articles</em>
              </button>
            );
          })}
        </section>

        <section className="help-main">
          <div className="section-head">
            <div>
              <h2>{query ? `Results for "${query}"` : category === "all" ? "Frequently asked questions" : CATEGORIES.find((c) => c.id === category)?.title}</h2>
              <p>{results.length} article{results.length === 1 ? "" : "s"}</p>
            </div>
            {(category !== "all" || query) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCategory("all"); setTerm(""); }}>
                Clear filters
              </button>
            )}
          </div>

          <div className="faq-list">
            {results.map((item) => {
              const expanded = open === item.id;
              return (
                <article key={item.id} id={`faq-${item.id}`} className={`faq ${expanded ? "is-open" : ""}`}>
                  <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? "" : item.id)}>
                    <span>{highlight(item.q, query)}</span>
                    <IoChevronDown />
                  </button>
                  {expanded && (
                    <div className="faq-answer">
                      <p>{highlight(item.a, query)}</p>
                      <small>{CATEGORIES.find((c) => c.id === item.category)?.title}</small>
                    </div>
                  )}
                </article>
              );
            })}
            {results.length === 0 && (
              <div className="state-box">
                <p>No articles match "{query}". Try a different keyword or send us a message below.</p>
              </div>
            )}
          </div>
        </section>

        <section className="help-contact">
          <div>
            <p className="eyebrow">Still stuck?</p>
            <h2>Talk to our support team</h2>
            <p>Tell us what happened and we will get back to you by email, usually within one to two working days.</p>
            <ul>
              <li><IoMailOutline /> support@Moviews.com</li>
              <li><IoChatbubbleEllipsesOutline /> Include the title name and what you expected to see</li>
            </ul>
          </div>
          <form onSubmit={sendMail} className="auth-form">
            <label>
              <span>Topic</span>
              <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                <option>Account problem</option>
                <option>Something is not loading</option>
                <option>Report a review</option>
                <option>Delete my data</option>
                <option>Feedback or idea</option>
              </select>
            </label>
            <label>
              <span>Your email</span>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </label>
            <label>
              <span>Message</span>
              <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the problem or question" />
            </label>
            <button type="submit" className="btn btn-primary">
              Send message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
