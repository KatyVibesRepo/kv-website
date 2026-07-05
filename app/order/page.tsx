import { katyVibesInfo } from '@/lib/siteContent';

export default function OrderPage() {
  return (
    <section className="stack">
      <div className="hero page-hero">
        <div className="eyebrow">Order Online</div>
        <h1><span className="gradient-text">Treat yourself</span><br />with a click.</h1>
        <p>Order Katy Vibes favorites online for pickup or delivery through our ordering partner.</p>
        <div className="button-row">
          <a className="button hot" href={katyVibesInfo.orderUrl}>Open Online Ordering</a>
          <a className="button ghost" href="/food">View Food Menu</a>
        </div>
      </div>
      <div className="notice">Prefer to dine in? Reserve a table, explore upcoming events, or call Katy Vibes if you need help with your order.</div>
    </section>
  );
}
