import type { MenuSection } from '@/lib/siteContent';

export const enhancedDrinkSections: MenuSection[] = [
  {
    title: 'Signature Cocktails',
    kicker: 'House cocktails mixed for dinner, dancing, shows, and patio nights.',
    items: [
      {
        name: 'Classic Old Fashioned',
        description: 'Maker’s Mark bourbon and Angostura bitters.',
      },
      {
        name: 'Blackberry Martini',
        description: "Tito’s vodka, blackberry syrup, agave, and lemon.",
      },
      {
        name: 'Strawberry-Kiwi Lemonade',
        description: 'Vodka, triple sec, strawberry, kiwi, and lemon.',
      },
      {
        name: 'Peach Sidecar',
        description: 'Hennessy, Grand Marnier, peach, and lemon.',
      },
      {
        name: 'Passion Fruit Hurricane',
        description: 'Malibu passion fruit rum, passion fruit juice, orange, lime, and grenadine.',
      },
      {
        name: 'Perfect Margarita',
        description: 'Patrón Silver, Grand Marnier, agave, lemon, and lime.',
      },
      {
        name: 'Cucumber Martini',
        description: 'Cucumber, triple sec, lemon, and lime.',
      },
      {
        name: 'Licor 43 Lemon Drop',
        description: 'Deep Eddy lemon vodka and Licor 43.',
      },
    ],
  },
  {
    title: 'Specialty Shots',
    kicker: 'Quick favorites for the table, the toast, or the dance-floor warmup.',
    items: [
      {
        name: 'Green Tea',
        price: '$7',
        description: 'Jameson, peach schnapps, lemon, and lime.',
      },
      {
        name: 'Classic Mexican Candy',
        price: '$7',
        description: 'Tequila, watermelon, pineapple, and Tabasco.',
      },
      {
        name: 'Licor 43 Lemon Drop Shot',
        price: '$7',
        description: 'Deep Eddy lemon vodka and Licor 43.',
      },
      {
        name: 'Painkiller Shot',
        price: '$7',
        description: 'Rum, coconut cream, and pineapple.',
      },
    ],
  },
  {
    title: 'Beer',
    kicker: 'Bottled favorites, draft pours, cider, imports, and bigger pours.',
    items: [
      {
        name: 'Bottled Beer',
        description:
          'Bud Light, Budweiser, Coors Light, Miller Lite, Heineken, Michelob Ultra, Shiner Bock, Corona Extra, Dos XX, Modelo Especial, Guinness Extra Stout, and Angry Orchard. Non-alcoholic beer also available.',
      },
      {
        name: 'Domestic Drafts',
        price: '$6.50 / 16 oz · $8.50 / 25 oz',
        description: 'Bud Light, Coors Light, Miller Lite, and Michelob Ultra.',
      },
      {
        name: 'Premium Drafts',
        price: '$7.50 / 16 oz · $10 / 25 oz',
        description: 'Blue Moon Belgian White, Dos XX, and Modelo Especial.',
      },
      {
        name: 'Kona Big Wave',
        price: '$8 / 16 oz · $10.50 / 25 oz',
        description: 'Smooth island-style draft favorite.',
      },
      {
        name: 'Guinness',
        price: '$9.50 / 16 oz · $12 / 25 oz',
        description: 'Classic dark draft pour.',
      },
      {
        name: 'Stella Artois',
        price: '$10 / 18 oz',
        description: 'Crisp Belgian lager.',
      },
      {
        name: 'Ghost in the Machine IPA',
        price: '$10 / 10 oz',
        description: 'Bold IPA pour.',
      },
      {
        name: 'Seltzers',
        description: 'High Noon peach and watermelon, Truly Wild Berry, and White Claw mango or black cherry.',
      },
    ],
  },
  {
    title: 'Wine',
    kicker: 'House wine by the glass or bottle where listed.',
    items: [
      {
        name: 'House Pinot Grigio',
      },
      {
        name: 'House Chardonnay',
      },
      {
        name: 'House Pinot Noir',
        price: '$7 glass / $25 bottle',
      },
      {
        name: 'House Merlot',
        price: '$7 glass / $25 bottle',
      },
      {
        name: 'House Cabernet Sauvignon',
        price: '$7 glass / $25 bottle',
      },
      {
        name: 'House Rosé',
        price: '$7 glass / $25 bottle',
      },
      {
        name: 'House Moscato',
        price: '$7 glass / $25 bottle',
      },
      {
        name: 'House Champagne',
        price: '$7 glass / $25 bottle',
      },
    ],
  },
  {
    title: 'Build Your Own Margarita',
    kicker: 'Choose your tequila, upgrade the liqueur, and add your favorite flavor.',
    items: [
      {
        name: 'House & Classic Tequilas',
        description:
          'House Tequila, 1800 Silver, 1800 Reposado, Altos Silver, Altos Reposado, Espolòn Silver, and Hornitos Silver.',
      },
      {
        name: 'Reposado, Añejo & Mezcal',
        description:
          'Teremana Silver, Teremana Reposado, Teremana Añejo, 1800 Añejo, Avión Silver, Avión Reposado, and Ilegal Mezcal.',
      },
      {
        name: 'Premium Tequilas',
        description:
          'Patrón Silver, Patrón Reposado, Patrón Añejo, Casamigos Silver, Casamigos Reposado, Casamigos Añejo, Don Julio Silver, Don Julio Añejo, Avión Reserva Cristaliño, Avión Extra Añejo 44, and Don Julio 1942.',
      },
      {
        name: 'Upgrade Your Liqueur',
        description: 'House Triple Sec, Cointreau +$1, or Grand Marnier +$1.',
      },
      {
        name: 'Fruit Flavors',
        price: '+$1',
        description:
          'Blackberry, blueberry, kiwi, mango, passion fruit, peach, pomegranate, raspberry, strawberry, or watermelon.',
      },
      {
        name: 'Spicy Flavor',
        price: '+$1',
        description: 'Add jalapeño for a spicy margarita kick.',
      },
    ],
  },
  {
    title: 'Soda / Tea',
    kicker: 'Soft drinks, tea, coffee, water, and juice options.',
    items: [
      {
        name: 'Tea',
        description: 'Sweet or unsweet.',
      },
      {
        name: 'Lemonade',
      },
      {
        name: 'Orange Fanta',
      },
      {
        name: 'Powerade',
      },
      {
        name: 'Root Beer',
      },
      {
        name: 'Coke',
      },
      {
        name: 'Diet Coke',
      },
      {
        name: 'Dr. Pepper',
      },
      {
        name: 'Sprite',
      },
      {
        name: 'Coffee',
      },
      {
        name: 'Hot Tea',
      },
      {
        name: 'FIJI Water',
      },
      {
        name: 'Juices & Mixers',
        description: 'Cranberry juice, grapefruit soda, pineapple juice, and orange juice.',
      },
    ],
  },
  {
    title: 'Mocktails',
    kicker: 'Zero-proof drinks for guests who want the vibe without alcohol.',
    items: [
      {
        name: 'Virgin Piña Colada',
        description: 'Pineapple juice and coconut cream on the rocks.',
      },
      {
        name: 'Peach Mule',
        description: 'Peach purée, ginger beer, and lime.',
      },
      {
        name: 'Kiss on the Beach',
        description: 'Lemon, lime, passionfruit, cranberry, and cherry juice.',
      },
      {
        name: 'Strawberry Not-a-Rita',
        description: 'Lemon, lime, and strawberry purée.',
      },
    ],
  },
];
