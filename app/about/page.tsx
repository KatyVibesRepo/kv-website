export const metadata = {
  title: 'About Us | Katy Vibes',
  description: 'Learn about Katy Vibes: a community-rooted restaurant, bar, and live music venue in Katy, Texas.',
};

const communityValues = [
  'Community, culture, and connection',
  'Local talent and everyday heroes',
  'Food, music, celebrations, and shared memories',
  'A welcoming space where every guest feels like family',
];

export default function AboutPage() {
  return (
    <section className="stack about-page">
      <div className="hero page-hero about-hero">
        <div className="eyebrow">About Us – Katy Vibes</div>
        <h1><span className="gradient-text">Where the Community</span><br />Comes to Shine</h1>
        <p>
          At Katy Vibes, we’re more than a restaurant, bar, or live music venue — we’re a movement rooted in community, culture, and connection.
        </p>
        <div className="button-row">
          <a className="button hot" href="/events">View Events</a>
          <a className="button ghost" href="/reserve">Reserve a Table</a>
        </div>
      </div>

      <section className="about-story card stack">
        <div className="eyebrow">Our Story</div>
        <h2>Food, music, and people coming together.</h2>
        <p>
          Located in the heart of Katy, Texas, we’ve created a one-of-a-kind destination where food, music, and people come together to create unforgettable experiences.
        </p>
        <p>
          Our mission is simple: make Katy Vibes the number one spot in town by serving the community, celebrating its heroes, and uplifting local talent. From the up-and-coming singer on our stage to the everyday heroes who serve our city, we’re proud to be a space where everyone belongs, and every voice is heard.
        </p>
        <p>
          We host everything from high-energy DJ nights and tribute shows to family-friendly events, karaoke, and cultural celebrations. No matter the vibe, our goal stays the same — to bring people together, one event and one smile at a time.
        </p>
        <p>
          With delicious food, creative drinks, and a calendar full of diverse entertainment, Katy Vibes is where memories are made, connections are built, and the community thrives.
        </p>
        <p>
          Come see what the vibe is all about. You’re not just a guest — you’re part of the family.
        </p>
      </section>

      <section className="about-values-grid" aria-label="Katy Vibes values">
        {communityValues.map((value) => (
          <div className="card about-value-card" key={value}>
            <div className="eyebrow">Katy Vibes</div>
            <h3>{value}</h3>
          </div>
        ))}
      </section>

      <section className="split-section">
        <div className="card stack">
          <div className="eyebrow">Entertainment</div>
          <h2>Every night can have its own vibe.</h2>
          <p className="muted">
            From karaoke and live bands to DJs, line dancing, comedy, music bingo, open mic, tribute shows, and cultural celebrations, Katy Vibes is built around bringing people together.
          </p>
          <a className="button ghost" href="/events">See Upcoming Events</a>
        </div>
        <div className="card stack">
          <div className="eyebrow">Reservations</div>
          <h2>Plan your night with us.</h2>
          <p className="muted">
            Reserve a table, buy tickets for a special event, plan a party, or bring the family for food, drinks, and entertainment in one community-centered space.
          </p>
          <a className="button hot" href="/reserve">Reserve Now</a>
        </div>
      </section>
    </section>
  );
}
