import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { RestaurantSchema } from './restaurants/schemas/restaurant.schema';
import { MenuItemSchema } from './menu-items/schemas/menu-item.schema';
import { OrderSchema } from './orders/schemas/order.schema';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-api';

// Pre-allocated deterministic ObjectIds (D-09: hardcoded for Postman collection consistency)
const restaurantId1 = new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa001');
const restaurantId2 = new Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa002');

const menuItemIds = {
  // Bella Napoli items
  bi1: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0001'),
  bi2: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0002'),
  bi3: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0003'),
  bi4: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0004'),
  bi5: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0005'),
  // Dragon Palace items
  di1: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0006'),
  di2: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0007'),
  di3: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0008'),
  di4: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb0009'),
  di5: new Types.ObjectId('bbbbbbbbbbbbbbbbbbbb000a'),
};

// Orders: 10 per restaurant
// Bella Napoli orders
const bellaOrderIds = [
  new Types.ObjectId('cccccccccccccccccccc0001'),
  new Types.ObjectId('cccccccccccccccccccc0002'),
  new Types.ObjectId('cccccccccccccccccccc0003'),
  new Types.ObjectId('cccccccccccccccccccc0004'),
  new Types.ObjectId('cccccccccccccccccccc0005'),
  new Types.ObjectId('cccccccccccccccccccc0006'),
  new Types.ObjectId('cccccccccccccccccccc0007'),
  new Types.ObjectId('cccccccccccccccccccc0008'),
  new Types.ObjectId('cccccccccccccccccccc0009'),
  new Types.ObjectId('cccccccccccccccccccc000a'),
];

// Dragon Palace orders
const dragonOrderIds = [
  new Types.ObjectId('cccccccccccccccccccc000b'),
  new Types.ObjectId('cccccccccccccccccccc000c'),
  new Types.ObjectId('cccccccccccccccccccc000d'),
  new Types.ObjectId('cccccccccccccccccccc000e'),
  new Types.ObjectId('cccccccccccccccccccc000f'),
  new Types.ObjectId('cccccccccccccccccccc0010'),
  new Types.ObjectId('cccccccccccccccccccc0011'),
  new Types.ObjectId('cccccccccccccccccccc0012'),
  new Types.ObjectId('cccccccccccccccccccc0013'),
  new Types.ObjectId('cccccccccccccccccccc0014'),
];

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Register models
  const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);
  const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
  const OrderModel = mongoose.model('Order', OrderSchema);

  // Idempotency: drop-and-reinsert (D-02)
  await OrderModel.deleteMany({});
  await MenuItemModel.deleteMany({});
  await RestaurantModel.deleteMany({});

  // Insert 2 restaurants
  await RestaurantModel.insertMany([
    { _id: restaurantId1, name: 'Bella Napoli' },
    { _id: restaurantId2, name: 'Dragon Palace' },
  ]);

  // Insert 10 menu items (5 per restaurant)
  await MenuItemModel.insertMany([
    // Bella Napoli — Italian cuisine (D-04)
    {
      _id: menuItemIds.bi1,
      restaurantId: restaurantId1,
      name: 'Margherita Pizza',
      price: 12.99,
      description:
        'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
    },
    {
      _id: menuItemIds.bi2,
      restaurantId: restaurantId1,
      name: 'Spaghetti Carbonara',
      price: 14.5,
      description:
        'Al dente spaghetti tossed with guanciale, eggs, Pecorino Romano, and black pepper.',
    },
    {
      _id: menuItemIds.bi3,
      restaurantId: restaurantId1,
      name: 'Bruschetta',
      price: 8.99,
      description:
        'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
    },
    {
      _id: menuItemIds.bi4,
      restaurantId: restaurantId1,
      name: 'Tiramisu',
      price: 9.5,
      description:
        'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
    },
    {
      _id: menuItemIds.bi5,
      restaurantId: restaurantId1,
      name: 'Risotto ai Funghi',
      price: 16.0,
      description:
        'Creamy Arborio rice with porcini mushrooms, white wine, and aged Parmesan.',
    },

    // Dragon Palace — Chinese/Asian cuisine (D-04)
    {
      _id: menuItemIds.di1,
      restaurantId: restaurantId2,
      name: 'Kung Pao Chicken',
      price: 13.99,
      description:
        'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
    },
    {
      _id: menuItemIds.di2,
      restaurantId: restaurantId2,
      name: 'Dim Sum Platter',
      price: 11.5,
      description:
        'Assorted steamed dumplings including har gow, siu mai, and char siu bao.',
    },
    {
      _id: menuItemIds.di3,
      restaurantId: restaurantId2,
      name: 'Peking Duck',
      price: 24.99,
      description:
        'Crispy lacquered duck served with steamed pancakes, hoisin sauce, and scallions.',
    },
    {
      _id: menuItemIds.di4,
      restaurantId: restaurantId2,
      name: 'Fried Rice',
      price: 9.99,
      description:
        'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
    },
    {
      _id: menuItemIds.di5,
      restaurantId: restaurantId2,
      name: 'Spring Rolls',
      price: 7.5,
      description:
        'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
    },
  ]);

  // Insert 20 orders (10 per restaurant) with varying items and quantities (D-06)
  // totalAmount = sum(item.price * item.quantity)
  await OrderModel.insertMany([
    // Bella Napoli orders
    {
      _id: bellaOrderIds[0],
      restaurantId: restaurantId1,
      customerName: 'Alice Johnson',
      items: [
        {
          menuItemId: menuItemIds.bi1,
          name: 'Margherita Pizza',
          price: 12.99,
          description:
            'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.bi3,
          name: 'Bruschetta',
          price: 8.99,
          description:
            'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
          quantity: 1,
        },
      ],
      totalAmount: 12.99 * 2 + 8.99 * 1, // 34.97
      status: 'Completed',
    },
    {
      _id: bellaOrderIds[1],
      restaurantId: restaurantId1,
      customerName: 'Bob Smith',
      items: [
        {
          menuItemId: menuItemIds.bi2,
          name: 'Spaghetti Carbonara',
          price: 14.5,
          description:
            'Al dente spaghetti tossed with guanciale, eggs, Pecorino Romano, and black pepper.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi4,
          name: 'Tiramisu',
          price: 9.5,
          description:
            'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
          quantity: 2,
        },
      ],
      totalAmount: 14.5 * 1 + 9.5 * 2, // 33.50
      status: 'Completed',
    },
    {
      _id: bellaOrderIds[2],
      restaurantId: restaurantId1,
      customerName: 'Carlos Rivera',
      items: [
        {
          menuItemId: menuItemIds.bi5,
          name: 'Risotto ai Funghi',
          price: 16.0,
          description:
            'Creamy Arborio rice with porcini mushrooms, white wine, and aged Parmesan.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi3,
          name: 'Bruschetta',
          price: 8.99,
          description:
            'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
          quantity: 2,
        },
      ],
      totalAmount: 16.0 * 1 + 8.99 * 2, // 33.98
      status: 'Pending',
    },
    {
      _id: bellaOrderIds[3],
      restaurantId: restaurantId1,
      customerName: 'Diana Lee',
      items: [
        {
          menuItemId: menuItemIds.bi1,
          name: 'Margherita Pizza',
          price: 12.99,
          description:
            'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi2,
          name: 'Spaghetti Carbonara',
          price: 14.5,
          description:
            'Al dente spaghetti tossed with guanciale, eggs, Pecorino Romano, and black pepper.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi4,
          name: 'Tiramisu',
          price: 9.5,
          description:
            'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
          quantity: 1,
        },
      ],
      totalAmount: 12.99 * 1 + 14.5 * 1 + 9.5 * 1, // 36.99
      status: 'Pending',
    },
    {
      _id: bellaOrderIds[4],
      restaurantId: restaurantId1,
      customerName: 'Eva Martinez',
      items: [
        {
          menuItemId: menuItemIds.bi5,
          name: 'Risotto ai Funghi',
          price: 16.0,
          description:
            'Creamy Arborio rice with porcini mushrooms, white wine, and aged Parmesan.',
          quantity: 2,
        },
      ],
      totalAmount: 16.0 * 2, // 32.00
      status: 'Completed',
    },
    {
      _id: bellaOrderIds[5],
      restaurantId: restaurantId1,
      customerName: 'Frank Chen',
      items: [
        {
          menuItemId: menuItemIds.bi1,
          name: 'Margherita Pizza',
          price: 12.99,
          description:
            'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
          quantity: 3,
        },
        {
          menuItemId: menuItemIds.bi3,
          name: 'Bruschetta',
          price: 8.99,
          description:
            'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
          quantity: 1,
        },
      ],
      totalAmount: 12.99 * 3 + 8.99 * 1, // 47.96
      status: 'Pending',
    },
    {
      _id: bellaOrderIds[6],
      restaurantId: restaurantId1,
      customerName: 'Grace Kim',
      items: [
        {
          menuItemId: menuItemIds.bi2,
          name: 'Spaghetti Carbonara',
          price: 14.5,
          description:
            'Al dente spaghetti tossed with guanciale, eggs, Pecorino Romano, and black pepper.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.bi4,
          name: 'Tiramisu',
          price: 9.5,
          description:
            'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
          quantity: 1,
        },
      ],
      totalAmount: 14.5 * 2 + 9.5 * 1, // 38.50
      status: 'Pending',
    },
    {
      _id: bellaOrderIds[7],
      restaurantId: restaurantId1,
      customerName: 'Henry Wilson',
      items: [
        {
          menuItemId: menuItemIds.bi3,
          name: 'Bruschetta',
          price: 8.99,
          description:
            'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.bi5,
          name: 'Risotto ai Funghi',
          price: 16.0,
          description:
            'Creamy Arborio rice with porcini mushrooms, white wine, and aged Parmesan.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi4,
          name: 'Tiramisu',
          price: 9.5,
          description:
            'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
          quantity: 2,
        },
      ],
      totalAmount: 8.99 * 2 + 16.0 * 1 + 9.5 * 2, // 52.98
      status: 'Completed',
    },
    {
      _id: bellaOrderIds[8],
      restaurantId: restaurantId1,
      customerName: 'Isabel Santos',
      items: [
        {
          menuItemId: menuItemIds.bi1,
          name: 'Margherita Pizza',
          price: 12.99,
          description:
            'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi5,
          name: 'Risotto ai Funghi',
          price: 16.0,
          description:
            'Creamy Arborio rice with porcini mushrooms, white wine, and aged Parmesan.',
          quantity: 1,
        },
      ],
      totalAmount: 12.99 * 1 + 16.0 * 1, // 28.99
      status: 'Pending',
    },
    {
      _id: bellaOrderIds[9],
      restaurantId: restaurantId1,
      customerName: 'James Park',
      items: [
        {
          menuItemId: menuItemIds.bi2,
          name: 'Spaghetti Carbonara',
          price: 14.5,
          description:
            'Al dente spaghetti tossed with guanciale, eggs, Pecorino Romano, and black pepper.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.bi3,
          name: 'Bruschetta',
          price: 8.99,
          description:
            'Grilled sourdough rubbed with garlic and topped with fresh tomatoes and basil.',
          quantity: 3,
        },
      ],
      totalAmount: 14.5 * 1 + 8.99 * 3, // 41.47
      status: 'Completed',
    },

    // Dragon Palace orders
    {
      _id: dragonOrderIds[0],
      restaurantId: restaurantId2,
      customerName: 'Karen Brown',
      items: [
        {
          menuItemId: menuItemIds.di1,
          name: 'Kung Pao Chicken',
          price: 13.99,
          description:
            'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.di4,
          name: 'Fried Rice',
          price: 9.99,
          description:
            'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
          quantity: 1,
        },
      ],
      totalAmount: 13.99 * 2 + 9.99 * 1, // 37.97
      status: 'Completed',
    },
    {
      _id: dragonOrderIds[1],
      restaurantId: restaurantId2,
      customerName: 'Leo Tanaka',
      items: [
        {
          menuItemId: menuItemIds.di3,
          name: 'Peking Duck',
          price: 24.99,
          description:
            'Crispy lacquered duck served with steamed pancakes, hoisin sauce, and scallions.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di5,
          name: 'Spring Rolls',
          price: 7.5,
          description:
            'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
          quantity: 2,
        },
      ],
      totalAmount: 24.99 * 1 + 7.5 * 2, // 39.99
      status: 'Pending',
    },
    {
      _id: dragonOrderIds[2],
      restaurantId: restaurantId2,
      customerName: 'Maria Gonzalez',
      items: [
        {
          menuItemId: menuItemIds.di2,
          name: 'Dim Sum Platter',
          price: 11.5,
          description:
            'Assorted steamed dumplings including har gow, siu mai, and char siu bao.',
          quantity: 3,
        },
        {
          menuItemId: menuItemIds.di4,
          name: 'Fried Rice',
          price: 9.99,
          description:
            'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
          quantity: 1,
        },
      ],
      totalAmount: 11.5 * 3 + 9.99 * 1, // 44.49
      status: 'Pending',
    },
    {
      _id: dragonOrderIds[3],
      restaurantId: restaurantId2,
      customerName: 'Nick Thompson',
      items: [
        {
          menuItemId: menuItemIds.di1,
          name: 'Kung Pao Chicken',
          price: 13.99,
          description:
            'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di2,
          name: 'Dim Sum Platter',
          price: 11.5,
          description:
            'Assorted steamed dumplings including har gow, siu mai, and char siu bao.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di5,
          name: 'Spring Rolls',
          price: 7.5,
          description:
            'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
          quantity: 2,
        },
      ],
      totalAmount: 13.99 * 1 + 11.5 * 1 + 7.5 * 2, // 40.49
      status: 'Completed',
    },
    {
      _id: dragonOrderIds[4],
      restaurantId: restaurantId2,
      customerName: 'Olivia Rossi',
      items: [
        {
          menuItemId: menuItemIds.di3,
          name: 'Peking Duck',
          price: 24.99,
          description:
            'Crispy lacquered duck served with steamed pancakes, hoisin sauce, and scallions.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di4,
          name: 'Fried Rice',
          price: 9.99,
          description:
            'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
          quantity: 2,
        },
      ],
      totalAmount: 24.99 * 1 + 9.99 * 2, // 44.97
      status: 'Pending',
    },
    {
      _id: dragonOrderIds[5],
      restaurantId: restaurantId2,
      customerName: 'Paul Anderson',
      items: [
        {
          menuItemId: menuItemIds.di5,
          name: 'Spring Rolls',
          price: 7.5,
          description:
            'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
          quantity: 3,
        },
        {
          menuItemId: menuItemIds.di1,
          name: 'Kung Pao Chicken',
          price: 13.99,
          description:
            'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
          quantity: 1,
        },
      ],
      totalAmount: 7.5 * 3 + 13.99 * 1, // 36.49
      status: 'Pending',
    },
    {
      _id: dragonOrderIds[6],
      restaurantId: restaurantId2,
      customerName: 'Quinn Murphy',
      items: [
        {
          menuItemId: menuItemIds.di2,
          name: 'Dim Sum Platter',
          price: 11.5,
          description:
            'Assorted steamed dumplings including har gow, siu mai, and char siu bao.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.di3,
          name: 'Peking Duck',
          price: 24.99,
          description:
            'Crispy lacquered duck served with steamed pancakes, hoisin sauce, and scallions.',
          quantity: 1,
        },
      ],
      totalAmount: 11.5 * 2 + 24.99 * 1, // 47.99
      status: 'Completed',
    },
    {
      _id: dragonOrderIds[7],
      restaurantId: restaurantId2,
      customerName: 'Rachel Cohen',
      items: [
        {
          menuItemId: menuItemIds.di4,
          name: 'Fried Rice',
          price: 9.99,
          description:
            'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.di5,
          name: 'Spring Rolls',
          price: 7.5,
          description:
            'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di1,
          name: 'Kung Pao Chicken',
          price: 13.99,
          description:
            'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
          quantity: 1,
        },
      ],
      totalAmount: 9.99 * 2 + 7.5 * 1 + 13.99 * 1, // 41.47
      status: 'Pending',
    },
    {
      _id: dragonOrderIds[8],
      restaurantId: restaurantId2,
      customerName: 'Sam Patel',
      items: [
        {
          menuItemId: menuItemIds.di3,
          name: 'Peking Duck',
          price: 24.99,
          description:
            'Crispy lacquered duck served with steamed pancakes, hoisin sauce, and scallions.',
          quantity: 1,
        },
        {
          menuItemId: menuItemIds.di2,
          name: 'Dim Sum Platter',
          price: 11.5,
          description:
            'Assorted steamed dumplings including har gow, siu mai, and char siu bao.',
          quantity: 1,
        },
      ],
      totalAmount: 24.99 * 1 + 11.5 * 1, // 36.49
      status: 'Completed',
    },
    {
      _id: dragonOrderIds[9],
      restaurantId: restaurantId2,
      customerName: 'Tina Nguyen',
      items: [
        {
          menuItemId: menuItemIds.di1,
          name: 'Kung Pao Chicken',
          price: 13.99,
          description:
            'Wok-tossed diced chicken with peanuts, dried chilies, and Sichuan peppercorn sauce.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.di5,
          name: 'Spring Rolls',
          price: 7.5,
          description:
            'Crispy golden rolls filled with seasoned vegetables and glass noodles.',
          quantity: 2,
        },
        {
          menuItemId: menuItemIds.di4,
          name: 'Fried Rice',
          price: 9.99,
          description:
            'Wok-fried jasmine rice with egg, vegetables, and soy-ginger glaze.',
          quantity: 1,
        },
      ],
      totalAmount: 13.99 * 2 + 7.5 * 2 + 9.99 * 1, // 52.97
      status: 'Pending',
    },
  ]);

  console.log('Seeded: 2 restaurants, 10 menu items, 20 orders');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
