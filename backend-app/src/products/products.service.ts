import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private products = [
    {
      id: 1,
      name: 'Classic White Tee',
      description: 'Essential cotton t-shirt in crisp white.',
      price: 150,
      category: 'Apparel',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'
    },
    {
      id: 2,
      name: 'Leather Weekend Bag',
      description: 'Premium handcrafted leather bag for your travels.',
      price: 1200,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&q=80'
    },
    {
      id: 3,
      name: 'Minimalist Watch',
      description: 'Sleek design with a genuine leather strap.',
      price: 850,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      id: 4,
      name: 'Denim Jacket',
      description: 'Timeless denim jacket with a modern fit.',
      price: 450,
      category: 'Apparel',
      imageUrl: 'https://images.unsplash.com/photo-1527010159945-6627dddf3273?w=500&q=80'
    },
    {
      id: 5,
      name: 'Suede Chelsea Boots',
      description: 'Elegant suede boots for any occasion.',
      price: 950,
      category: 'Footwear',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
    },
    {
      id: 6,
      name: 'Graphic Print Hoodie',
      description: 'Comfortable hoodie with a unique artistic print.',
      price: 350,
      category: 'Apparel',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80'
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
