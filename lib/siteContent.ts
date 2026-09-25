export const katyVibesInfo = {
  name: 'Katy Vibes',
  tagline: 'Restaurant • Bar • Live Events • Community',
  phoneDisplay: '(832) 437-2807',
  phoneHref: 'tel:18324372807',
  email: 'info@katyvibes.com',
  addressLines: ['24757 Katy Freeway', 'Katy, TX 77494'],
  orderUrl: 'https://order.online/store/katy-vibes-restaurant-&-bar-katy-31147277/',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/KatyVibesTX/' },
    { label: 'Instagram', href: 'https://www.instagram.com/KatyVibesTX' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@katyvibes' },
    { label: 'Google', href: 'https://www.google.com/search?q=Katy+Vibes+Restaurant+%26+Bar+Katy+TX' },
  ],
  hours: [
    { day: 'Monday', time: 'Closed' },
    { day: 'Tuesday', time: '11:00 AM – 10:00 PM' },
    { day: 'Wednesday', time: '11:00 AM – 12:00 AM' },
    { day: 'Thursday', time: '11:00 AM – 12:00 AM' },
    { day: 'Friday', time: '11:00 AM – 2:00 AM' },
    { day: 'Saturday', time: '11:00 AM – 2:00 AM' },
    { day: 'Sunday', time: '11:00 AM – 10:00 PM' },
  ],
};

export const primaryNav = [
  { label: 'Food', href: '/food' },
  { label: 'Drinks', href: '/drinks' },
  { label: 'Specials', href: '/specials' },
  { label: 'Events', href: '/events' },
  { label: 'About Us', href: '/about' },
  { label: 'Order', href: '/order' },
  { label: 'Reserve', href: '/reserve' },
  { label: 'Parties', href: '/parties' },
  { label: 'Catering', href: '/catering' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Contact', href: '/contact' },
];


export const reviews = [
  {
    source: 'Google',
    author: 'Maricel A.',
    quote: 'We had a great time celebrating my birthday. Went on DJ Friday night and danced the night away. Really a great vibe and customer service was great.',
  },
  {
    source: 'Google',
    author: 'DMay M.',
    quote: "It's a Vibe. Definitely going back. They have different specials every day and even have karaoke night.",
  },
  {
    source: 'Google',
    author: 'Christopher C.',
    quote: 'We had our first school reunion here after 25 years and it turned out great. I most definitely recommend it for celebrations and parties.',
  },
  {
    source: 'Google',
    author: 'Stacy V.',
    quote: 'The venue is vibrant and spacious. The drinks and food were great too. We look forward to returning to Katy Vibes for more fun.',
  },
  {
    source: 'Google',
    author: 'Michell H.',
    quote: 'Great atmosphere. Awesome place for good food, entertainment, and music. Wings are awesome and well seasoned.',
  },
];

export const homeFeaturePanels = [
  {
    eyebrow: 'Versatile events venue',
    title: 'Your destination for unforgettable moments',
    text: 'From live music and DJs to karaoke, comedy, cultural nights, and private celebrations, Katy Vibes is built around the moments people remember.',
    href: '/events',
    action: 'See Events',
  },
  {
    eyebrow: 'Join us today',
    title: 'Find the perfect seat',
    text: 'Make a reservation, choose a ticketed table, or bring the group for food, drinks, and entertainment under the same roof.',
    href: '/reserve',
    action: 'Reserve Now',
  },
  {
    eyebrow: 'We host. You party.',
    title: 'Special occasions made easier',
    text: 'Birthdays, office functions, reunions, holiday parties, and catering all have a place in the Katy Vibes plan.',
    href: '/parties',
    action: 'Plan a Party',
  },
];

export type MenuItem = { name: string; description?: string; price?: string; badge?: string; itemKey?: string };
export type MenuSection = { title: string; kicker?: string; items: MenuItem[] };

export const foodSections: MenuSection[] = [
  {
    title: 'Bites & Shareables',
    kicker: 'Start the table with something everyone can grab.',
    items: [
      { itemKey: 'web-v1-food-bites-and-shareables-coconut-shrimp', name: 'Coconut Shrimp', description: 'Jumbo shrimp breaded in coconut flakes and deep fried. Served with sweet chili sauce and red cabbage coleslaw.', badge: 'Guest Favorite' },
      { itemKey: 'web-v1-food-bites-and-shareables-spinach-dip', name: 'Spinach Dip', description: 'Served with crispy tortilla chips.' },
      { itemKey: 'web-v1-food-bites-and-shareables-salmon-sliders', name: 'Salmon Sliders', description: 'Tender salmon filet, Sriracha mayo, spinach, tomato, and red onions served on mini brioche buns.' },
      { itemKey: 'web-v1-food-bites-and-shareables-party-sampler', name: 'Party Sampler', description: 'Onion ring tower, creamy jalapeño puffs, 5 bone-in buffalo wings, cheese curds, fried pickles, and seasoned fries.' },
      { itemKey: 'web-v1-food-bites-and-shareables-tex-mex-sampler', name: 'Tex-Mex Sampler', description: 'Creamy jalapeño puffs, crispy chicken flautas, loaded nachos, and chicken or beef quesadillas.' },
      { itemKey: 'web-v1-food-bites-and-shareables-crawfish-rice', name: 'Crawfish Rice', description: 'New Orleans-style Cajun crawfish fried rice with bell peppers and onions. Add shrimp or fish for an upcharge.' },
      { itemKey: 'web-v1-food-bites-and-shareables-fried-rice', name: 'Fried Rice', description: 'White rice with fried egg, onions, bell peppers, carrots, and green onions. Add beef, shrimp, or both.' },
      { itemKey: 'web-v1-food-bites-and-shareables-crab-stuffed-mushrooms', name: 'Crab Stuffed Mushrooms', description: 'Beer-battered deep-fried tempura-stuffed mushrooms served with sriracha aioli and eel sauce.' },
      { itemKey: 'web-v1-food-bites-and-shareables-loaded-nachos', name: 'Loaded Nachos', description: 'Chicken fajitas piled high with black beans, white queso, pico de gallo, guacamole, sour cream, jalapeños, and salsa. Change to beef for an upcharge.' },
      { itemKey: 'web-v1-food-bites-and-shareables-fried-pickles-and-peppers', name: 'Fried Pickles & Peppers', description: 'Deep-fried pickles, salad peppers, and jalapeño bottle caps served with Southwest ranch.' },
      { itemKey: 'web-v1-food-bites-and-shareables-cheese-curds', name: 'Cheese Curds', description: 'Vintage fried cheese curds served with a robust marinara. Try them spicy.' },
      { itemKey: 'web-v1-food-bites-and-shareables-chips-and-queso', name: 'Chips & Queso', description: 'In-house queso with salsa and tortilla chips.' },
    ],
  },
  {
    title: 'Salads',
    kicker: 'Add grilled chicken, shrimp, or salmon to build it your way.',
    items: [
      { itemKey: 'web-v1-food-salads-chicken-caesar-salad', name: 'Chicken Caesar Salad', description: 'Hearts of romaine, sliced cherry tomatoes, grilled chicken, croutons, and house-made Caesar dressing.' },
      { itemKey: 'web-v1-food-salads-grilled-chicken-salad', name: 'Grilled Chicken Salad', description: 'Grilled chicken, mixed greens, tomatoes, onions, cucumbers, and croutons.' },
      { itemKey: 'web-v1-food-salads-caesar-salad', name: 'Caesar Salad', description: 'Crisp hearts of romaine, sliced cherry tomatoes, and croutons tossed in house-made Caesar dressing.' },
      { itemKey: 'web-v1-food-salads-house-side-salad', name: 'House Side Salad', description: 'Mixed greens, tomatoes, onions, cucumbers, and croutons.' },
    ],
  },
  {
    title: 'Sandwiches & Burgers',
    kicker: 'All sandwiches are served with seasoned fries. Upgrade sides and add premium toppings.',
    items: [
      { itemKey: 'web-v1-food-sandwiches-and-burgers-the-vibe-burger', name: 'The Vibe Burger', description: 'All-beef patty with house Sriracha mayo, sliced tomato, lettuce, American cheese, and an onion ring on a toasted sweet wheat sourdough bun. Vegan patty available upon request.' },
      { itemKey: 'web-v1-food-sandwiches-and-burgers-texas-smash-burger', name: 'Texas Smash Burger', description: 'Two smashed all-beef patties with yellow and white American cheese, lettuce, tomatoes, jalapeño slices, bacon, guacamole, and signature house Sriracha mayo on a toasted sourdough onion bun.' },
      { itemKey: 'web-v1-food-sandwiches-and-burgers-club-sandwich', name: 'Club Sandwich', description: 'Turkey, bacon, ham, lettuce, Swiss cheese, tomatoes, and mayo piled high on sourdough.' },
      { itemKey: 'web-v1-food-sandwiches-and-burgers-chicken-sandwich', name: 'Chicken Sandwich', description: 'Juicy chicken breast fried or grilled and topped with pickles, Sriracha aioli, and coleslaw. Toss in a wing sauce for an upcharge.' },
      { itemKey: 'web-v1-food-sandwiches-and-burgers-the-monte-cristo', name: 'The Monte Cristo', description: 'Turkey, ham, Swiss cheese, and 4-berry marmalade beer-battered and crusted on Texas toast.' },
      { itemKey: 'web-v1-food-sandwiches-and-burgers-philly-cheese-steak', name: 'Philly Cheese Steak', description: 'Thin shaved steak, caramelized onions, and bell peppers topped with provolone cheese on a toasted hoagie roll.' },
    ],
  },
  {
    title: 'Wings',
    kicker: 'Served with cucumber, carrots, celery, and ranch or bleu cheese. Add fries or upgrade to parmesan truffle fries.',
    items: [
      { itemKey: 'web-v1-food-wings-bone-in-wings', name: 'Bone-In Wings', description: 'Classic bone-in wings tossed in your choice of sauce or dry rub.' },
      { itemKey: 'web-v1-food-wings-boneless-wings', name: 'Boneless Wings', description: 'Boneless wings tossed your way and served with ranch or bleu cheese.' },
      { itemKey: 'web-v1-food-wings-wings-tray-special', name: 'Wings Tray Special', description: '12 bone-in wings, 12 boneless wings, and seasoned fries.' },
      { itemKey: 'web-v1-food-wings-wing-sauces', name: 'Wing Sauces', description: 'Buffalo mild, medium, or hot; BBQ; Korean BBQ; Honey Garlic BBQ; General Tso; Spicy Lemon Pepper; Mango Habanero; Catastrophic; Insanity.' },
      { itemKey: 'web-v1-food-wings-dry-rubs', name: 'Dry Rubs', description: 'Lemon Pepper, BBQ, Habanero, and Garlic Parmesan.' },
      { itemKey: 'web-v1-food-wings-wing-prep-options', name: 'Wing Prep Options', description: 'Naked, double fried, grilled, blackened, or all flats for an upcharge.' },
    ],
  },
  {
    title: 'Entrées',
    kicker: 'Dinner plates built for date night, groups, and celebrations.',
    items: [
      { itemKey: 'web-v1-food-entrees-molcajete', name: 'Molcajete', description: 'A massive stone bowl filled with salsa, surrounded by jumbo shrimp, chicken and beef fajitas, onions and bell peppers, grilled jalapeños, and queso asado. Served with Spanish rice, black beans, and tortillas. Perfect for two.' },
      { itemKey: 'web-v1-food-entrees-hanging-skewer', name: 'Hanging Skewer', description: 'Chicken, shrimp, beef, or all three served with grilled red potatoes, broccolini, and creamy beurre blanc.' },
      { itemKey: 'web-v1-food-entrees-ribeye', name: 'Ribeye', description: 'Ribeye served with roasted garlic mashed potatoes and broccolini. Upgrade to loaded mashed potatoes or loaded baked potato.' },
      { itemKey: 'web-v1-food-entrees-lamb-chop-lollipops', name: 'Lamb Chop Lollipops', description: 'Three lamb lollipops over roasted garlic mashed potatoes with demi-glace and carrots sautéed in a honey reduction. Add mint jelly or an extra lamb chop.' },
      { itemKey: 'web-v1-food-entrees-fajitas', name: 'Fajitas', description: 'Served with Spanish rice and charro beans, plus sour cream, guacamole, salsa, and your choice of flour or corn tortillas.' },
      { itemKey: 'web-v1-food-entrees-tacos', name: 'Tacos', description: 'Three corn or flour tacos filled with chicken and topped with diced onions, cilantro, and queso fresco. Add avocado or upgrade to beef.' },
      { itemKey: 'web-v1-food-entrees-quesadillas', name: 'Quesadillas', description: 'Chicken quesadillas served with sour cream, guacamole, salsa, and sliced jalapeños. Upgrade to beef.' },
    ],
  },
  {
    title: 'Seafood',
    kicker: 'Seafood favorites with bold seasoning and Katy Vibes energy.',
    items: [
      { itemKey: 'web-v1-food-seafood-deep-sea-sampler', name: 'Deep Sea Sampler', description: 'Snow crab cluster, half-pound of jumbo shrimp, corn, and potatoes.' },
      { itemKey: 'web-v1-food-seafood-the-crab-trap', name: 'The Crab Trap', description: 'Two pounds of snow crab, half-pound of shrimp, sliced andouille sausage, corn, and potatoes. Half Crab Trap and one-pound snow crab options available à la carte.' },
      { itemKey: 'web-v1-food-seafood-peel-and-eat-shrimp', name: 'Peel & Eat Shrimp', description: 'Shrimp in the shell boiled in house spices and served with corn and potatoes.', price: '1/2 lb $15 / 1 lb $25' },
      { itemKey: 'web-v1-food-seafood-seared-salmon', name: 'Seared Salmon', description: 'Tender 8 oz Atlantic salmon filet seared and served with roasted garlic mashed potatoes, broccolini, and creamy mushroom beurre blanc.' },
      { itemKey: 'web-v1-food-seafood-fried-shrimp', name: 'Fried Shrimp', description: 'Six deep-fried Gulf shrimp served on a bed of fries with coleslaw, cocktail, and tartar sauce.' },
    ],
  },
  {
    title: 'Sides',
    kicker: 'Round out the table.',
    items: [
      { itemKey: 'web-v1-food-sides-seasoned-fries', name: 'Seasoned Fries' },
      { itemKey: 'web-v1-food-sides-sweet-potato-fries', name: 'Sweet Potato Fries' },
      { itemKey: 'web-v1-food-sides-onion-rings', name: 'Onion Rings' },
      { itemKey: 'web-v1-food-sides-mac-and-cheese', name: 'Mac & Cheese', description: 'Make it truffled for an upcharge.' },
      { itemKey: 'web-v1-food-sides-roasted-garlic-mashed-potatoes', name: 'Roasted Garlic Mashed Potatoes', description: 'Make them loaded for an upcharge.' },
      { itemKey: 'web-v1-food-sides-roasted-red-potatoes', name: 'Roasted Red Potatoes' },
      { itemKey: 'web-v1-food-sides-asparagus', name: 'Asparagus' },
      { itemKey: 'web-v1-food-sides-sauteed-broccolini', name: 'Sautéed Broccolini' },
      { itemKey: 'web-v1-food-sides-spanish-rice', name: 'Spanish Rice' },
      { itemKey: 'web-v1-food-sides-white-rice', name: 'White Rice' },
      { itemKey: 'web-v1-food-sides-coleslaw', name: 'Coleslaw' },
      { itemKey: 'web-v1-food-sides-house-veggies', name: 'House Veggies' },
      { itemKey: 'web-v1-food-sides-black-beans', name: 'Black Beans' },
    ],
  },
  {
    title: 'Desserts',
    items: [
      { itemKey: 'web-v1-food-desserts-caramel-pecan-cheesecake', name: 'Caramel Pecan Cheesecake', description: 'Topped with pecans and a caramel glaze.' },
      { itemKey: 'web-v1-food-desserts-raspberry-hill', name: 'Raspberry Hill', description: 'Molten lava cake topped with raspberry sorbet and drizzled with chocolate sauce.' },
      { itemKey: 'web-v1-food-desserts-cream-caramel-flan', name: 'Cream Caramel Flan', description: 'Light and creamy flan topped with a caramel glaze.' },
    ],
  },
  {
    title: 'Happy Hour Food',
    kicker: 'Tuesday through Friday, 3 PM to 7 PM.',
    items: [
      { itemKey: 'web-v1-food-happy-hour-food-2-beef-sliders', name: '2 Beef Sliders', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-2-chicken-sliders', name: '2 Chicken Sliders', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-2-tacos', name: '2 Tacos', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-4-flautas', name: '4 Flautas', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-basket-of-french-fries', name: 'Basket of French Fries', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-5-bone-in-wings', name: '5 Bone-In Wings', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-5-boneless-wings', name: '5 Boneless Wings', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-chips-and-queso', name: 'Chips & Queso', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-4-coconut-shrimp', name: '4 Coconut Shrimp', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-crawfish-rice', name: 'Crawfish Rice', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-fried-pickles-and-peppers', name: 'Fried Pickles & Peppers', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-spinach-dip', name: 'Spinach Dip', price: '$6' },
      { itemKey: 'web-v1-food-happy-hour-food-2-salmon-sliders', name: '2 Salmon Sliders', price: '$10' },
    ],
  },
  {
    title: 'Lunch Menu',
    kicker: 'Tuesday through Sunday, 11 AM to 3 PM.',
    items: [
      { itemKey: 'web-v1-food-lunch-menu-vibe-burger', name: 'Vibe Burger', description: 'All-beef patty with house Sriracha mayo, sliced tomato, lettuce, American cheese, and an onion ring on a toasted sweet wheat sourdough bun. Vegan patty available upon request.', price: '$13' },
      { itemKey: 'web-v1-food-lunch-menu-texas-smash-burger', name: 'Texas Smash Burger', description: 'Two smashed all-beef patties with American cheese, lettuce, tomatoes, jalapeño slices, bacon, guacamole, and signature house Sriracha mayo.', price: '$15' },
      { itemKey: 'web-v1-food-lunch-menu-bone-in-wings', name: 'Bone-In Wings', price: '$0.99 / wing' },
      { itemKey: 'web-v1-food-lunch-menu-flatbread-pizza', name: 'Flatbread Pizza', price: '$5.99' },
      { itemKey: 'web-v1-food-lunch-menu-seasoned-fries', name: 'Seasoned Fries', price: '$2.99' },
      { itemKey: 'web-v1-food-lunch-menu-sweet-potato-fries', name: 'Sweet Potato Fries', price: '$2.99' },
    ],
  },
  {
    title: 'Happy Hour Drinks',
    kicker: 'Tuesday all day. Wednesday through Friday, 2 PM to 7 PM.',
    items: [
      { name: 'House Margarita', price: '$6' },
      { name: '1800 Silver / Reposado', price: '$6' },
      { name: 'Bacardi Light / Black', price: '$6' },
      { name: 'Beefeater', price: '$6' },
      { name: 'Crown Royal / Apple / Blackberry / Peach / Vanilla', price: '$6' },
      { name: 'Jack Daniels Black / Fire / Honey', price: '$6' },
      { name: "Tito's", price: '$6' },
      { name: 'House Wine', description: 'Glass $6 / Bottle $22', price: '$6 glass / $22 bottle' },
    ],
  },
];

export const drinkSections: MenuSection[] = [
  {
    title: 'Signature Cocktails',
    items: [
      { name: 'Classic Old Fashioned', description: 'Maker’s Mark bourbon and Angostura bitters.' },
      { name: 'Passion Fruit Hurricane', description: 'Malibu passion fruit rum, passion fruit juice, orange, lime, and grenadine.' },
      { name: 'Licor 43 Lemon Drop', description: 'Deep Eddy lemon vodka and Licor 43.' },
      { name: 'Strawberry-Kiwi Lemonade', description: 'Vodka, triple sec, strawberry, kiwi, and lemon.' },
      { name: 'Cucumber Martini', description: 'Cucumber vodka, triple sec, lemon, and lime.' },
      { name: 'Blackberry Martini', description: 'Tito’s, blackberry syrup, agave, and lemon.' },
      { name: 'Peach Sidecar', description: 'Hennessy, Grand Marnier, peach, and lemon.' },
      { name: 'Perfect Margarita', description: 'Patron Silver, Grand Marnier, agave, lemon, and lime.' },
    ],
  },
  {
    title: 'Specialty Shots',
    items: [
      { name: 'Green Tea', description: 'Jameson, peach schnapps, lemon, and lime.', price: '$7' },
      { name: 'Classic Mexican Candy', description: 'Tequila, watermelon, pineapple, and Tabasco.', price: '$7' },
      { name: 'Licor 43 Lemon Drop Shot', description: 'Deep Eddy lemon vodka and Licor 43.', price: '$7' },
      { name: 'Painkiller Shot', description: 'Rum, coconut cream, and pineapple.', price: '$7' },
    ],
  },
  {
    title: 'Wine',
    items: [
      { name: 'House Pinot Grigio' },
      { name: 'House Chardonnay' },
      { name: 'House Pinot Noir', price: '$7 glass / $25 bottle' },
      { name: 'House Merlot', price: '$7 glass / $25 bottle' },
      { name: 'House Cabernet Sauvignon', price: '$7 glass / $25 bottle' },
      { name: 'House Rosé', price: '$7 glass / $25 bottle' },
      { name: 'House Moscato', price: '$7 glass / $25 bottle' },
      { name: 'House Champagne', price: '$7 glass / $25 bottle' },
    ],
  },
  {
    title: 'Beer, Seltzers & Zero-Proof',
    items: [
      { name: 'Bottled Beer', description: 'Bud Light, Budweiser, Coors Light, Miller Lite, Heineken, Michelob Ultra, Shiner Bock, Corona Extra, Dos XX, Modelo, Guinness, Angry Orchard.' },
      { name: 'Draft Beer', description: 'Popular domestic drafts available in 16 oz and 25 oz pours.' },
      { name: 'Seltzers', description: 'Rotating hard seltzers and light options.' },
      { name: 'Mocktails', description: 'Zero-proof drinks for guests who want the vibe without alcohol.' },
      { name: 'Soda / Tea', description: 'Soft drinks, tea, and standard non-alcoholic options.' },
    ],
  },
];

export const specials = [
  { day: 'Tuesday', title: '$2.50 Tacos', time: 'All day', detail: '$5 Tito’s Vodka and all-day happy hour drinks.' },
  { day: 'Wednesday', title: '99¢ Wings', time: 'All day', detail: '$5, $7, and $10 whiskey selections; $8 Old Fashioneds, with premium whiskey Old Fashioneds priced $3 above the listed whiskey.' },
  { day: 'Thursday', title: '$25 10 oz Ribeye', time: 'All day', detail: '$7 43 Lemon Drop, Blackberry Martini, and Cucumber Martini.' },
  { day: 'Friday', title: '$12 Vibe Burger', time: 'All day' },
  { day: 'Saturday', title: '$40 Molcajete', time: 'All day', detail: 'No happy hour Saturday.' },
  { day: 'Sunday', title: '$15 Fried Shrimp Platter', time: 'All day', detail: 'No happy hour Sunday.' },
  { day: 'Happy Hour Food', title: '$6 food selections; 2 salmon sliders $10', time: 'Tue–Fri 3:00 PM – 7:00 PM' },
  { day: 'Happy Hour Drinks', title: '$6 liquor selections, happy hour beer, and house wine $6 glass / $22 bottle', time: 'Tuesday all day / Wed–Fri 2:00 PM – 7:00 PM' },
];

export const partyPackages = [
  'Birthdays and milestone celebrations',
  'Company parties and team outings',
  'School reunions and alumni nights',
  'Graduation parties and family gatherings',
  'Reserved tables for live music and DJ nights',
  'Private or semi-private space depending on date and guest count',
];

export const cateringHighlights = [
  'Birthday parties',
  'Holiday parties',
  'Corporate events',
  'Weddings and rehearsal gatherings',
  'Community and school events',
  'Custom trays, shareables, and crowd-friendly packages',
];

export const jobRoles = [
  'Line cooks',
  'Bussers',
  'Hosts',
  'Servers',
  'Bartenders',
  'Event support / door staff',
];
