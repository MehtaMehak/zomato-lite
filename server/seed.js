import { db, createRestaurant, addReview } from './db.js';

// ---------------------------------------------------------------------------
// Fictional demo data for a Delhi-based discovery app.
// Restaurants, reviews and ratings are entirely fictional — none of these
// places or reviewers are real, and nothing here is affiliated with Zomato.
// ---------------------------------------------------------------------------

const RESTAURANTS = [
  {
    restaurant: {
      name: 'Varuna’s Kitchen',
      cuisine: 'Indian',
      neighbourhood: 'Connaught Place',
      address: 'M-13, Inner Circle, Connaught Place, New Delhi 110001',
      description:
        'Homestyle Indian cooking — slow-cooked curries, fluffy rotis and a changing daily thali.',
      image: '/photos/varunas.svg',
    },
    reviews: [
      { author: 'Aarav Sharma', rating: 5, comment: 'The paneer makhani is the best we’ve had in CP. Rotis arrive hot off the tawa.', createdAt: '2026-09-18 21:12:00' },
      { author: 'Meera Kapoor', rating: 4, comment: 'Great homely vibe and a generous thali. A little slow on weekends though.', createdAt: '2026-09-06 13:40:00' },
      { author: 'Kabir Mehta', rating: 5, comment: 'Dal tadka tastes just like home. Their masala chai is a bonus.', createdAt: '2026-08-22 20:05:00' },
      { author: 'Priyanka Joshi', rating: 4, comment: 'Lovely courtyard seating. Order the butter chicken and some laccha parathas.', createdAt: '2026-08-01 19:30:00' },
      { author: 'Rohan Khanna', rating: 3, comment: 'Decent food, but we waited 40 minutes on a Saturday evening.', createdAt: '2026-07-11 21:00:00' },
      { author: 'Shreya Iyer', rating: 5, comment: 'Best value meal in Connaught Place. We left very happy.', createdAt: '2026-09-14 20:45:00' },
    ],
  },
  {
    restaurant: {
      name: 'Amritsari Brothers',
      cuisine: 'North Indian',
      neighbourhood: 'Rajouri Garden',
      address: 'F-19, Central Market, Rajouri Garden, New Delhi 110027',
      description:
        'Amritsari kulchas, tandoori kebabs and lassi served with a generous dollop of ghee.',
      image: '/photos/amritsari.svg',
    },
    reviews: [
      { author: 'Harpreet Singh', rating: 5, comment: 'The kulcha chole here is worth the drive across town.', createdAt: '2026-09-19 13:15:00' },
      { author: 'Simran Kaur', rating: 5, comment: 'Tandoori chicken was smoky and juicy. Lassi thick and chilled.', createdAt: '2026-09-02 20:20:00' },
      { author: 'Vikas Malhotra', rating: 4, comment: 'Big portions, punchy spices. A bit noisy, but full of character.', createdAt: '2026-08-16 21:35:00' },
      { author: 'Neha Bansal', rating: 4, comment: 'Their makhan kulcha with extra butter — chef’s kiss.', createdAt: '2026-07-28 19:50:00' },
      { author: 'Arjun Nair', rating: 3, comment: 'Good food, but service gets slow during the evening rush.', createdAt: '2026-09-11 21:10:00' },
    ],
  },
  {
    restaurant: {
      name: 'Sichuan Smoke',
      cuisine: 'Chinese',
      neighbourhood: 'Karol Bagh',
      address: '12/7, Gaffar Market, Karol Bagh, New Delhi 110005',
      description:
        'Indo-Chinese classics — fiery chilli chicken, hakka noodles and hot-and-sour soup.',
      image: '/photos/sichuan.svg',
    },
    reviews: [
      { author: 'Tanvi Arora', rating: 5, comment: 'The burnt garlic noodles are unreal. Order extra chilli.', createdAt: '2026-09-17 21:30:00' },
      { author: 'Ishaan Gupta', rating: 4, comment: 'Chilli paneer is crisp and properly spicy. Exactly what you want.', createdAt: '2026-08-30 20:15:00' },
      { author: 'Aditi Rao', rating: 4, comment: 'Great for a rainy evening. Schezwan fried rice packs real heat.', createdAt: '2026-08-09 19:25:00' },
      { author: 'Manav Sethi', rating: 3, comment: 'Tasty, but the portions felt smaller than last time.', createdAt: '2026-07-19 22:05:00' },
      { author: 'Kiran Bedi', rating: 5, comment: 'Best Indo-Chinese in Karol Bagh, hands down.', createdAt: '2026-09-08 20:40:00' },
    ],
  },
  {
    restaurant: {
      name: 'Momo Mantra',
      cuisine: 'Momos',
      neighbourhood: 'Majnu ka Tilla',
      address: 'Tibetan Market, Majnu ka Tilla, New Delhi 110054',
      description:
        'Tibetan-style steamed and pan-fried momos with a fiery homemade chutney.',
      image: '/photos/momo.svg',
    },
    reviews: [
      { author: 'Tenzin Wangchuk', rating: 5, comment: 'Steamed chicken momos with that garlic chutney — unbeatable.', createdAt: '2026-09-20 18:30:00' },
      { author: 'Riya Batra', rating: 5, comment: 'Soup momos are comfort in a bowl. Under ₹150 for a full plate.', createdAt: '2026-09-04 19:45:00' },
      { author: 'Aakash Chaudhry', rating: 4, comment: 'Crispy pan-fried pork momos are the highlight here.', createdAt: '2026-08-19 20:10:00' },
      { author: 'Pooja Lamba', rating: 4, comment: 'Great quick snack. Gets busy after 6 pm.', createdAt: '2026-08-02 18:50:00' },
      { author: 'Dev Chand', rating: 4, comment: 'Fresh, juicy and generously filled. The chutney is dangerously good.', createdAt: '2026-07-23 19:20:00' },
      { author: 'Samaira Zafar', rating: 3, comment: 'Good momos, but the seating is cramped.', createdAt: '2026-09-13 18:15:00' },
    ],
  },
  {
    restaurant: {
      name: 'Piazolo Fire',
      cuisine: 'Pizza',
      neighbourhood: 'Greater Kailash',
      address: 'M-8, Block M, Greater Kailash II, New Delhi 110048',
      description:
        'Wood-fired Neapolitan-style pizzas with a Delhi twist — paneer tikka to crackling pepperoni.',
      image: '/photos/piazolo.svg',
    },
    reviews: [
      { author: 'Zoya Sheikh', rating: 5, comment: 'The margherita is perfect — blistery crust and a bright, punchy sauce.', createdAt: '2026-09-18 21:40:00' },
      { author: 'Nikhil Oberoi', rating: 5, comment: 'Their “Tandoori Paneer” pizza is genuine genius.', createdAt: '2026-09-01 20:55:00' },
      { author: 'Rhea Malhotra', rating: 4, comment: 'Thin crust done right. A little slow on busy nights.', createdAt: '2026-08-14 21:20:00' },
      { author: 'Karan Menon', rating: 4, comment: 'Great dessert pizza too. Save some room.', createdAt: '2026-07-30 22:10:00' },
      { author: 'Malvika Shah', rating: 3, comment: 'Nice pizza, but a bit pricey for the portion size.', createdAt: '2026-09-09 20:30:00' },
      { author: 'Yash Agarwal', rating: 5, comment: 'Best pizza in GK. The burrata one is a must-order.', createdAt: '2026-08-27 21:05:00' },
    ],
  },
  {
    restaurant: {
      name: 'Chai Kamaal',
      cuisine: 'Cafes',
      neighbourhood: 'Hauz Khas Village',
      address: 'A-6, Hauz Khas Village, New Delhi 110016',
      description:
        'Sun-drenched café serving masala chai, filter coffee and weekend brunch with a view.',
      image: '/photos/chaikamaal.svg',
    },
    reviews: [
      { author: 'Ananya Dutta', rating: 5, comment: 'Cutest café in the village. Adrak chai with a book — perfect afternoon.', createdAt: '2026-09-16 16:30:00' },
      { author: 'Isha Garg', rating: 4, comment: 'Their mishti dohi and coffee combo is a must-order.', createdAt: '2026-08-25 15:20:00' },
      { author: 'Kunal Verma', rating: 5, comment: 'Perfect study spot. Chai is strong and the vibe is calm.', createdAt: '2026-08-06 17:45:00' },
      { author: 'Megha Saxena', rating: 4, comment: 'Great brunch bowls. Gets packed on Sundays.', createdAt: '2026-07-26 12:00:00' },
      { author: 'Rahul Mistry', rating: 3, comment: 'Nice ambience, but service was slow during rush.', createdAt: '2026-09-05 14:10:00' },
    ],
  },
  {
    restaurant: {
      name: 'Dolly’s Dessert Studio',
      cuisine: 'Desserts',
      neighbourhood: 'Lajpat Nagar',
      address: 'Shop 31, Central Market, Lajpat Nagar II, New Delhi 110024',
      description:
        'Artisanal desserts — ice-cream sandwiches, mud cakes and seasonal specials.',
      image: '/photos/dollys.svg',
    },
    reviews: [
      { author: 'Shubham Tyagi', rating: 5, comment: 'The brownie sundae is dangerously good.', createdAt: '2026-09-18 22:15:00' },
      { author: 'Nandini Pillai', rating: 5, comment: 'Saffron kulfi ice-cream sandwich — pure genius.', createdAt: '2026-08-28 20:35:00' },
      { author: 'Armaan Qureshi', rating: 4, comment: 'Fresh, pretty desserts. Try the seasonal mango special.', createdAt: '2026-08-12 21:00:00' },
      { author: 'Devika Rana', rating: 4, comment: 'Perfect after-dinner spot. A little pricey, but worth it.', createdAt: '2026-07-21 20:50:00' },
      { author: 'Sameer Wadhwa', rating: 3, comment: 'Lovely desserts, but there’s no seating to enjoy them in.', createdAt: '2026-09-10 21:25:00' },
    ],
  },
  {
    restaurant: {
      name: 'The Lost Recipes',
      cuisine: 'Indian',
      neighbourhood: 'Mehrauli',
      address: '2, Qutub View, Mehrauli, New Delhi 110030',
      description:
        'Heirloom recipes from across India, recreated with local, seasonal produce.',
      image: '/photos/lostrecipes.svg',
    },
    reviews: [
      { author: 'Tushar Bhat', rating: 5, comment: 'The banana-leaf thali is an experience. Incredible curries.', createdAt: '2026-09-19 20:00:00' },
      { author: 'Farah Naqvi', rating: 5, comment: 'A tucked-away gem. Their kokum fish curry is phenomenal.', createdAt: '2026-09-03 21:15:00' },
      { author: 'Ishita Sengupta', rating: 5, comment: 'Every dish tells a story. The ragi halwa for dessert — wow.', createdAt: '2026-08-20 20:30:00' },
      { author: 'Rohit Bhardwaj', rating: 4, comment: 'Fascinating menu and an elegant space. Portions could be larger.', createdAt: '2026-08-05 19:40:00' },
      { author: 'Sneha Prasad', rating: 4, comment: 'Great for a slow, memorable dinner with friends.', createdAt: '2026-07-25 21:20:00' },
      { author: 'Anil Kapoor', rating: 3, comment: 'Interesting food, but the service was uneven.', createdAt: '2026-09-07 20:10:00' },
      { author: 'Devansh Jha', rating: 5, comment: 'The chef’s tasting of regional classics is worth every rupee.', createdAt: '2026-08-24 21:45:00' },
    ],
  },
];

const existing = db.prepare('SELECT COUNT(*) AS c FROM restaurants').get().c;
if (existing > 0) {
  console.log(`Clearing ${existing} existing restaurant(s) to load the Delhi demo set.`);
  db.exec('DELETE FROM restaurants'); // reviews cascade via foreign key
}

for (const { restaurant, reviews } of RESTAURANTS) {
  const created = createRestaurant(restaurant);
  for (const review of reviews) {
    addReview(created.id, review);
  }
  console.log(`Seeded "${created.name}" (${restaurant.cuisine}, ${restaurant.neighbourhood}) with ${reviews.length} review(s).`);
}

console.log(`Done — ${RESTAURANTS.length} fictional Delhi restaurants, ${db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c} reviews.`);
console.log('Start the app with `npm run dev`.');