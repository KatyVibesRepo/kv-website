import { reviews } from '@/lib/siteContent';

export function ReviewsSection() {
  return (
    <section className="reviews-section card" aria-labelledby="reviews-title">
      <div className="section-title-row reviews-title-row">
        <div>
          <div className="eyebrow">Reviews</div>
          <h2 id="reviews-title">Guests say it’s a vibe.</h2>
          <p className="muted">Real review highlights from guests who came for birthdays, dancing, music, food, drinks, and celebrations.</p>
        </div>
        <a className="button ghost small-button" href="/contact">Visit Katy Vibes</a>
      </div>
      <div className="reviews-track" aria-label="Guest reviews">
        {reviews.map((review) => (
          <article className="review-card" key={review.author}>
            <div className="review-stars" aria-label="Five star review">★★★★★</div>
            <div className="review-source">Review by — {review.source}</div>
            <h3>{review.author}</h3>
            <p>{review.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
