import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private products = [
    {
      id: 1,
      name: 'Chronograph Classic',
      description: 'Multi-function chronograph with stainless steel bracelet and date display.',
      price: 1850,
      category: 'Watches',
      imageUrl: '/82283.jpg'
    },
    {
      id: 2,
      name: 'Automatic Blue Dial',
      description: 'Automatic movement with exhibition caseback and blue sunburst dial.',
      price: 2200,
      category: 'Watches',
      imageUrl: '/85276.png'
    },
    {
      id: 3,
      name: 'Minimalist Three-Hand',
      description: 'Clean three-hand design with leather strap and silver dial.',
      price: 1450,
      category: 'Watches',
      imageUrl: '/86507.jpg'
    },
    {
      id: 4,
      name: 'Gold-Tone Chronograph',
      description: 'Rose gold accents with black dial and genuine leather strap.',
      price: 2100,
      category: 'Watches',
      imageUrl: '/89129.jpg'
    },
    {
      id: 5,
      name: 'Sport Chronograph',
      description: 'Rugged chronograph with tachymeter bezel and silicone strap.',
      price: 1750,
      category: 'Watches',
      imageUrl: '/93627.jpg'
    },
    {
      id: 6,
      name: 'Automatic Open Heart',
      description: 'Open-heart movement display with silver dial and mesh bracelet.',
      price: 2400,
      category: 'Watches',
      imageUrl: '/94089.png'
    },
    {
      id: 7,
      name: 'Vintage-Inspired',
      description: 'Retro design with domed crystal and leather strap.',
      price: 1650,
      category: 'Watches',
      imageUrl: '/94092.jpg'
    },
    {
      id: 8,
      name: 'Two-Tone Classic',
      description: 'Stainless steel and gold-tone bracelet with champagne dial.',
      price: 1950,
      category: 'Watches',
      imageUrl: '/96586.jpg'
    },
    {
      id: 9,
      name: 'Skeleton Automatic',
      description: 'Skeleton dial revealing the automatic movement within.',
      price: 2600,
      category: 'Watches',
      imageUrl: '/96587.png'
    },
    {
      id: 10,
      name: 'Black Dial Chronograph',
      description: 'Bold black dial with rose gold accents and leather strap.',
      price: 2050,
      category: 'Watches',
      imageUrl: '/97310.jpg'
    },
    {
      id: 11,
      name: 'Silver Dress Watch',
      description: 'Elegant silver dial with minimalist markers and leather strap.',
      price: 1550,
      category: 'Watches',
      imageUrl: '/97810.jpg'
    },
    {
      id: 12,
      name: 'Blue Sunburst',
      description: 'Vibrant blue sunburst dial with stainless steel bracelet.',
      price: 1900,
      category: 'Watches',
      imageUrl: '/107082.jpg'
    },
    {
      id: 13,
      name: 'Green Dial Sport',
      description: 'Military-inspired green dial with canvas strap.',
      price: 1700,
      category: 'Watches',
      imageUrl: '/107100.jpg'
    },
    {
      id: 14,
      name: 'Rose Gold Classic',
      description: 'Rose gold case with brown leather strap and date function.',
      price: 2300,
      category: 'Watches',
      imageUrl: '/107107.jpg'
    },
    {
      id: 15,
      name: 'Black Steel Chronograph',
      description: 'Black PVD steel with chronograph functions and rubber strap.',
      price: 2150,
      category: 'Watches',
      imageUrl: '/107108.jpg'
    },
    {
      id: 16,
      name: 'White Dial Automatic',
      description: 'Clean white dial with automatic movement and steel bracelet.',
      price: 2000,
      category: 'Watches',
      imageUrl: '/108563.jpg'
    },
    {
      id: 17,
      name: 'Moonphase Complication',
      description: 'Elegant moonphase complication with date display.',
      price: 2800,
      category: 'Watches',
      imageUrl: '/111061.jpg'
    },
    {
      id: 18,
      name: 'Titanium Sport',
      description: 'Lightweight titanium case with chronograph and diver bezel.',
      price: 2500,
      category: 'Watches',
      imageUrl: '/111325.webp'
    },
    {
      id: 19,
      name: 'Leather Strap Classic',
      description: 'Timeless design with brown leather strap and silver dial.',
      price: 1600,
      category: 'Watches',
      imageUrl: '/58514.webp'
    },
    {
      id: 20,
      name: 'Gold-Plated Dress',
      description: 'Gold-plated case with champagne dial and dress styling.',
      price: 2250,
      category: 'Watches',
      imageUrl: '/73679.jpg'
    }
  ];

  findAll(): any[] {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }
}
