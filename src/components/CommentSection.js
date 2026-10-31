import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoTrashOutline } from "react-icons/io5";
import { deleteReview, loadReviews, postReview } from "../storejs/library";
import { errorMessage } from "../utils/api";
import StarRating from "./StarRating";
import { useToast } from "./ToastProvider";

const MAX = 600;
const EMPTY = [];

const CommentsSection = ({ itemKey }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const reviews = useSelector((state) => state.user.reviews[itemKey]) || EMPTY;
  const { isLoggedIn, username } = useSelector((state) => state.user.auth);
  const [text, setText] = useState("");
  const [stars, setStars] = useState(0);
  const [sort, setSort] = useState("new");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(loadReviews(itemKey)).catch(() => {}); // keeps whatever is already in the store if the API is down
  }, [dispatch, itemKey]);

  const sorted = useMemo(() => {
    const list = [...reviews];
    return sort === "top" ? list.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt) : list;
  }, [reviews, sort]);

  const average = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  const submit = async (event) => {
    event.preventDefault();
    if (!isLoggedIn) return;
    if (!text.trim() || !stars) {
      toast("Add a star rating and a few words first", "error");
      return;
    }
    setBusy(true);
    try {
      await dispatch(postReview(itemKey, { rating: stars, text: text.trim() }));
      setText("");
      setStars(0);
      toast("Review posted", "success");
    } catch (error) {
      toast(errorMessage(error, "Could not post your review"), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await dispatch(deleteReview(itemKey, id));
    } catch (error) {
      toast(errorMessage(error, "Could not delete the review"), "error");
    }
  };

  return (
    <section className="reviews">
      <div className="section-head">
        <div>
          <h2>Community Reviews</h2>
          <p>
            {reviews.length ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} · average ${average}/5` : "Be the first to share your thoughts"}
          </p>
        </div>
        {reviews.length > 1 && (
          <div className="seg">
            <button type="button" className={sort === "new" ? "is-active" : ""} onClick={() => setSort("new")}>
              Newest
            </button>
            <button type="button" className={sort === "top" ? "is-active" : ""} onClick={() => setSort("top")}>
              Top rated
            </button>
          </div>
        )}
      </div>

      {isLoggedIn ? (
      <form className="review-form" onSubmit={submit}>
        <div className="review-form-top">
          <span>Posting as <b>{username}</b></span>
          <StarRating value={stars} onChange={setStars} size={24} />
        </div>
        <textarea
          value={text}
          maxLength={MAX}
          rows={3}
          placeholder="What did you think about it? Keep it spoiler-free."
          onChange={(e) => setText(e.target.value)}
        />
        <div className="review-form-bottom">
          <span>{text.length}/{MAX}</span>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Posting…" : "Post review"}</button>
        </div>
      </form>
      ) : (
        <p className="muted">
          <Link to="/login" state={{ from: window.location.pathname }}>Sign in</Link> to rate and review this title.
        </p>
      )}

      <div className="review-list">
        {sorted.map((review) => (
          <article key={review.id} className="review">
            <div className="avatar">{review.user.charAt(0).toUpperCase()}</div>
            <div className="review-body">
              <div className="review-head">
                <b>{review.user}</b>
                <StarRating value={review.rating} readOnly size={14} />
                <time>{moment(review.createdAt).fromNow()}</time>
              </div>
              <p>{review.text}</p>
            </div>
            {isLoggedIn && review.user === username && (
              <button
                type="button"
                className="icon-btn ghost"
                aria-label="Delete review"
                onClick={() => remove(review.id)}
              >
                <IoTrashOutline />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommentsSection;
