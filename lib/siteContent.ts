export const katyVibesInfo = {
  name: 'Katy Vibes',
  tagline: 'Restaurant • Bar • Live Events • Community',
  phoneDisplay: '(832) 437-2807',
  phoneHref: 'tel:18324372807',
  email: 'info@katyvibes.com',
  addressLines: ['24757 Katy Freeway', 'Katy, TX 77494'],
  orderUrl: 'https://order.online/store/katy-vibes-restaurant-&-bar-katy-31147277/',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/KatyVibes' },
    { label: 'Instagram', href: 'https://www.instagram.com/katyvibes' },
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

export type MenuItem = { name: string; description?: string; price?: string; badge?: string };
export type MenuSection = { title: string; kicker?: string; items: MenuItem[] };

export const foodSections: MenuSection[] = [
  {
    title: 'Bites & Shareables',
    kicker: 'Start the table with something everyone can grab.',
    items: [
      { name: 'Coconut Shrimp', description: 'Jumbo shrimp breaded in coconut flakes and deep fried. Served with sweet chili sauce and red cabbage coleslaw.', badge: 'Guest Favorite' },
      { name: 'Spinach Dip', description: 'Served with crispy tortilla chips.' },
      { name: 'Salmon Sliders', description: 'Tender salmon filet, Sriracha mayo, spinach, tomato, and red onions served on mini brioche buns.' },
      { name: 'Party Sampler', description: 'Onion ring tower, creamy jalapeño puffs, 5 bone-in buffalo wings, cheese curds, fried pickles, and seasoned fries.' },
      { name: 'Tex-Mex Sampler', description: 'Creamy jalapeño puffs, crispy chicken flautas, loaded nachos, and chicken or beef quesadillas.' },
      { name: 'Crawfish Rice', description: 'New Orleans-style Cajun crawfish fried rice with bell peppers and onions. Add shrimp or fish for an upcharge.' },
      { name: 'Fried Rice', description: 'White rice with fried egg, onions, bell peppers, carrots, and green onions. Add beef, shrimp, or both.' },
      { name: 'Crab Stuffed Mushrooms', description: 'Beer-battered deep-fried tempura-stuffed mushrooms served with sriracha aioli and eel sauce.' },
      { name: 'Loaded Nachos', description: 'Chicken fajitas piled high with black beans, white queso, pico de gallo, guacamole, sour cream, jalapeños, and salsa. Change to beef for an upcharge.' },
      { name: 'Fried Pickles & Peppers', description: 'Deep-fried pickles, salad peppers, and jalapeño bottle caps served with Southwest ranch.' },
      { name: 'Cheese Curds', description: 'Vintage fried cheese curds served with a robust marinara. Try them spicy.' },
      { name: 'Chips & Queso', description: 'In-house queso with salsa and tortilla chips.' },
    ],
  },
  {
    title: 'Salads',
    kicker: 'Add grilled chicken, shrimp, or salmon to build it your way.',
    items: [
      { name: 'Chicken Caesar Salad', description: 'Hearts of romaine, sliced cherry tomatoes, grilled chicken, croutons, and house-made Caesar dressing.' },
      { name: 'Grilled Chicken Salad', description: 'Grilled chicken, mixed greens, tomatoes, onions, cucumbers, and croutons.' },
      { name: 'Caesar Salad', description: 'Crisp hearts of romaine, sliced cherry tomatoes, and croutons tossed in house-made Caesar dressing.' },
      { name: 'House Side Salad', description: 'Mixed greens, tomatoes, onions, cucumbers, and croutons.' },
    ],
  },
  {
    title: 'Sandwiches & Burgers',
    kicker: 'All sandwiches are served with seasoned fries. Upgrade sides and add premium toppings.',
    items: [
      { name: 'The Vibe Burger', description: 'All-beef patty with house Sriracha mayo, sliced tomato, lettuce, American cheese, and an onion ring on a toasted sweet wheat sourdough bun. Vegan patty available upon request.' },
      { name: 'Texas Smash Burger', description: 'Two smashed all-beef patties with yellow and white American cheese, lettuce, tomatoes, jalapeño slices, bacon, guacamole, and signature house Sriracha mayo on a toasted sourdough onion bun.' },
      { name: 'Club Sandwich', description: 'Turkey, bacon, ham, lettuce, Swiss cheese, tomatoes, and mayo piled high on sourdough.' },
      { name: 'Chicken Sandwich', description: 'Juicy chicken breast fried or grilled and topped with pickles, Sriracha aioli, and coleslaw. Toss in a wing sauce for an upcharge.' },
      { name: 'The Monte Cristo', description: 'Turkey, ham, Swiss cheese, and 4-berry marmalade beer-battered and crusted on Texas toast.' },
      { name: 'Philly Cheese Steak', description: 'Thin shaved steak, caramelized onions, and bell peppers topped with provolone cheese on a toasted hoagie roll.' },
    ],
  },
  {
    title: 'Wings',
    kicker: 'Served with cucumber, carrots, celery, and ranch or bleu cheese. Add fries or upgrade to parmesan truffle fries.',
    items: [
      { name: 'Bone-In Wings', description: 'Classic bone-in wings tossed in your choice of sauce or dry rub.' },
      { name: 'Boneless Wings', description: 'Boneless wings tossed your way and served with ranch or bleu cheese.' },
      { name: 'Wings Tray Special', description: '12 bone-in wings, 12 boneless wings, and seasoned fries.' },
      { name: 'Wing Sauces', description: 'Buffalo mild, medium, or hot; BBQ; Korean BBQ; Honey Garlic BBQ; General Tso; Spicy Lemon Pepper; Mango Habanero; Catastrophic; Insanity.' },
      { name: 'Dry Rubs', description: 'Lemon Pepper, BBQ, Habanero, and Garlic Parmesan.' },
      { name: 'Wing Prep Options', description: 'Naked, double fried, grilled, blackened, or all flats for an upcharge.' },
    ],
  },
  {
    title: 'Entrées',
    kicker: 'Dinner plates built for date night, groups, and celebrations.',
    items: [
      { name: 'Molcajete', description: 'A massive stone bowl filled with salsa, surrounded by jumbo shrimp, chicken and beef fajitas, onions and bell peppers, grilled jalapeños, and queso asado. Served with Spanish rice, black beans, and tortillas. Perfect for two.' },
      { name: 'Hanging Skewer', description: 'Chicken, shrimp, beef, or all three served with grilled red potatoes, broccolini, and creamy beurre blanc.' },
      { name: 'Ribeye', description: 'Ribeye served with roasted garlic mashed potatoes and broccolini. Upgrade to loaded mashed potatoes or loaded baked potato.' },
      { name: 'Lamb Chop Lollipops', description: 'Three lamb lollipops over roasted garlic mashed potatoes with demi-glace and carrots sautéed in a honey reduction. Add mint jelly or an extra lamb chop.' },
      { name: 'Fajitas', description: 'Served with Spanish rice and charro beans, plus sour cream, guacamole, salsa, and your choice of flour or corn tortillas.' },
      { name: 'Tacos', description: 'Three corn or flour tacos filled with chicken and topped with diced onions, cilantro, and queso fresco. Add avocado or upgrade to beef.' },
      { name: 'Quesadillas', description: 'Chicken quesadillas served with sour cream, guacamole, salsa, and sliced jalapeños. Upgrade to beef.' },
    ],
  },
  {
    title: 'Seafood',
    kicker: 'Seafood favorites with bold seasoning and Katy Vibes energy.',
    items: [
      { name: 'Deep Sea Sampler', description: 'Snow crab cluster, half-pound of jumbo shrimp, corn, and potatoes.' },
      { name: 'The Crab Trap', description: 'Two pounds of snow crab, half-pound of shrimp, sliced andouille sausage, corn, and potatoes. Half Crab Trap and one-pound snow crab options available à la carte.' },
      { name: 'Peel & Eat Shrimp', description: 'Shrimp in the shell boiled in house spices and served with corn and potatoes.', price: '1/2 lb $15 / 1 lb $25' },
      { name: 'Seared Salmon', description: 'Tender 8 oz Atlantic salmon filet seared and served with roasted garlic mashed potatoes, broccolini, and creamy mushroom beurre blanc.' },
      { name: 'Fried Shrimp', description: 'Six deep-fried Gulf shrimp served on a bed of fries with coleslaw, cocktail, and tartar sauce.' },
    ],
  },
  {
    title: 'Sides',
    kicker: 'Round out the table.',
    items: [
      { name: 'Seasoned Fries' },
      { name: 'Sweet Potato Fries' },
      { name: 'Onion Rings' },
      { name: 'Mac & Cheese', description: 'Make it truffled for an upcharge.' },
      { name: 'Roasted Garlic Mashed Potatoes', description: 'Make them loaded for an upcharge.' },
      { name: 'Roasted Red Potatoes' },
      { name: 'Asparagus' },
      { name: 'Sautéed Broccolini' },
      { name: 'Spanish Rice' },
      { name: 'White Rice' },
      { name: 'Coleslaw' },
      { name: 'House Veggies' },
      { name: 'Black Beans' },
    ],
  },
  {
    title: 'Desserts',
    items: [
      { name: 'Caramel Pecan Cheesecake', description: 'Topped with pecans and a caramel glaze.' },
      { name: 'Raspberry Hill', description: 'Molten lava cake topped with raspberry sorbet and drizzled with chocolate sauce.' },
      { name: 'Cream Caramel Flan', description: 'Light and creamy flan topped with a caramel glaze.' },
    ],
  },
  {
    title: 'Happy Hour Food',
    kicker: 'Tuesday through Friday, 5 PM to 7 PM.',
    items: [
      { name: 'Boneless Wings', description: 'Boneless wings in one of our house-made sauces and served with ranch or bleu cheese.' },
      { name: 'Tacos', description: 'Corn or flour tacos with chicken or beef, topped with diced onions and cilantro.' },
      { name: 'Sliders', description: 'Mini burgers with your choice of beef or chicken.' },
      { name: 'Spinach Dip', description: 'Served with your choice of crispy pita bread, naan, or tortilla chips.' },
      { name: 'Crawfish Rice', description: 'New Orleans-style Cajun crawfish fried rice with bell peppers and onions.' },
      { name: 'Fried Pickles & Peppers', description: 'Deep-fried pickles, salad peppers, and jalapeño bottle caps served with Southwest ranch.' },
      { name: 'Chips & Queso', description: 'In-house queso with salsa and tortilla chips.' },
      { name: 'Basket of Seasoned Fries', description: 'An extra-large serving of seasoned fries.' },
      { name: 'Bone-In Wings', description: 'Bone-in wings in one of our house-made sauces and served with ranch or bleu cheese.' },
      { name: 'Salmon Sliders', description: 'Tender salmon filet, Sriracha mayo, spinach, tomato, and red onions served on a mini white sourdough bun.', price: '$10 / 2 pieces' },
      { name: 'Coconut Shrimp', description: 'Jumbo shrimp breaded in coconut flakes and deep fried. Served with sweet chili sauce and red cabbage coleslaw.', price: '$10' },
    ],
  },
  {
    title: 'Lunch Menu',
    kicker: 'Tuesday through Sunday, 11 AM to 3 PM.',
    items: [
      { name: 'Vibe Burger', description: 'All-beef patty with house Sriracha mayo, sliced tomato, lettuce, American cheese, and an onion ring on a toasted sweet wheat sourdough bun. Vegan patty available upon request.', price: '$13' },
      { name: 'Texas Smash Burger', description: 'Two smashed all-beef patties with American cheese, lettuce, tomatoes, jalapeño slices, bacon, guacamole, and signature house Sriracha mayo.', price: '$15' },
      { name: 'Bone-In Wings', price: '$0.99 / wing' },
      { name: 'Flatbread Pizza', price: '$5.99' },
      { name: 'Seasoned Fries', price: '$2.99' },
      { name: 'Sweet Potato Fries', price: '$2.99' },
    ],
  },
  {
    title: 'Happy Hour Drinks',
    kicker: 'Tuesday all day. Wednesday through Friday, 5 PM to 7 PM.',
    items: [
      { name: 'House Wine', price: '$6' },
      { name: 'Frozen House Margarita', price: '$6' },
      { name: "Tito's", price: '$6' },
      { name: 'Crown', price: '$6' },
      { name: 'Jack Daniels', price: '$6' },
      { name: 'Bacardi', price: '$6' },
      { name: '1800 Tequila', description: 'Silver or Reposado.', price: '$6' },
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
  { day: 'Tuesday', title: '$5 Taco Tuesday', time: '5:00 PM – 10:00 PM' },
  { day: 'Wednesday', title: 'Whiskey & Wing Wednesdays', time: '5:00 PM – 12:00 AM', detail: '$5 whiskeys, $8 Old Fashioneds, and wing specials.' },
  { day: 'Thursday', title: 'Ribeye Night + Select Martinis', time: '5:00 PM – 11:00 PM', detail: '10 oz ribeye special and select martinis.' },
  { day: 'Friday', title: '$6 Happy Hour', time: '5:00 PM – 7:00 PM' },
  { day: 'Happy Hour Food', title: 'Bites, sliders, wings, tacos, queso, crawfish rice, and more', time: 'Tue–Fri early evening' },
  { day: 'Happy Hour Drinks', title: '$6 house wine, frozen house margarita, Tito’s, Crown, Jack Daniel’s, Bacardi, and 1800 tequila', time: 'Tuesday all day / Wed–Fri 5:00 PM – 7:00 PM' },
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
