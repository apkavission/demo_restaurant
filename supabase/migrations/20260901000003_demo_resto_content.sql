-- ===========================================================================
-- Three places to eat, from one codebase.
--
-- A fine-dining room, a neighbourhood cafe and a cloud kitchen. They share the
-- code and nothing else: different names, palettes, tone, menus, people, hours
-- and answers.
--
-- Every name, price and person is **invented**, and the reviews say on the page
-- that they are examples. Passing an invented review off as genuine is the one
-- thing a demonstration must not do.
--
-- The palettes are picked per mode. The fine-dining gold that reads as expensive
-- on near-black turns to mustard on white, so the light palette moves to a deep
-- olive-brown; the cafe’s warm terracotta needs the opposite treatment.
-- ===========================================================================

insert into demo_resto.variants
  (slug, name, industry_label, business_name, tagline, description,
   theme, contact, features, default_mode, visibility, is_default, is_active, sort_order)
values
(
  'fine-dining', 'Fine Dining', 'Fine dining',
  'Saffron & Smoke',
  'Twelve tables, one menu, every night',
  'A small dining room doing a set menu that changes with what the market has. One sitting a night, booked in advance.',
  jsonb_build_object(
    'light', jsonb_build_object(
      'accent', '#8a6d1f', 'accentFg', '#ffffff', 'accentSoft', '#f6efdc',
      'bg', '#f7f5f0', 'surface', '#ffffff', 'text', '#1a1710', 'muted', '#6b6250'),
    'dark', jsonb_build_object(
      'accent', '#e3c268', 'accentFg', '#221b06', 'accentSoft', '#2a2312',
      'bg', '#0a0906', 'surface', '#141210', 'text', '#f2ede1', 'muted', '#a89e8a'),
    'headingFont', 'Sora', 'bodyFont', 'Inter', 'radius', 'sm'
  ),
  jsonb_build_object(
    'phone', '+91 90000 22001', 'whatsapp', '+919000022001',
    'email', 'table@saffronsmoke.example', 'address', 'Fraser Road, Patna 800001',
    'hours', jsonb_build_object('weekdays', '7:00 pm – 11:00 pm', 'saturday', '7:00 pm – 11:30 pm', 'sunday', 'Closed'),
    'mapQuery', 'Fraser Road Patna'
  ),
  jsonb_build_object('bookingLabel', 'Book a table', 'showEmergency', false),
  'dark', 'public', true, true, 10
),
(
  'cafe-bakery', 'Cafe and Bakery', 'Cafe and bakery',
  'Flour & Hours',
  'Bread made the slow way',
  'A bakery and coffee room. Everything is baked here overnight, and what is gone is gone.',
  jsonb_build_object(
    'light', jsonb_build_object(
      'accent', '#b4531f', 'accentFg', '#ffffff', 'accentSoft', '#fbeee5',
      'bg', '#faf6f2', 'surface', '#ffffff', 'text', '#1f1410', 'muted', '#6f5a4e'),
    'dark', jsonb_build_object(
      'accent', '#fb923c', 'accentFg', '#2a1206', 'accentSoft', '#2c1a10',
      'bg', '#0c0806', 'surface', '#171110', 'text', '#f7ece5', 'muted', '#b3a096'),
    'headingFont', 'Sora', 'bodyFont', 'Inter', 'radius', 'xl'
  ),
  jsonb_build_object(
    'phone', '+91 90000 22002', 'whatsapp', '+919000022002',
    'email', 'hello@flourandhours.example', 'address', 'Boring Road, Patna 800001',
    'hours', jsonb_build_object('weekdays', '7:30 am – 9:00 pm', 'saturday', '7:30 am – 10:00 pm', 'sunday', '8:00 am – 6:00 pm'),
    'mapQuery', 'Boring Road Patna'
  ),
  jsonb_build_object('bookingLabel', 'Reserve a table', 'showEmergency', false),
  'light', 'public', false, true, 20
),
(
  'cloud-kitchen', 'Cloud Kitchen', 'Delivery kitchen',
  'Tiffin Line',
  'Home food, on a schedule',
  'A delivery-only kitchen running weekly tiffin plans and a short à la carte list. No dining room, no waiting.',
  jsonb_build_object(
    'light', jsonb_build_object(
      'accent', '#15803d', 'accentFg', '#ffffff', 'accentSoft', '#e6f4ea',
      'bg', '#f4f7f4', 'surface', '#ffffff', 'text', '#0d1710', 'muted', '#4f6354'),
    'dark', jsonb_build_object(
      'accent', '#4ade80', 'accentFg', '#04220f', 'accentSoft', '#0d2617',
      'bg', '#060a07', 'surface', '#101610', 'text', '#e8f3ea', 'muted', '#93a898'),
    'headingFont', 'Sora', 'bodyFont', 'Inter', 'radius', 'lg'
  ),
  jsonb_build_object(
    'phone', '+91 90000 22003', 'whatsapp', '+919000022003',
    'email', 'orders@tiffinline.example', 'address', 'Kankarbagh, Patna 800020',
    'hours', jsonb_build_object('weekdays', '11:00 am – 9:30 pm', 'saturday', '11:00 am – 9:30 pm', 'sunday', '11:00 am – 4:00 pm'),
    'mapQuery', 'Kankarbagh Patna'
  ),
  jsonb_build_object('bookingLabel', 'Start a tiffin plan', 'showEmergency', false),
  'light', 'public', false, true, 30
)
on conflict (slug) do nothing;

insert into demo_resto.nav_items (variant_id, label, href, sort_order)
select v.id, item.label, item.href, item.sort_order
from demo_resto.variants v
cross join (values
  ('Menu', '/menu', 10),
  ('Our team', '/people', 20),
  ('Reviews', '/reviews', 30),
  ('Questions', '/questions', 40),
  ('Contact', '/contact', 50)
) as item(label, href, sort_order)
on conflict (variant_id, label) do nothing;

insert into demo_resto.dishes (variant_id, slug, name, summary, description, price_label, meta_label, icon, sort_order)
select v.id, d.slug, d.name, d.summary, d.description, d.price_label, d.meta_label, d.icon, d.sort_order
from demo_resto.variants v
join (values
  ('fine-dining', 'tasting-menu', 'Seven-course tasting menu', 'The whole room eats this.', 'Seven courses built around whatever the market had that morning. Written up on the board by six, served from seven. One sitting a night.', '₹2,800 a head', 'Two hours', 'utensils', 10),
  ('fine-dining', 'vegetarian-menu', 'Vegetarian tasting menu', 'Not the same menu with things removed.', 'A separate seven courses, cooked as its own thing rather than as a substitution. Ordered when the table is booked so the kitchen can shop for it.', '₹2,400 a head', 'Two hours', 'leaf', 20),
  ('fine-dining', 'wine-pairing', 'Wine pairing', 'Five glasses, chosen for the courses.', 'Poured as each course lands, with a sentence about why. Half pours on request, and a non-alcoholic pairing that is not simply juice.', '₹1,600', 'With the menu', 'wine', 30),
  ('fine-dining', 'chefs-table', 'Chef''s table', 'Four seats at the pass.', 'Four stools facing the kitchen, the same menu with two extra courses, and the cooking happening in front of you. Booked at least a week out.', '₹3,800 a head', 'Two and a half hours', 'flame', 40),
  ('fine-dining', 'private-room', 'Private room', 'Ten to fourteen people.', 'The back room, with its own service. A set price per head agreed beforehand so there is no bill to work out at the end of an evening.', 'From ₹3,200 a head', 'Whole evening', 'door-open', 50),

  ('cafe-bakery', 'sourdough', 'Sourdough loaves', 'Started at nine, baked at five.', 'A wild-yeast starter kept going since the day we opened. Out of the oven at five in the morning, and generally gone by two in the afternoon.', '₹220', 'Daily', 'wheat', 10),
  ('cafe-bakery', 'croissants', 'Croissants and pastries', 'Laminated here, over two days.', 'Butter croissants, almond, and one thing that changes weekly. The two-day process is why they are not ready before eight.', 'From ₹90', 'From 8 am', 'croissant', 20),
  ('cafe-bakery', 'filter-coffee', 'Coffee', 'Roasted in Chikmagalur, ground here.', 'Filter, espresso and a cold brew that sits for eighteen hours. Beans change every few weeks and the current one is on the board.', 'From ₹120', 'All day', 'coffee', 30),
  ('cafe-bakery', 'breakfast', 'All-day breakfast', 'Eggs, toast, and the good butter.', 'Served until we close, because the people who want breakfast at four in the afternoon are our favourite customers.', 'From ₹180', 'All day', 'egg', 40),
  ('cafe-bakery', 'celebration-cakes', 'Celebration cakes', 'Ordered two days ahead.', 'Four sponges, three fillings, written on in chocolate if you like. Two days'' notice, and we will not do fondant.', 'From ₹1,400', '48 hours'' notice', 'cake', 50),

  ('cloud-kitchen', 'weekly-tiffin', 'Weekly tiffin plan', 'Lunch, five days, delivered.', 'Roti, sabzi, dal, rice and a salad, cooked that morning and delivered between twelve and one. The menu is published on Sunday for the week.', '₹1,750 a week', 'Mon–Fri', 'package', 10),
  ('cloud-kitchen', 'monthly-tiffin', 'Monthly tiffin plan', 'The same, cheaper, and you can skip days.', 'Twenty-two lunches with up to four skips carried forward. Skipping is done on WhatsApp before nine that morning.', '₹6,600 a month', 'Mon–Fri', 'calendar', 20),
  ('cloud-kitchen', 'dinner-thali', 'Dinner thali', 'À la carte, no plan needed.', 'A full thali cooked to order and out of the door in twenty-five minutes. Ordered up to nine, delivered up to nine-thirty.', '₹240', '25 min', 'utensils', 30),
  ('cloud-kitchen', 'bulk-orders', 'Bulk and office orders', 'Ten plates and up.', 'For an office floor or a small function. Priced per head with one dish swapped for a vegetarian one at no extra cost.', 'From ₹190 a head', 'Day''s notice', 'users', 40),
  ('cloud-kitchen', 'sunday-special', 'Sunday special', 'One dish, once a week.', 'Something that takes too long to cook on a weekday — biryani, nihari, a slow-cooked dal. Ordered by Saturday night.', '₹380', 'Sundays', 'star', 50)
) as d(variant, slug, name, summary, description, price_label, meta_label, icon, sort_order)
  on d.variant = v.slug
on conflict (variant_id, slug) do nothing;

insert into demo_resto.team (variant_id, slug, full_name, role_label, qualification, bio, years_experience, sort_order)
select v.id, t.slug, t.full_name, t.role_label, t.qualification, t.bio, t.years, t.sort_order
from demo_resto.variants v
join (values
  ('fine-dining', 'arjun-mehta', 'Arjun Mehta', 'Head chef', 'Trained in Delhi and Lyon', 'Writes the menu every morning after the market, which is why it is never printed more than a day ahead.', 18, 10),
  ('fine-dining', 'leela-fernandes', 'Leela Fernandes', 'Sommelier', 'WSET Level 3', 'Buys small and pours generously, and will talk you out of the expensive bottle if the cheaper one suits the food better.', 11, 20),
  ('fine-dining', 'rohit-kumar', 'Rohit Kumar', 'Restaurant manager', NULL, 'Runs one sitting a night on purpose: twelve tables served properly beats twenty served quickly.', 9, 30),

  ('cafe-bakery', 'sana-qureshi', 'Sana Qureshi', 'Head baker', 'Baking school, Mumbai', 'In at eleven at night, out at nine in the morning. Keeps the starter alive and is unreasonable about flour.', 12, 10),
  ('cafe-bakery', 'david-thomas', 'David Thomas', 'Coffee', 'Q Grader', 'Changes the beans every few weeks and writes what is on today on the board, with a note about what it tastes like.', 8, 20),
  ('cafe-bakery', 'priya-nair', 'Priya Nair', 'Pastry', NULL, 'Does the laminated things and the cakes, and will tell you honestly whether an order is worth the money.', 6, 30),

  ('cloud-kitchen', 'meena-devi', 'Meena Devi', 'Head cook', NULL, 'Cooks the way a home kitchen does — less oil than a restaurant, and the same dal her family eats.', 22, 10),
  ('cloud-kitchen', 'akash-raj', 'Akash Raj', 'Kitchen manager', 'Food safety certified', 'Runs the timings so that food leaves hot and arrives hot, which is most of what a delivery kitchen is.', 7, 20),
  ('cloud-kitchen', 'sunita-kumari', 'Sunita Kumari', 'Menu planning', NULL, 'Writes Sunday''s menu for the week so nobody eats the same thing twice, and answers the WhatsApp line herself.', 10, 30)
) as t(variant, slug, full_name, role_label, qualification, bio, years, sort_order)
  on t.variant = v.slug
on conflict (variant_id, slug) do nothing;

insert into demo_resto.testimonials (variant_id, author, role_label, quote, rating, sort_order)
select v.id, t.author, t.role_label, t.quote, t.rating, t.sort_order
from demo_resto.variants v
join (values
  ('fine-dining', 'Sample review', 'Anniversary dinner', 'Seven courses and not one of them was there to fill space. The sommelier talked us down to a cheaper bottle and was right.', 5, 10),
  ('fine-dining', 'Sample review', 'Chef''s table', 'Sitting at the pass ruins ordinary restaurants for you. Worth it once, at least.', 5, 20),
  ('fine-dining', 'Sample review', 'Private room', 'Fourteen of us, one price agreed beforehand, no bill to argue about at midnight.', 4, 30),

  ('cafe-bakery', 'Sample review', 'Regular', 'I have been buying the same loaf every Saturday for a year. It has never once been different.', 5, 10),
  ('cafe-bakery', 'Sample review', 'Birthday cake', 'Ordered on Wednesday, collected on Friday, and it looked like the picture rather than like a picture.', 5, 20),
  ('cafe-bakery', 'Sample review', 'Coffee', 'They wrote what the beans taste like on a board instead of using the word "notes". I bought a bag.', 4, 30),

  ('cloud-kitchen', 'Sample review', 'Monthly plan', 'Four skips a month is what makes it work. Every other tiffin I tried charged me for food I did not eat.', 5, 10),
  ('cloud-kitchen', 'Sample review', 'Office order', 'Twelve plates, on time, and the vegetarian swap did not cost extra or arrive as an afterthought.', 5, 20),
  ('cloud-kitchen', 'Sample review', 'Sunday special', 'The biryani is the reason I keep the number saved.', 5, 30)
) as t(variant, author, role_label, quote, rating, sort_order)
  on t.variant = v.slug;

insert into demo_resto.faqs (variant_id, question, answer, sort_order)
select v.id, f.question, f.answer, f.sort_order
from demo_resto.variants v
join (values
  ('fine-dining', 'Can I see the menu before booking?', 'Not in advance — it is written each morning after the market. Tell us about allergies when you book and the kitchen works around them.', 10),
  ('fine-dining', 'Do you take walk-ins?', 'Rarely. Twelve tables, one sitting, so almost everything is booked. Ring after six and we will tell you honestly.', 20),
  ('fine-dining', 'Is there a dress code?', 'No. Come as you are; the food is the formal part.', 30),
  ('fine-dining', 'Can you cater for allergies?', 'Yes, told at booking rather than on arrival — the menu is bought for that morning and cannot be rebuilt at seven.', 40),

  ('cafe-bakery', 'What time is the bread out?', 'Loaves from about five thirty, pastries from eight. Saturday sells out earliest — usually by one.', 10),
  ('cafe-bakery', 'Can I reserve a loaf?', 'Yes, ring the day before and we will keep it back until noon.', 20),
  ('cafe-bakery', 'Do you have vegan things?', 'Some, and they are marked. The croissants are not and never will be.', 30),
  ('cafe-bakery', 'Do you do wholesale?', 'For a few cafes nearby. Ring and ask — it depends on what the ovens can take that week.', 40),

  ('cloud-kitchen', 'Is there a delivery charge?', 'Not within five kilometres on a plan. À la carte orders are ₹30 flat.', 10),
  ('cloud-kitchen', 'How do I skip a day?', 'A message before nine that morning. Skipped days roll to the end of the plan rather than being refunded.', 20),
  ('cloud-kitchen', 'Can I change the menu?', 'The weekly plan is fixed so the kitchen can shop properly. À la carte is cooked to order.', 30),
  ('cloud-kitchen', 'Do you deliver on Sundays?', 'Only the Sunday special, and only if it was ordered by Saturday night.', 40)
) as f(variant, question, answer, sort_order)
  on f.variant = v.slug;
