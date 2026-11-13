export type CategoryId =
  | "phones" | "headphones" | "earphones" | "accessories" | "watches" | "body-care" | "clothing";

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "watches", label: "Watches", blurb: "Fossil, Invicta, Timex · Naviforce, Curren, Casio" },
  { id: "phones", label: "Phones", blurb: "Smartphones, new and ex-UK" },
  { id: "headphones", label: "Headphones", blurb: "Over-ear and on-ear, wired and wireless" },
  { id: "earphones", label: "Earphones", blurb: "Earbuds and in-ear" },
  { id: "accessories", label: "Phone Accessories", blurb: "Chargers, cables, covers and more" },
  { id: "body-care", label: "Body Care", blurb: "Lotions, serums, body wash, face masks" },
  { id: "clothing", label: "Clothing", blurb: "Everyday pieces for men and women" },
];

export const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<CategoryId, string>;

export interface Variant {
  label: string;
  price: number;
  stock: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string;
  cat: CategoryId;
  type: string;
  gender: string;
  condition: string;
  warranty: string;
  img: string;
  desc: string;
  variants: Variant[];
}

// What the public storefront is allowed to see: per-variant availability flags
// instead of exact counts and no SKU. Sold-out variants are dropped entirely.
export type StockFlag = "in" | "low";
export interface ClientVariant {
  label: string;
  price: number;
  flag: StockFlag;
}
export type ClientProduct = Omit<Product, "sku" | "variants"> & {
  variants: ClientVariant[];
  minPrice: number;
  maxPrice: number;
  lowStock: boolean;
};

export const FEW_PER_VARIANT = 2;
export const FEW_TOTAL = 3;

export function toClientProduct(p: Product): ClientProduct {
  const variants: ClientVariant[] = [];
  let total = 0;
  for (const v of p.variants) {
    if (v.stock > 0) {
      variants.push({ label: v.label, price: v.price, flag: v.stock <= FEW_PER_VARIANT ? "low" : "in" });
      total += v.stock;
    }
  }
  const prices = variants.map((v) => v.price);
  const { sku: _sku, variants: _variants, ...rest } = p;
  return {
    ...rest,
    variants,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    lowStock: total > 0 && total <= FEW_TOTAL,
  };
}

// Built-in catalogue, used until PRODUCTS_SHEET_CSV_URL points at Aaron's stock
// sheet. Imported from his WhatsApp Business catalogue (Nov 2026); photos in
// /public/catalog. price 0 = "Ask for price" (shown via money()); stock 0 =
// sold out (hidden from the shop).
const item = (
  id: number, sku: string, name: string, cat: CategoryId, price: number, desc: string,
  opt: { brand?: string; type?: string; gender?: string; stock?: number } = {}
): Product => ({
  id, sku, name, brand: opt.brand ?? "", cat, type: opt.type ?? "", gender: opt.gender ?? "Unisex",
  condition: "New", warranty: "", img: `/catalog/${sku}.jpg`, desc,
  variants: [{ label: "Standard", price, stock: opt.stock ?? 5 }],
});

export const PRODUCTS: Product[] = [
  item(1, "ai-for-everyday-people-ebook-audio", "AI FOR EVERYDAY PEOPLE EBOOK+AUDIO", "accessories", 100, "A handbook that introduces you to AI. You should be able to have conversations about AI and also use it to make your work efficient for entertainment and creativity, among other things. Artificial intelligence should be embraced and enjoyed. This book  manages to deliver on simplicity.", { brand: "", type: "Books", gender: "Unisex" }),
  item(2, "jbl-tune-500-wired-headphones", "JBL Tune 500 Wired Headphones", "headphones", 1295, "JBL through the wire. Good for quick connectivity, calls and music. Keep it simple but premium", { brand: "JBL", type: "", gender: "Unisex" }),
  item(3, "jbl-520-bt-wireless-headphones", "JBL 520 BT Wireless Headphones", "headphones", 1650, "zone out with these wireless Bluetooth headphones. over 50 hours of battery life with these premium JBL headphones 🎧", { brand: "JBL", type: "", gender: "Unisex" }),
  item(4, "jbl-tune-680nc-headphones", "JBL Tune 680NC Headphones", "headphones", 2495, "Noice cancelling JBL headphones. Play your music uninterrupted", { brand: "JBL", type: "", gender: "Unisex" }),
  item(5, "jbl-go-5", "JBL GO 5", "accessories", 2495, "Premium, portable Speakers. Dust proof waterproof and drop proof.", { brand: "JBL", type: "Speakers", gender: "Unisex" }),
  item(6, "lenovo-lp5-pro-pods", "Lenovo LP5 pro pods", "earphones", 600, "Lenovo Bluetooth earbuds. Pick your calls seamlessly.  Drown the noise and be at peace. Enjoy an emersive music experience .", { brand: "Lenovo", type: "", gender: "Unisex" }),
  item(7, "pouches-for-pods", "Pouches for pods", "accessories", 200, "Black pouches for your ear pods. Enough space to slot in your type C cable to charge", { brand: "Lenovo", type: "Cases", gender: "Unisex" }),
  item(8, "lenovo-lp5-pods", "Lenovo LP5 Pods", "earphones", 600, "The LP5 pods come with a USB C and extra buds of different sizes. These pods have a long battery life and come in black, grey and white colours. Their seemless portability and sound quality makes them appealing to every music lover", { brand: "Lenovo", type: "", gender: "Unisex" }),
  item(9, "fossil-townsman", "Fossil Townsman", "watches", 17500, "Negotiabiabe, the Automatic Fossil Timesman, is a show stopper. Self winding with Japan movement. Works without a battery", { brand: "Fossil", type: "Premium", gender: "Men" }),
  item(10, "fossil-metallic-silver", "Fossil metallic Silver", "watches", 10500, "Negotiable", { brand: "Fossil", type: "Premium", gender: "Men" }),
  item(11, "fossil-brown", "Fossil brown", "watches", 9500, "Brown authentic Fossil with genuine leather straps. A unique timepiece with Japan Movement and solid build.", { brand: "Fossil", type: "Premium", gender: "Men" }),
  item(12, "fossil-men-s-brox", "Fossil Men's brox", "watches", 0, "Matte blue dual, stainless steal. This watch comes with an automatic movement and requires no battery. Gunmetal skin to get you excited", { brand: "Fossil", type: "Premium", gender: "Men" }),
  item(13, "invicta-pro-diver-sapphire", "Invicta pro diver Sapphire", "watches", 6000, "The prodiver is water resistant to 200M. Ot continues to be a premium watch with reliable movement. The time piece  is built with  swiss inspired tradition.", { brand: "Invicta", type: "Premium", gender: "Men" }),
  item(14, "invicta-titanium", "Invicta Titanium", "watches", 0, "Swiss inspired Invicta watch with titanium. Classic movement built to last. Wear this both smart and in a more relaxed setting. New and boxed. Invicta since 1837", { brand: "Invicta", type: "Premium", gender: "Men" }),
  item(15, "invicta-pro-diver", "Invicta pro diver", "watches", 0, "Invicta is a brand established in 1837 in Switzerland before it was acquired by American owners. This heritage makes these automatic watches exotic", { brand: "Invicta", type: "Premium", gender: "Men" }),
  item(16, "timex-ufc", "Timex UFC", "watches", 6000, "Timex and UFC have come together to give us a watch that's exciting. Get a piece of the octagon, too. Built with solid leather strap and metallic face. Timex is the official time keeper of UFC", { brand: "Timex", type: "Premium", gender: "Men" }),
  item(17, "timex-ladies-timex-ladies", "Timex Ladies", "watches", 3000, "With unique straps, this watch makes an impression. Comes new and boxed", { brand: "Timex", type: "Premium", gender: "Women" }),
  item(18, "timex-ladies-watch", "Timex ladies watch", "watches", 4500, "Timex Indihlo ladies . Black leather straps coming with artistic face. This american brand maintains it's rich  American tradition", { brand: "Timex", type: "Premium", gender: "Women" }),
  item(19, "naviforce-silver-ladies-watch", "Naviforce silver ladies watch", "watches", 1200, "Quartz movement with silver metallic  straps for that  elegant look", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(20, "naviforce-ladies", "Naviforce ladies", "watches", 1500, "The Naviforce water-resistant watch for women will give you that powerful look. Be a leading female and throw the watch on both casual and smart outfits", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(21, "naviforce-purple-ladies-watch", "Naviforce Purple ladies watch", "watches", 1200, "Has stylish rubber straps. Modern look with Quartz movement", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(22, "naviforce-watch", "Naviforce watch", "watches", 1100, "Strong metallic basil. Leather straps and hard glass. Naviforce for everyone", { brand: "Naviforce", type: "Affordable", gender: "Men" }),
  item(23, "naviforce-chronograph", "Naviforce Chronograph", "watches", 1300, "These chronograph watches are built to last. With a good blend of sophistication and strong water resistant body. This is a watch you will rely on", { brand: "Naviforce", type: "Affordable", gender: "Men" }),
  item(24, "curren-blue-faced-ladies", "Curren blue faced ladies", "watches", 1100, "Rose gold with an alluring blue. Watch the hours tick away on your new acquisition with quartz movement and adjustable metal straps.", { brand: "Curren", type: "Affordable", gender: "Women" }),
  item(25, "curren-ladies-watch", "Curren ladies watch", "watches", 1300, "The curren watches come with adjustable metal straps. Versions with leather straps are also a part of the collection. These elegant watches come in rose gold and other exciting colours", { brand: "Curren", type: "Affordable", gender: "Women" }),
  item(26, "curren-white-face-curren-ladies-white", "Curren white face Curren ladies white", "watches", 1100, "A variation of the Curren watch with a white face. Simple dial to adjust the time and metallic straps that can be custom fitted. Item comes boxed", { brand: "Curren", type: "Affordable", gender: "Women" }),
  item(27, "men-s-curren-chronographs", "Men's Curren Chronographs", "watches", 1100, "Leather straps with a retro look. Pull the dial to different positions to adjust time and date. Blue , grey and tan faces are available. Leave your smart watch behind and enjoy a classic chronograph", { brand: "Curren", type: "Affordable", gender: "Men" }),
  item(28, "men-s-rustic-curren-watch", "Men's rustic Curren watch", "watches", 1100, "Chronograph with replaceable straps. The rustic brown gives this watch a vintage look. If wearing a slightly heavy watch is you thing, this is one to add to your wishlist", { brand: "Curren", type: "Affordable", gender: "Men" }),
  item(29, "hugo-boss-ladies-authentic", "Hugo Boss Ladies authentic", "watches", 0, "Hugo Boss Ladies watch metallic straps", { brand: "Hugo Boss", type: "Premium", gender: "Women" }),
  item(30, "bamboo-socks", "Bamboo socks", "clothing", 130, "Premium socks made from bamboo fibres", { brand: "", type: "Socks", gender: "Unisex" }),
  item(31, "vip-bamboo-socks", "ViP Bamboo socks", "clothing", 120, "Made from Bamboo and scented. Feel like a pro with these clean and comfortable socks", { brand: "", type: "Socks", gender: "Unisex" }),
  item(32, "bamboo-socks-2", "Bamboo Socks II", "clothing", 150, "Socks professionally made for your comfort. Go pro", { brand: "", type: "Socks", gender: "Unisex" }),
  item(33, "cheetah-chronograph", "Cheetah Chronograph", "watches", 3000, "These watches have adjustable metal straps and come with  chronograph functionality", { brand: "Cheetah", type: "Affordable", gender: "Men" }),
  item(34, "timex-ladies-gold-watch", "Timex ladies Gold watch", "watches", 5000, "Ladies Gold Timex watch. Metal bands and metallic strap. This watch is simply alluring", { brand: "Timex", type: "Premium", gender: "Women" }),
  item(35, "men-s-leather-strap", "Men's leather strap", "accessories", 950, "Gentlemen's watch. Has a glossy basel and simple centre dials with leather belts, a winning combination.", { brand: "", type: "Watch straps", gender: "Men" }),
  item(36, "naviforce-black-ladies-watch", "Naviforce black ladies watch", "watches", 1000, "", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(37, "naviforce-blue-ladies-watch", "Naviforce blue ladies watch", "watches", 1000, "Rubber straps with reliable Quartz movement. Wear on multiple outfits", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(38, "fossil-metallic-smoke-black", "Fossil metallic smoke black", "watches", 9000, "", { brand: "Fossil", type: "Premium", gender: "Unisex" }),
  item(39, "premium-cotton-socks", "Premium Cotton socks", "clothing", 150, "Made from Premium Cotton for your comfort", { brand: "", type: "Socks", gender: "Unisex" }),
  item(40, "fossil-gunsmoke", "Fossil Gunsmoke", "watches", 9500, "", { brand: "Fossil", type: "Premium", gender: "Unisex" }),
  item(41, "women-s-naviforce-watches-currently-sold-out", "Women's Naviforce watches Currently sold out.", "watches", 0, "Where elegance meets reliability. These watches come with leather straps, and their glossy colours demand attention when you walk into a room", { brand: "Naviforce", type: "Affordable", gender: "Women", stock: 0 }),
  item(42, "ice-watch", "ICE WATCH", "watches", 2500, "Has a sporty white look.  An exciting analogue watch. This watch is of Belgian origin. Strong rubber straps. Comes with stickers and key holder in an intricate watch box.", { brand: "Ice", type: "Affordable", gender: "Unisex" }),
  item(43, "adidas-watch", "ADIDAS Watch", "watches", 1950, "White digital ADIDAS watch. Reliable rubber  straps. Feel authentic", { brand: "Adidas", type: "Affordable", gender: "Unisex" }),
  item(44, "diesel-smart-watch", "Diesel smart watch", "watches", 7500, "Comes with sensors that monitor vitals. Pick up calls and respond to messages. Link with your smartphone", { brand: "Diesel", type: "Premium", gender: "Unisex" }),
  item(45, "leather-strap-cheetah", "Leather strap Cheetah", "watches", 4500, "These watches remain subtle with their black build. Their is no lose of class as it has gold arms and leather builts blending on any smart outfit.This one is built for a gentleman.", { brand: "Cheetah", type: "Affordable", gender: "Unisex" }),
  item(46, "simple-but-elegant-watch", "Simple but elegant watch", "accessories", 550, "Wear these watches without giving it too much thought. Their light feel, leather straps, and bright colours make them a no-brainer when picking outfits.", { brand: "", type: "", gender: "Unisex" }),
  item(47, "timex", "Timex", "watches", 4000, "Gold ladies Timex watch. Alluring with dark face and golden metal bands. Class", { brand: "Timex", type: "Premium", gender: "Unisex" }),
  item(48, "timex-2", "Timex II", "watches", 4500, "Metallic clasp wrist bands. Strong build from  Timex that we have come to expect from the American brand", { brand: "Timex", type: "Premium", gender: "Unisex" }),
  item(49, "naviforce-blue-face-ladies-watch", "Naviforce blue face ladies watch", "watches", 1500, "Rosegold metallic straps with shinny sides.", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(50, "naviforce-white-face-ladies-watch", "Naviforce white face ladies watch", "watches", 1500, "Rosegold with white face.", { brand: "Naviforce", type: "Affordable", gender: "Women" }),
  item(51, "carrington", "CARRINGTON", "watches", 0, "The Carrington watch company was established in London in 1780. Watches built  with regal and elegance for Queens and princesses. Starting at k2,500", { brand: "Carrington", type: "Affordable", gender: "Unisex" }),
  item(52, "smart-bracelets", "Smart bracelets", "accessories", 0, "Simple to use bracelets with a good look. Quick charge and can integrate with phone when you download linking app by scanning QR code.", { brand: "", type: "Wearables", gender: "Unisex" }),
  item(53, "timex-women-s-watch", "Timex women's watch", "watches", 0, "Another great American product going as far back as 1854. Part of our product offering in store soon.", { brand: "Timex", type: "Premium", gender: "Women" }),
];
