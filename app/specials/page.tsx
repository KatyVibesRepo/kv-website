type DaySpecial = {
  title: string;
  time: string;
  detail?: string;
  tag?: string;
};

type SpecialDay = {
  day: string;
  hours: string;
  note: string;
  specials: DaySpecial[];
};

type PricedItem = {
  name: string;
  price: string;
};

const specialDays: SpecialDay[] = [
  {
    day: 'Tuesday',
    hours: '11:00 AM – 10:00 PM',
    note: 'Tacos, Tito’s, and all-day happy hour drinks.',
    specials: [
      { title: '$2.50 Tacos', time: 'All day', tag: 'Food Special' },
      { title: '$5 Tito’s Vodka', time: 'All day', tag: 'Drink Special' },
      {
        title: 'Happy Hour Drinks',
        time: 'All day Tuesday',
        detail: 'Tuesday is the exception to the regular 2:00 PM – 7:00 PM drink happy hour.',
        tag: 'Happy Hour',
      },
      {
        title: 'Happy Hour Food',
        time: '3:00 PM – 7:00 PM',
        detail: '$6 food selections plus $10 for 2 salmon sliders.',
        tag: 'Happy Hour',
      },
    ],
  },
  {
    day: 'Wednesday',
    hours: '11:00 AM – 12:00 AM',
    note: 'Wings, whiskey, and Old Fashioneds all day.',
    specials: [
      { title: '99¢ Wings', time: 'All day', tag: 'Food Special' },
      {
        title: '$5 Whiskeys',
        time: 'All day',
        detail: 'Buffalo Trace; Bulleit Rye or Bourbon; Crown Royal, Apple, Blackberry, Peach, or Vanilla; Jack Daniels Black, Fire, or Honey; Jim Beam; Sazerac.',
        tag: 'Whiskey Special',
      },
      {
        title: '$7 Whiskeys',
        time: 'All day',
        detail: 'Basil Hayden; Blade & Bow; Gentleman Jack; Jameson; Knob Creek; Maker’s Mark; Woodford Reserve; Dewar’s; Chivas Regal; Buchanan’s 12 Yr; Johnnie Walker Black.',
        tag: 'Whiskey Special',
      },
      { title: '$10 WhistlePig Rye', time: 'All day', tag: 'Whiskey Special' },
      {
        title: '$8 Old Fashioneds',
        time: 'All day',
        detail: 'Add $3 to any listed whiskey price when choosing that whiskey for an Old Fashioned.',
        tag: 'Cocktail Special',
      },
      {
        title: 'Happy Hour',
        time: 'Food 3:00 PM – 7:00 PM · Drinks 2:00 PM – 7:00 PM',
        tag: 'Happy Hour',
      },
    ],
  },
  {
    day: 'Thursday',
    hours: '11:00 AM – 12:00 AM',
    note: 'Ribeye, martinis, and happy hour.',
    specials: [
      { title: '$25 10 oz Ribeye', time: 'All day', tag: 'Food Special' },
      {
        title: '$7 Martinis',
        time: 'All day',
        detail: '43 Lemon Drop, Blackberry Martini, or Cucumber Martini.',
        tag: 'Drink Special',
      },
      {
        title: 'Happy Hour',
        time: 'Food 3:00 PM – 7:00 PM · Drinks 2:00 PM – 7:00 PM',
        tag: 'Happy Hour',
      },
    ],
  },
  {
    day: 'Friday',
    hours: '11:00 AM – 2:00 AM',
    note: 'Vibe Burger special plus happy hour.',
    specials: [
      { title: '$12 Vibe Burger', time: 'All day', tag: 'Food Special' },
      {
        title: 'Happy Hour',
        time: 'Food 3:00 PM – 7:00 PM · Drinks 2:00 PM – 7:00 PM',
        tag: 'Happy Hour',
      },
    ],
  },
  {
    day: 'Saturday',
    hours: '11:00 AM – 2:00 AM',
    note: 'Weekend Molcajete special.',
    specials: [
      { title: '$40 Molcajete', time: 'All day', tag: 'Food Special' },
      {
        title: 'No Happy Hour',
        time: 'Saturday',
        detail: 'Happy hour is Tuesday through Friday only.',
        tag: 'Weekend',
      },
    ],
  },
  {
    day: 'Sunday',
    hours: '11:00 AM – 10:00 PM',
    note: 'Sunday fried shrimp platter special.',
    specials: [
      { title: '$15 Fried Shrimp Platter', time: 'All day', tag: 'Food Special' },
      {
        title: 'No Happy Hour',
        time: 'Sunday',
        detail: 'Happy hour is Tuesday through Friday only.',
        tag: 'Weekend',
      },
    ],
  },
];

const happyHourFood: PricedItem[] = [
  { name: '2 Beef Sliders', price: '$6' },
  { name: '2 Chicken Sliders', price: '$6' },
  { name: '2 Tacos', price: '$6' },
  { name: '4 Flautas', price: '$6' },
  { name: 'Basket of French Fries', price: '$6' },
  { name: '5 Bone-In Wings', price: '$6' },
  { name: '5 Boneless Wings', price: '$6' },
  { name: 'Chips & Queso', price: '$6' },
  { name: '4 Coconut Shrimp', price: '$6' },
  { name: 'Crawfish Rice', price: '$6' },
  { name: 'Fried Pickles & Peppers', price: '$6' },
  { name: 'Spinach Dip', price: '$6' },
  { name: '2 Salmon Sliders', price: '$10' },
];

const happyHourLiquor: PricedItem[] = [
  { name: 'House Margarita', price: '$6' },
  { name: '1800 Silver / Reposado', price: '$6' },
  { name: 'Bacardi Light / Black', price: '$6' },
  { name: 'Beefeater', price: '$6' },
  { name: 'Crown Royal, Apple, Blackberry, Peach, Vanilla', price: '$6' },
  { name: 'Jack Daniels Black, Fire, Honey', price: '$6' },
  { name: 'Tito’s', price: '$6' },
];

const happyHourBottleBeer: PricedItem[] = [
  { name: 'Bud Light', price: '$3.75' },
  { name: 'Budweiser', price: '$3.75' },
  { name: 'Coors Light', price: '$3.75' },
  { name: 'Miller Lite', price: '$3.75' },
  { name: 'Angry Orchard', price: '$4.50' },
  { name: 'Corona Extra', price: '$4.50' },
  { name: 'Dos XX', price: '$4.50' },
  { name: 'Heineken', price: '$4.50' },
  { name: 'Michelob Ultra', price: '$4.50' },
  { name: 'Modelo Especial', price: '$4.50' },
  { name: 'Shiner Bock', price: '$4.50' },
  { name: 'Heineken 0.0', price: '$4.50' },
  { name: 'Michelob Zero', price: '$4.50' },
  { name: 'Guinness Extra Stout', price: '$5.25' },
];

const happyHour16ozBeer: PricedItem[] = [
  { name: 'Bud Light', price: '$5.20' },
  { name: 'Coors Light', price: '$5.20' },
  { name: 'Michelob Ultra', price: '$5.20' },
  { name: 'Miller Lite', price: '$5.20' },
  { name: 'Yuengling Lager', price: '$5.20' },
  { name: 'Blue Moon', price: '$6.00' },
  { name: 'Corona Extra', price: '$6.00' },
  { name: 'Dos XX', price: '$6.00' },
  { name: 'Hopadillo', price: '$6.00' },
  { name: 'Karbach Lager', price: '$6.00' },
  { name: 'Modelo Especial', price: '$6.00' },
  { name: 'Big Wave', price: '$6.40' },
  { name: 'Guinness', price: '$7.60' },
  { name: 'Ghost in the Machine', price: '$8.00' },
  { name: 'Stella Artois', price: '$8.00' },
];

const happyHour25ozBeer: PricedItem[] = [
  { name: 'Bud Light', price: '$5.20' },
  { name: 'Coors Light', price: '$5.20' },
  { name: 'Michelob Ultra', price: '$5.20' },
  { name: 'Miller Lite', price: '$5.20' },
  { name: 'Yuengling Lager', price: '$5.20' },
  { name: 'Blue Moon', price: '$5.20' },
  { name: 'Corona Extra', price: '$5.20' },
  { name: 'Dos XX', price: '$5.20' },
  { name: 'Hopadillo', price: '$5.20' },
  { name: 'Modelo Especial', price: '$5.20' },
  { name: 'Big Wave', price: '$5.20' },
  { name: 'Karbach Lager', price: '$5.20' },
  { name: 'Guinness', price: '$5.20' },
];

const happyHourWine = [
  'Pinot Grigio',
  'Chardonnay',
  'Sweet Red',
  'Pinot Noir',
  'Merlot',
  'Cabernet',
  'Rosé',
  'Moscato',
  'Champagne / Brut',
];

function PriceList({ items }: { items: PricedItem[] }) {
  return (
    <div className="special-day-list">
      {items.map((item) => (
        <div className="special-line-item" key={`${item.name}-${item.price}`}>
          <div className="row-between">
            <h4>{item.name}</h4>
            <strong>{item.price}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SpecialsPage() {
  return (
    <section className="stack specials-page">
      <div className="hero page-hero">
        <div className="eyebrow">Specials</div>
        <h1><span className="gradient-text">Daily specials &</span><br />happy hour.</h1>
        <p>
          Daily food and drink specials Tuesday through Sunday, plus happy hour Tuesday through Friday.
          Food happy hour runs 3:00 PM – 7:00 PM. Drinks run 2:00 PM – 7:00 PM, with happy hour drinks all day Tuesday.
        </p>
      </div>

      <section className="specials-panel stack">
        <div className="section-heading-row specials-heading-row">
          <div>
            <div className="eyebrow">Daily Specials</div>
            <h2>Something different every day.</h2>
          </div>
          <p className="muted">Monday closed. Daily specials below follow the current in-house specials sheet.</p>
        </div>

        <div className="special-days-grid">
          {specialDays.map((day) => (
            <article className="special-day-card" key={day.day}>
              <div className="special-day-header">
                <div>
                  <span className="eyebrow">{day.hours}</span>
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

      <section className="specials-panel stack">
        <div className="section-heading-row specials-heading-row">
          <div>
            <div className="eyebrow">Happy Hour</div>
            <h2>Tuesday through Friday.</h2>
          </div>
          <p className="muted">
            Food: 3:00 PM – 7:00 PM · Drinks: 2:00 PM – 7:00 PM · Tuesday happy hour drinks are available all day.
            No happy hour Saturday or Sunday.
          </p>
        </div>

        <div className="special-days-grid">
          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">3:00 PM – 7:00 PM</span>
                <h3>Happy Hour Food</h3>
              </div>
              <p>$6 food selections, plus 2 salmon sliders for $10.</p>
            </div>
            <PriceList items={happyHourFood} />
          </article>

          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">2:00 PM – 7:00 PM</span>
                <h3>Happy Hour Liquor</h3>
              </div>
              <p>All listed liquor happy hour selections are $6. Tuesday drink happy hour runs all day.</p>
            </div>
            <PriceList items={happyHourLiquor} />
          </article>

          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">Happy Hour</span>
                <h3>Beer · Bottles</h3>
              </div>
              <p>Bottle pricing from the current specials sheet.</p>
            </div>
            <PriceList items={happyHourBottleBeer} />
          </article>

          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">Happy Hour</span>
                <h3>Beer · 16 oz</h3>
              </div>
              <p>Draft pricing from the current specials sheet.</p>
            </div>
            <PriceList items={happyHour16ozBeer} />
          </article>

          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">Happy Hour</span>
                <h3>Beer · 25 oz</h3>
              </div>
              <p>25 oz pricing from the current specials sheet.</p>
            </div>
            <PriceList items={happyHour25ozBeer} />
          </article>

          <article className="special-day-card">
            <div className="special-day-header">
              <div>
                <span className="eyebrow">Happy Hour</span>
                <h3>House Wine</h3>
              </div>
              <p>$6 glass · $22 bottle</p>
            </div>
            <div className="special-day-list">
              {happyHourWine.map((wine) => (
                <div className="special-line-item" key={wine}>
                  <h4>{wine}</h4>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <div className="notice">
        Specials, pricing, and availability may change. Please confirm with your server when ordering.
      </div>
    </section>
  );
}
