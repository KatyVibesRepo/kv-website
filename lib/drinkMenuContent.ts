import type { MenuSection } from '@/lib/siteContent';

export const enhancedDrinkSections: MenuSection[] = [
  {
    title: 'Signature Cocktails',
    kicker: 'House cocktails mixed for dinner, dancing, shows, and patio nights.',
    items: [
      {
        itemKey: 'web-v1-drink-signature-cocktails-classic-old-fashioned', name: 'Classic Old Fashioned',
        description: 'Maker’s Mark bourbon and Angostura bitters.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-blackberry-martini', name: 'Blackberry Martini',
        description: "Tito’s vodka, blackberry syrup, agave, and lemon.",
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-strawberry-kiwi-lemonade', name: 'Strawberry-Kiwi Lemonade',
        description: 'Vodka, triple sec, strawberry, kiwi, and lemon.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-peach-sidecar', name: 'Peach Sidecar',
        description: 'Hennessy, Grand Marnier, peach, and lemon.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-passion-fruit-hurricane', name: 'Passion Fruit Hurricane',
        description: 'Malibu passion fruit rum, passion fruit juice, orange, lime, and grenadine.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-perfect-margarita', name: 'Perfect Margarita',
        description: 'Patrón Silver, Grand Marnier, agave, lemon, and lime.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-cucumber-martini', name: 'Cucumber Martini',
        description: 'Cucumber, triple sec, lemon, and lime.',
      },
      {
        itemKey: 'web-v1-drink-signature-cocktails-licor-43-lemon-drop', name: 'Licor 43 Lemon Drop',
        description: 'Deep Eddy lemon vodka and Licor 43.',
      },
    ],
  },
  {
    title: 'Specialty Shots',
    kicker: 'Quick favorites for the table, the toast, or the dance-floor warmup.',
    items: [
      {
        itemKey: 'web-v1-drink-specialty-shots-green-tea', name: 'Green Tea',
        price: '$7',
        description: 'Jameson, peach schnapps, lemon, and lime.',
      },
      {
        itemKey: 'web-v1-drink-specialty-shots-classic-mexican-candy', name: 'Classic Mexican Candy',
        price: '$7',
        description: 'Tequila, watermelon, pineapple, and Tabasco.',
      },
      {
        itemKey: 'web-v1-drink-specialty-shots-licor-43-lemon-drop-shot', name: 'Licor 43 Lemon Drop Shot',
        price: '$7',
        description: 'Deep Eddy lemon vodka and Licor 43.',
      },
      {
        itemKey: 'web-v1-drink-specialty-shots-painkiller-shot', name: 'Painkiller Shot',
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
        itemKey: 'web-v1-drink-beer-bottled-beer', name: 'Bottled Beer',
        description:
          'Bud Light, Budweiser, Coors Light, Miller Lite, Heineken, Michelob Ultra, Shiner Bock, Corona Extra, Dos XX, Modelo Especial, Guinness Extra Stout, and Angry Orchard. Non-alcoholic beer also available.',
      },
      {
        itemKey: 'web-v1-drink-beer-domestic-drafts', name: 'Domestic Drafts',
        price: '$6.50 / 16 oz · $8.50 / 25 oz',
        description: 'Bud Light, Coors Light, Miller Lite, and Michelob Ultra.',
      },
      {
        itemKey: 'web-v1-drink-beer-premium-drafts', name: 'Premium Drafts',
        price: '$7.50 / 16 oz · $10 / 25 oz',
        description: 'Blue Moon Belgian White, Dos XX, and Modelo Especial.',
      },
      {
        itemKey: 'web-v1-drink-beer-kona-big-wave', name: 'Kona Big Wave',
        price: '$8 / 16 oz · $10.50 / 25 oz',
        description: 'Smooth island-style draft favorite.',
      },
      {
        itemKey: 'web-v1-drink-beer-guinness', name: 'Guinness',
        price: '$9.50 / 16 oz · $12 / 25 oz',
        description: 'Classic dark draft pour.',
      },
      {
        itemKey: 'web-v1-drink-beer-stella-artois', name: 'Stella Artois',
        price: '$10 / 18 oz',
        description: 'Crisp Belgian lager.',
      },
      {
        itemKey: 'web-v1-drink-beer-ghost-in-the-machine-ipa', name: 'Ghost in the Machine IPA',
        price: '$10 / 10 oz',
        description: 'Bold IPA pour.',
      },
      {
        itemKey: 'web-v1-drink-beer-seltzers', name: 'Seltzers',
        description: 'High Noon peach and watermelon, Truly Wild Berry, and White Claw mango or black cherry.',
      },
    ],
  },
  {
    title: 'Wine',
    kicker: 'House wine by the glass or bottle where listed.',
    items: [
      {
        itemKey: 'web-v1-drink-wine-house-pinot-grigio', name: 'House Pinot Grigio',
      },
      {
        itemKey: 'web-v1-drink-wine-house-chardonnay', name: 'House Chardonnay',
      },
      {
        itemKey: 'web-v1-drink-wine-house-pinot-noir', name: 'House Pinot Noir',
        price: '$7 glass / $25 bottle',
      },
      {
        itemKey: 'web-v1-drink-wine-house-merlot', name: 'House Merlot',
        price: '$7 glass / $25 bottle',
      },
      {
        itemKey: 'web-v1-drink-wine-house-cabernet-sauvignon', name: 'House Cabernet Sauvignon',
        price: '$7 glass / $25 bottle',
      },
      {
        itemKey: 'web-v1-drink-wine-house-rose', name: 'House Rosé',
        price: '$7 glass / $25 bottle',
      },
      {
        itemKey: 'web-v1-drink-wine-house-moscato', name: 'House Moscato',
        price: '$7 glass / $25 bottle',
      },
      {
        itemKey: 'web-v1-drink-wine-house-champagne', name: 'House Champagne',
        price: '$7 glass / $25 bottle',
      },
    ],
  },
  {
    title: 'Build Your Own Margarita',
    kicker: 'Choose your tequila, upgrade the liqueur, and add your favorite flavor.',
    items: [
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-house-and-classic-tequilas', name: 'House & Classic Tequilas',
        description:
          'House Tequila, 1800 Silver, 1800 Reposado, Altos Silver, Altos Reposado, Espolòn Silver, and Hornitos Silver.',
      },
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-reposado-anejo-and-mezcal', name: 'Reposado, Añejo & Mezcal',
        description:
          'Teremana Silver, Teremana Reposado, Teremana Añejo, 1800 Añejo, Avión Silver, Avión Reposado, and Ilegal Mezcal.',
      },
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-premium-tequilas', name: 'Premium Tequilas',
        description:
          'Patrón Silver, Patrón Reposado, Patrón Añejo, Casamigos Silver, Casamigos Reposado, Casamigos Añejo, Don Julio Silver, Don Julio Añejo, Avión Reserva Cristaliño, Avión Extra Añejo 44, and Don Julio 1942.',
      },
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-upgrade-your-liqueur', name: 'Upgrade Your Liqueur',
        description: 'House Triple Sec, Cointreau, or Grand Marnier.',
      },
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-fruit-flavors', name: 'Fruit Flavors',
        price: '+$1',
        description:
          'Blackberry, blueberry, kiwi, mango, passion fruit, peach, pomegranate, raspberry, strawberry, or watermelon.',
      },
      {
        itemKey: 'web-v1-drink-build-your-own-margarita-spicy-flavor', name: 'Spicy Flavor',
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
        itemKey: 'web-v1-drink-soda-tea-tea', name: 'Tea',
        description: 'Sweet or unsweet.',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-lemonade', name: 'Lemonade',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-orange-fanta', name: 'Orange Fanta',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-powerade', name: 'Powerade',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-root-beer', name: 'Root Beer',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-coke', name: 'Coke',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-diet-coke', name: 'Diet Coke',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-dr-pepper', name: 'Dr. Pepper',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-sprite', name: 'Sprite',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-coffee', name: 'Coffee',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-hot-tea', name: 'Hot Tea',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-fiji-water', name: 'FIJI Water',
      },
      {
        itemKey: 'web-v1-drink-soda-tea-juices-and-mixers', name: 'Juices & Mixers',
        description: 'Cranberry juice, grapefruit soda, pineapple juice, and orange juice.',
      },
    ],
  },
  {
    title: 'Mocktails',
    kicker: 'Zero-proof drinks for guests who want the vibe without alcohol.',
    items: [
      {
        itemKey: 'web-v1-drink-mocktails-virgin-pina-colada', name: 'Virgin Piña Colada',
        description: 'Pineapple juice and coconut cream on the rocks.',
      },
      {
        itemKey: 'web-v1-drink-mocktails-peach-mule', name: 'Peach Mule',
        description: 'Peach purée, ginger beer, and lime.',
      },
      {
        itemKey: 'web-v1-drink-mocktails-kiss-on-the-beach', name: 'Kiss on the Beach',
        description: 'Lemon, lime, passionfruit, cranberry, and cherry juice.',
      },
      {
        itemKey: 'web-v1-drink-mocktails-strawberry-not-a-rita', name: 'Strawberry Not-a-Rita',
        description: 'Lemon, lime, and strawberry purée.',
      },
    ],
  },
];
