type DaySpecial = {
  title: string;
  time: string;
  detail?: string;
  tag?: string;
};

type SpecialDay = {
  day: string;
  note: string;
  specials: DaySpecial[];
};

const specialDays: SpecialDay[] = [
  {
    day: 'Tuesday',
    note: 'Tacos, happy hour drinks, and early-week specials.',
    specials: [
      { title: '$5 Taco Tuesday', time: '5:00 PM – 10:00 PM', tag: 'Food Special' },
      { title: 'Happy Hour Food', time: 'Early evening', detail: 'Bites, sliders, wings, tacos, queso, crawfish rice, and more.', tag: 'Food Deals' },
      { title: 'Happy Hour Drinks', time: 'All day Tuesday', detail: '$6 house wine, frozen house margarita, Tito’s, Crown, Jack Daniel’s, Bacardi, and 1800 tequila.', tag: 'Drink Deals' },
    ],
  },
  {
    day: 'Wednesday',
    note: 'Whiskey, wings, and midweek happy hour.',
    specials: [
      { title: 'Whiskey & Wing Wednesdays', time: '5:00 PM – 12:00 AM', detail: '$5 whiskeys, $8 Old Fashioneds, and wing specials.', tag: 'Weekly Feature' },
      { title: 'Happy Hour Food', time: '5:00 PM – 7:00 PM', detail: 'Bites, sliders, wings, tacos, queso, crawfish rice, and more.', tag: 'Food Deals' },
      { title: 'Happy Hour Drinks', time: '5:00 PM – 7:00 PM', detail: '$6 house wine, frozen house margarita, Tito’s, Crown, Jack Daniel’s, Bacardi, and 1800 tequila.', tag: 'Drink Deals' },
    ],
  },
  {
    day: 'Thursday',
    note: 'Dinner specials, martinis, and happy hour before the night picks up.',
    specials: [
      { title: 'Ribeye Night + Select Martinis', time: '5:00 PM – 11:00 PM', detail: '10 oz ribeye special and select martinis.', tag: 'Dinner Feature' },
      { title: 'Happy Hour Food', time: '5:00 PM – 7:00 PM', detail: 'Bites, sliders, wings, tacos, queso, crawfish rice, and more.', tag: 'Food Deals' },
      { title: 'Happy Hour Drinks', time: '5:00 PM – 7:00 PM', detail: '$6 house wine, frozen house margarita, Tito’s, Crown, Jack Daniel’s, Bacardi, and 1800 tequila.', tag: 'Drink Deals' },
    ],
  },
  {
    day: 'Friday',
    note: 'Start the weekend with happy hour and the full Katy Vibes energy.',
    specials: [
      { title: '$6 Happy Hour', time: '5:00 PM – 7:00 PM', tag: 'Weekend Kickoff' },
      { title: 'Happy Hour Food', time: '5:00 PM – 7:00 PM', detail: 'Bites, sliders, wings, tacos, queso, crawfish rice, and more.', tag: 'Food Deals' },
      { title: 'Happy Hour Drinks', time: '5:00 PM – 7:00 PM', detail: '$6 house wine, frozen house margarita, Tito’s, Crown, Jack Daniel’s, Bacardi, and 1800 tequila.', tag: 'Drink Deals' },
    ],
  },
];

export default function SpecialsPage() {
  return (
    <section className="stack specials-page">
      <div className="hero page-hero">
        <div className="eyebrow">Specials</div>
        <h1><span className="gradient-text">Weekly food & drink</span><br />specials.</h1>
        <p>Enjoy tacos, wings, whiskey, martinis, happy hour favorites, and more throughout the week.</p>
      </div>

      <section className="specials-panel stack">
        <div className="section-heading-row specials-heading-row">
          <div>
            <div className="eyebrow">Weekly Specials</div>
            <h2>Food and drink deals by day.</h2>
          </div>
          <p className="muted">Check what is available Tuesday through Friday and plan your next night at Katy Vibes.</p>
        </div>

        <div className="special-days-grid">
          {specialDays.map((day) => (
            <article className="special-day-card" key={day.day}>
              <div className="special-day-header">
                <div>
                  <span className="eyebrow">{day.day}</span>
                  <h3>{day.day}</h3>
                </div>
                <p>{day.note}</p>
              </div>

              <div className="special-day-list">
                {day.specials.map((special) => (
                  <div className="special-line-item" key={`${day.day}-${special.title}-${special.time}`}>
                    <div className="special-line-top">
                      {special.tag && <span className="special-category-chip">{special.tag}</span>}
                      <span className="special-time-chip">{special.time}</span>
                    </div>
                    <h4>{special.title}</h4>
                    {special.detail && <p>{special.detail}</p>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="notice">Specials, pricing, and availability may change by day. Please confirm with your server.</div>
    </section>
  );
}
