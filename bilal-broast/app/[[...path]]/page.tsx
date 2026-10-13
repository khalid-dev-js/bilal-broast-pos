"use client";

import Image from "next/image";
import Link from "next/link";
import broastSandwichImage from "@/assets/IMG-20261007-WA0040.jpg";
import chickenAndFriesImage from "@/assets/IMG-20261007-WA0041.jpg";
import burgerImage from "@/assets/IMG-20261007-WA0042.jpg";
import broastPlatterImage from "@/assets/IMG-20261007-WA0043.jpg";
import shawarmaImage from "@/assets/IMG-20261007-WA0044.jpg";
import grilledChickenImage from "@/assets/IMG-20261007-WA0045.jpg";
import muttonPlatterImage from "@/assets/IMG-20261007-WA0046.jpg";
import broastDrumstickImage from "@/assets/IMG-20261007-WA0047.jpg";
import hunterBeefTinsImage from "@/assets/IMG-20261007-WA0048.jpg";
import pressedHunterBeefSpicyImage from "@/assets/IMG-20261007-WA0049.jpg";
import pressedHunterBeefImage from "@/assets/IMG-20261007-WA0050.jpg";
import hunterBeefImage from "@/assets/IMG-20261007-WA0051.jpg";
import hunterChickenImage from "@/assets/IMG-20261007-WA0052.jpg";
import hunterChickenSaltAndPepperImage from "@/assets/IMG-20261007-WA0053.jpg";
import hunterChickenSaltAndPepperProductImage from "@/assets/IMG-20261007-WA0054.jpg";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crosshair,
  Filter,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Music2,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  categories,
  formatPrice,
  getProduct,
  mockOrders,
  popularProducts,
  products,
  relatedProducts,
  restaurant,
  type CartLine,
  type Order,
  type Product,
} from "@/lib/data";
import { api } from "@/lib/api/client";

const BRAND = "#922f27";

const homeCategoryImages: Record<string, typeof broastPlatterImage> = {
  broast: broastPlatterImage,
  burgers: burgerImage,
  chicken: chickenAndFriesImage,
  fries: chickenAndFriesImage,
  deals: broastSandwichImage,
  drinks: shawarmaImage,
  meat: hunterBeefTinsImage,
  mutton: muttonPlatterImage,
  shawarma: shawarmaImage,
};

const homeProductImages = [
  broastSandwichImage,
  chickenAndFriesImage,
  burgerImage,
  broastPlatterImage,
  shawarmaImage,
  grilledChickenImage,
  muttonPlatterImage,
  broastDrumstickImage,
  hunterBeefTinsImage,
  pressedHunterBeefSpicyImage,
  pressedHunterBeefImage,
  hunterBeefImage,
  hunterChickenImage,
  hunterChickenSaltAndPepperImage,
  hunterChickenSaltAndPepperProductImage,
];

function getHomeCategoryImage(category: string) {
  return (
    homeCategoryImages[category.trim().toLowerCase()] ||
    broastPlatterImage
  );
}

function getHomeProductImage(product: Product, index: number) {
  const name = product.name.toLowerCase();
  if (name.includes("hunter chicken") && name.includes("salt")) {
    return hunterChickenSaltAndPepperProductImage;
  }
  if (name.includes("hunter chicken")) return hunterChickenImage;
  if (name.includes("smoke hunter beef")) return pressedHunterBeefSpicyImage;
  if (name.includes("hunter beef")) return hunterBeefImage;
  const categoryImage = homeCategoryImages[product.category.trim().toLowerCase()];
  return categoryImage || homeProductImages[index % homeProductImages.length];
}

type SessionUser = { role?: string } | null;

let sessionUserRequest: Promise<SessionUser> | null = null;

function getSessionUser() {
  if (!sessionUserRequest) {
    sessionUserRequest = api
      .get<any>("/auth/me")
      .then((response) => {
        const user = response?.user || response?.data?.user || response?.data || response;
        return user?.id || user?._id || user?.email ? user : null;
      })
      .catch(() => null);
  }
  return sessionUserRequest;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand-logo ${light ? "brand-logo-light" : ""}`}
      aria-label="Bilal Broast home"
    >
      <Image
        src="/bilal-broast-brand.png"
        alt="Bilal Broast"
        width={160}
        height={106}
        className="brand-logo-image"
      />
    </Link>
  );
}

function Navbar({
  cartCount,
  onCart,
}: {
  cartCount: number;
  onCart: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!target.parentElement?.closest(".site-header")) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.body.classList.toggle("mobile-menu-open", open);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.classList.remove("mobile-menu-open");
    };
  }, [open]);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ role?: string } | null>(null);
  useEffect(() => {
    if (!sessionUserRequest && pathname !== "/") return;
    let active = true;
    getSessionUser().then((currentUser) => {
      if (active) setUser(currentUser);
    });
    return () => {
      active = false;
    };
  }, [pathname]);
  async function logout() {
    await api.post("/auth/logout").catch(() => undefined);
    sessionUserRequest = Promise.resolve(null);
    setUser(null);
    window.location.href = "/login";
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-wrap">
        <Logo />
        <nav
          className={`desktop-nav ${open ? "mobile-open" : ""}`}
          aria-label="Mobile navigation"
        >
          <Link
            href="/"
            className={pathname === "/" ? "is-active" : ""}
            aria-current={pathname === "/" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/menu"
            className={pathname.startsWith("/menu") ? "is-active" : ""}
            aria-current={pathname.startsWith("/menu") ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Menu
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "is-active" : ""}
            aria-current={pathname === "/about" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Our Story
          </Link>
          <Link
            href="/contact"
            className={pathname === "/contact" ? "is-active" : ""}
            aria-current={pathname === "/contact" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/order-history"
            className={pathname === "/order-history" ? "is-active" : ""}
            aria-current={pathname === "/order-history" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Order history
          </Link>
        </nav>
        <div className="nav-actions">
          {user?.role === "admin" ? (
            <>
              <Link
                href="/dashboard"
                className="dashboard-nav-icon"
                aria-label="Open admin dashboard"
                title="Dashboard"
              >
                <LayoutDashboard size={18} strokeWidth={2.2} />
                <span className="sr-only">Dashboard</span>
              </Link>
              <button
                className="logout-nav-button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} strokeWidth={2.1} />
                <span className="sr-only">Logout</span>
              </button>
            </>
          ) : user ? (
            <button
              className="logout-nav-button"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} strokeWidth={2.1} />
              <span className="sr-only">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="account-link"
              aria-label="Login to your account"
              title="Login"
            >
              <UserRound size={19} />
              <span className="sr-only">Login</span>
            </Link>
          )}
          <button
            className="cart-link"
            onClick={() => {
              setOpen(false);
              onCart();
            }}
            aria-label={`Open cart with ${cartCount} items`}
          >
            <ShoppingBag size={20} />
            <span>{cartCount}</span>
          </button>
          <Link href="/menu" className="button button-primary nav-order">
            Order now <ArrowRight size={16} />
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Logo light />
          <p className="footer-copy">
            The crunch you crave, the flavor you remember. Proudly serving
            Karachi since 1998.
          </p>
          <div className="socials">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Camera size={15} strokeWidth={1.8} />
            </a>
            <a
              href="https://www.facebook.com/"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <Users size={15} strokeWidth={1.8} />
            </a>
            <a
              href="https://www.tiktok.com/"
              aria-label="TikTok"
              target="_blank"
              rel="noreferrer"
            >
              <Music2 size={15} strokeWidth={1.8} />
            </a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <Link href="/menu">Our Menu</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/order-history">Live orders</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <h4>Visit us</h4>
          <p>{restaurant.address}</p>
          <p>{restaurant.phone}</p>
          <p>{restaurant.hours}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 Bilal Broast. Made with care in Karachi.</span>
        <span>Fresh food. Fast service.</span>
      </div>
    </footer>
  );
}

function ProductCard({
  product,
  onAdd,
  canAdd,
}: {
  product: Product;
  onAdd: (p: Product, quantity?: number) => void;
  canAdd?: () => boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  return (
    <article className="product-card menu-product-card">
      <div className="product-image">
        <Link
          href={`/menu/${product.slug}`}
          aria-label={`View ${product.name} details`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 50vw, 280px"
          />
        </Link>
        {product.isDeal && <span className="badge">Best seller</span>}
        <button
          className={`product-heart ${liked ? "is-liked" : ""}`}
          onClick={() => setLiked(!liked)}
          aria-label={`${liked ? "Remove" : "Add"} ${product.name} from favorites`}
        >
          <span>♡</span>
        </button>
        <span className="product-rating">
          <Star size={11} fill="currentColor" /> 4.8 <b>★</b>
        </span>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link href={`/menu/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="product-price-line">
          <strong>{formatPrice(product.price)}</strong>
          {product.originalPrice && (
            <del>{formatPrice(product.originalPrice)}</del>
          )}
        </div>
        <div className="product-actions">
          <div className="quantity compact-quantity">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <strong>{quantity}</strong>
            <button
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            className="add-button add-button-wide"
            onClick={() =>
              (canAdd ? canAdd() : true) && onAdd(product, quantity)
            }
          >
            <ShoppingBag size={15} /> Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function Home({ onAdd }: { onAdd: (p: Product) => void }) {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1800&q=90",
      kicker: "Signature broast",
      title: (
        <>
          Crispy. Hot.
          <br />
          <i>Unforgettable.</i>
        </>
      ),
      copy: "Freshly prepared broast with bold Pakistani flavor.",
      cta: "Order now",
    },
    {
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1800&q=90",
      kicker: "BB burgers",
      title: (
        <>
          Built for serious
          <br />
          <i>cravings.</i>
        </>
      ),
      copy: "Golden crunch, toasted buns, and all the right layers.",
      cta: "Order burgers",
    },
    {
      image:
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1800&q=90",
      kicker: "Family feast",
      title: (
        <>
          Bring the whole <i>gang.</i>
        </>
      ),
      copy: "A generous spread made for sharing around the table.",
      cta: "View family deals",
    },
    {
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1800&q=90",
      kicker: "Loaded favourites",
      title: (
        <>
          Your cravings.
          <br />
          Our <i>specialty.</i>
        </>
      ),
      copy: "The sides, sauces, and crunch that complete the feast.",
      cta: "Explore menu",
    },
  ];
  const galleryItems = [
    { name: "Crispy Broast Platter", href: "/menu", image: broastPlatterImage },
    {
      name: products[1].name,
      href: `/menu/${products[1].slug}`,
      image: burgerImage,
    },
    {
      name: "Chicken Fillet with Fries",
      href: "/menu",
      image: chickenAndFriesImage,
    },
    { name: "Shawarma", href: "/menu", image: shawarmaImage },
    {
      name: "Grilled Chicken Platter",
      href: "/menu",
      image: grilledChickenImage,
    },
    {
      name: "Mutton Platter",
      href: "/menu",
      image: muttonPlatterImage,
    },
  ];
  const [active, setActive] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProductsLoading, setFeaturedProductsLoading] = useState(true);
  const [featuredProductsError, setFeaturedProductsError] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);
  useEffect(() => {
    let isCurrent = true;
    api
      .get<any>("/products?page=1&limit=100")
      .then((response) => {
        const items = Array.isArray(response)
          ? response
          : response?.products ||
            response?.items ||
            response?.results ||
            response?.data?.products;
        if (!Array.isArray(items)) {
          throw new Error("Menu products response is invalid");
        }
        const seenCategories = new Set<string>();
        const highlights = items
          .map(normalizeProduct)
          .filter((product) => {
            const category = product.category.trim().toLowerCase();
            if (!category || seenCategories.has(category)) return false;
            seenCategories.add(category);
            return true;
          })
          .slice(0, 3);
        if (isCurrent) setFeaturedProducts(highlights);
      })
      .catch((error) => {
        console.error("Unable to load homepage menu highlights", error);
        if (isCurrent) setFeaturedProductsError(true);
      })
      .finally(() => {
        if (isCurrent) setFeaturedProductsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);
  const slide = slides[active];
  return (
    <>
      <main className="brand-home">
        <section className="cinema-hero" aria-label="Bilal Broast highlights">
          {slides.map((item, index) => (
            <div
              className={`cinema-slide ${index === active ? "is-active" : ""}`}
              key={item.kicker}
            >
              <Image
                src={item.image}
                alt={item.kicker}
                fill
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="cinema-overlay" />
          <div className="cinema-content">
            <span className="hero-kicker">
              Bilal Broast <b>/</b> {slide.kicker}
            </span>
            <h1>{slide.title}</h1>
            <p>{slide.copy}</p>
            <div className="hero-buttons">
              <Link href="/menu" className="button button-accent">
                {slide.cta} <ArrowRight size={17} />
              </Link>
              <Link href="/menu" className="hero-text-link">
                Explore menu <ChevronRight size={17} />
              </Link>
            </div>
          </div>
          <div className="hero-offer">
            <span>BB</span>
            <strong>
              Best
              <br />
              seller
            </strong>
          </div>
          <div className="hero-controls">
            <div className="hero-progress">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={index === active ? "active" : ""}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span />
                </button>
              ))}
            </div>
            <small>
              0{active + 1} / 0{slides.length}
            </small>
          </div>
        </section>
        <section className="home-section craving-section">
          <div className="home-heading">
            <div>
              <span className="eyebrow">Choose your mood</span>
              <h2>
                What are you <i>craving?</i>
              </h2>
            </div>
            <p>
              From the first crunch to the last sip, pick your kind of
              delicious.
            </p>
          </div>
          <div className="craving-grid">
            {categories.map((category, index) => (
              <Link
                href={`/menu?category=${category.name}`}
                className={`craving-card craving-${index + 1}`}
                key={category.name}
              >
                <Image
                  src={getHomeCategoryImage(category.name)}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 75vw, 32vw"
                />
                <div>
                  <span>{category.name}</span>
                  <ArrowRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="home-section favorites-section">
          <div className="home-heading">
            <div>
              <span className="eyebrow">The crowd pleasers</span>
              <h2>
                Made for cravings
                <br />
                <i>that come back.</i>
              </h2>
            </div>
            <Link href="/menu" className="text-link">
              See the full menu <ArrowRight size={16} />
            </Link>
          </div>
          <div className="favorite-grid">
            {featuredProductsLoading ? (
              <p role="status">Loading menu highlights...</p>
            ) : featuredProductsError ? (
              <p role="alert">Menu highlights could not be loaded right now.</p>
            ) : featuredProducts.length ? (
              featuredProducts.map((product, index) => (
                <ProductCard
                  product={{
                    ...product,
                    image: getHomeProductImage(product, index),
                  }}
                  onAdd={onAdd}
                  key={product.id}
                />
              ))
            ) : (
              <p>No menu products are available right now.</p>
            )}
          </div>
        </section>
        <section className="campaign campaign-feast">
          <div className="campaign-copy">
            <span className="eyebrow cream">Family feast</span>
            <h2>
              Bring the
              <br />
              <i>whole gang.</i>
            </h2>
            <p>8 PC Chicken �� 2 Burgers · Fries · Drinks</p>
            <Link href="/menu/family-feast" className="button button-light">
              Get the feast <ArrowRight size={16} />
            </Link>
          </div>
          <div className="campaign-photo">
            <Image
              src={broastPlatterImage}
              alt="Family feast with chicken and sides"
              fill
              sizes="55vw"
            />
          </div>
          <span className="campaign-price">
            {formatPrice(products[3].price)}
            <small>family box</small>
          </span>
        </section>
        <section className="home-section story-editorial">
          <div className="story-visual">
            <Image
              src={grilledChickenImage}
              alt="Fresh chicken prepared for the grill"
              fill
              sizes="45vw"
            />
            <span className="story-number">01</span>
          </div>
          <div className="story-editorial-copy">
            <span className="eyebrow">Made fresh. Served hot.</span>
            <h2>
              Big flavor
              <br />
              <i>starts here.</i>
            </h2>
            <p>
              Bilal Broast is built around a simple idea: fresh food, bold
              flavor, and a table worth gathering around. No fuss. Just the
              crunch you came for.
            </p>
            <Link href="/about" className="text-link">
              Read our story <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="late-night">
          <div>
            <span className="eyebrow cream">When the craving hits</span>
            <h2>
              Late night
              <br />
              <i>cravings.</i>
            </h2>
            <p>Still hungry? We are still cooking.</p>
            <Link href="/menu" className="button button-accent">
              Order something delicious <ArrowRight size={16} />
            </Link>
          </div>
          <Image
            src={broastDrumstickImage}
            alt="Crispy chicken wings"
            fill
            sizes="55vw"
          />
        </section>
        <section className="home-section gallery-section">
          <div className="home-heading">
            <div>
              <span className="eyebrow">Straight from the kitchen</span>
              <h2>
                A taste of
                <br />
                <i>Bilal Broast.</i>
              </h2>
            </div>
            <p>Fresh from the kitchen. Straight to your cravings.</p>
          </div>
          <div className="food-gallery">
            {galleryItems.map((item, index) => (
              <Link
                href={item.href}
                className={`gallery-tile tile-${index + 1}`}
                key={item.name}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 30vw"
                />
                <span>
                  {item.name} <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="values-strip">
          <span className="eyebrow cream">Why Bilal Broast?</span>
          <div>
            <strong>Fresh ingredients</strong>
            <strong>Crispy preparation</strong>
            <strong>Fast service</strong>
            <strong>Quality food</strong>
          </div>
        </section>
        <section className="closing-cta home-closing">
          <Image
            src={products[1].image}
            alt="Bilal Broast burger"
            fill
            sizes="100vw"
          />
          <div>
            <span className="eyebrow cream">Your table is waiting</span>
            <h2>
              Hungry <i>yet?</i>
            </h2>
            <p>Make tonight delicious.</p>
            <Link href="/menu" className="button button-light">
              Order now <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function LegacyHome({ onAdd }: { onAdd: (p: Product) => void }) {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow cream">Since 1998 · Karachi</span>
            <h1>
              Good food.
              <br />
              <i>Good mood.</i>
            </h1>
            <p>
              Big, bold Pakistani flavor made fresh to order. Your next craving
              starts right here.
            </p>
            <div className="hero-buttons">
              <Link href="/menu" className="button button-light">
                Explore menu <ArrowRight size={17} />
              </Link>
              <Link href="/about" className="text-link light-link">
                Our story <ChevronRight />
              </Link>
            </div>
            <div className="hero-note">
              <span className="avatar-stack">
                <span>AK</span>
                <span>HM</span>
                <span>+2k</span>
              </span>
              <span>Loved across Karachi, one bite at a time.</span>
            </div>
          </div>
          <div className="hero-photo">
            <Image
              src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1600&q=90"
              alt="Crispy broast chicken with fries"
              fill
              priority
              sizes="60vw"
            />
          </div>
          <div className="hero-stamp">
            <span>100%</span>
            <small>
              fresh
              <br />& crispy
            </small>
          </div>
        </section>
        <section className="section category-section">
          <SectionTitle
            eyebrow="What are you craving?"
            title="Find your favorite"
            copy="From our kitchen to your table — always hot, always satisfying."
          />
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                href={`/menu?category=${category.name}`}
                className="category-card"
                key={category.name}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="200px"
                />
                <div className="category-shade" />
                <span>{category.name}</span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
        <section className="section best-section">
          <SectionTitle
            eyebrow="The crowd pleasers"
            title="Best sellers"
            copy="Our most-loved bites, picked by people who know good food."
            action={
              <Link href="/menu" className="text-link">
                View full menu <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="product-grid">
            {popularProducts.map((product) => (
              <ProductCard product={product} onAdd={onAdd} key={product.id} />
            ))}
          </div>
        </section>
        <section className="story-banner">
          <div className="story-photo">
            <Image
              src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1200&q=85"
              alt="Grilled chicken being prepared"
              fill
              sizes="50vw"
            />
          </div>
          <div className="story-copy">
            <span className="eyebrow">Why Bilal Broast?</span>
            <h2>
              Made fresh.
              <br />
              <i>Made properly.</i>
            </h2>
            <p>
              We do not cut corners. Every piece is seasoned, marinated and
              cooked with the kind of care that turns a meal into a memory.
            </p>
            <div className="feature-list">
              <span>
                <Check size={15} /> Fresh ingredients
              </span>
              <span>
                <Check size={15} /> Secret spice blends
              </span>
              <span>
                <Check size={15} /> Fast, friendly service
              </span>
            </div>
            <Link href="/about" className="button button-dark">
              Our story <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="section deal-section">
          <div className="deal-card">
            <div>
              <span className="eyebrow cream">The sharing special</span>
              <h2>
                Bring the
                <br />
                <i>whole gang.</i>
              </h2>
              <p>Family Feast · 8 pc chicken, 2 burgers, fries & drinks.</p>
              <Link href="/menu/family-feast" className="button button-light">
                Get the feast <ArrowRight size={16} />
              </Link>
            </div>
            <div className="deal-image">
              <Image
                src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85"
                alt="Family meal spread"
                fill
                sizes="40vw"
              />
            </div>
          </div>
        </section>
        <section className="closing-cta">
          <span className="eyebrow">Hungry yet?</span>
          <h2>
            Your table is
            <br />
            <i>waiting.</i>
          </h2>
          <Link href="/menu" className="button button-light">
            Order something delicious <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </>
  );
}

function normalizeProduct(item: any): Product {
  const category =
    typeof item.category === "object" ? item.category?.name : item.category;
  return {
    ...item,
    id: item._id || item.id,
    slug: item.slug || item._id || item.id,
    category: category || "Other",
    image:
      item.image || item.imageUrl || item.images?.[0] || "/placeholder.svg",
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
  };
}

/*
function MenuPage({ onAdd, canAdd }: { onAdd: (p: Product) => void; canAdd?: () => boolean }) { const [search, setSearch] = useState(''); const [category, setCategory] = useState('All'); const [sort, setSort] = useState('Recommended'); const [filterOpen, setFilterOpen] = useState(false); const [price, setPrice] = useState(2500); const [menuProducts, setMenuProducts] = useState(products); useEffect(() => { api.get<any>('/products?page=1&limit=100').then((response) => { const items = Array.isArray(response) ? response : response?.products || response?.items || response?.results || response?.data?.products; if (Array.isArray(items)) setMenuProducts(items.map(normalizeProduct)) }).catch(() => undefined) }, []); const filtered = useMemo(() => { const result = menuProducts.filter((p) => (category === 'All' || p.category === category) && p.price <= price && `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())); return [...result].sort((a, b) => sort === 'Price: Low to High' ? a.price - b.price : sort === 'Price: High to Low' ? b.price - a.price : sort === 'Most Popular' ? Number(b.isPopular) - Number(a.isPopular) : 0) }, [category, menuProducts, price, search, sort]); const categoryCount = (name: string) => name === 'All' ? menuProducts.length : menuProducts.filter((p) => p.category === name).length; const filters = <div className="menu-filter-content"><div className="filter-group category-filter-group"><div className="filter-heading"><div><span className="filter-label">Browse menu</span><small>Find your favorite</small></div><span className="filter-count">{filtered.length}</span></div><div className="category-options">{['All', ...categories.map((c) => c.name)].map((item) => <button key={item} className={`filter-option ${category === item ? 'active' : ''}`} onClick={() => { setCategory(item); setFilterOpen(false) }}><span className="filter-option-icon">{item === 'All' ? '✦' : item.slice(0, 1)}</span><span>{item}</span><small>{categoryCount(item)}</small></button>)}</div></div><div className="filter-group"><div className="filter-label-row"><span className="filter-label">Price range</span><strong>{formatPrice(price)}</strong></div><input className="price-range" type="range" min="200" max="2500" step="50" value={price} onChange={(e) => setPrice(Number(e.target.value))} /><div className="range-labels"><span>Rs. 200</span><span>Rs. 2500</span></div></div><div className="filter-group"><label className="filter-label" htmlFor="sort-menu">Sort by</label><select id="sort-menu" className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}><option>Recommended</option><option>Most Popular</option><option>Newest</option><option>Price: Low to High</option><option>Price: High to Low</option></select></div><div className="quick-filter"><input id="best-sellers" type="checkbox" /><label htmlFor="best-sellers">Best sellers</label><input id="deals-only" type="checkbox" /><label htmlFor="deals-only">Deals</label></div></div>; return <main className="page-main menu-page"><section className="menu-hero"><div><span className="eyebrow cream">Our menu</span><h1>Made for<br /><i>cravings.</i></h1><p>Big, bold Pakistani flavour for every kind of hungry.</p></div><Image src={products[3].image} alt="Bilal Broast family feast" fill sizes="100vw" /></section><div className="menu-search-row"><label className="search-box menu-search"><Search size={20} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your favorite food..." aria-label="Search your favorite food" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={17} /></button>}</label><button className="mobile-filter-button" onClick={() => setFilterOpen(true)}><Filter size={16} /> Filter & sort</button></div><div className="menu-layout"><aside className="menu-sidebar"><div className="filter-kicker">Filter the feast</div>{filters}</aside><section className="menu-results"><div className="menu-category-nav">{['All', ...categories.map((c) => c.name)].map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="menu-result"><span><strong>{filtered.length}</strong> delicious choices</span><span className="fresh-note"><span /> Freshly prepared</span></div>{filtered.length > 0 ? <div className="product-grid menu-grid">{filtered.map((product) => <ProductCard product={product} onAdd={onAdd} canAdd={canAdd} key={product.id} />)}</div> : <div className="empty-state"><Search size={30} /><h3>No bites found</h3><p>Try another search or browse all categories.</p><button className="button button-primary" onClick={() => { setSearch(''); setCategory('All') }}>Reset filters</button></div>}<section className="menu-promo"><div><span className="eyebrow cream">Weekend box</span><h2>Crispy chicken.<br /><i>Big cravings.</i></h2><p>2 pc chicken, zinger burger, fries and a drink.</p><Link href="/menu/weekend-box" className="button button-light">Order the box <ArrowRight size={16} /></Link></div><Image src={products[7].image} alt="Weekend box" fill sizes="50vw" /></section></section></div>{filterOpen && <div className="filter-sheet-backdrop" onClick={() => setFilterOpen(false)}><aside className="filter-sheet" onClick={(e) => e.stopPropagation()}><div className="sheet-head"><strong>Filter the feast</strong><button onClick={() => setFilterOpen(false)} aria-label="Close filters"><X size={19} /></button></div>{filters}</aside></div>}</main> }
*/
function MenuPage({
  onAdd,
  canAdd,
}: {
  onAdd: (p: Product) => void;
  canAdd?: () => boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [filterOpen, setFilterOpen] = useState(false);
  const [price, setPrice] = useState(2500);
  const [menuProducts, setMenuProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<any>("/products?page=1&limit=100")
      .then((response) => {
        const items = Array.isArray(response)
          ? response
          : response?.products ||
            response?.items ||
            response?.results ||
            response?.data?.products;
        setMenuProducts(
          Array.isArray(items) ? items.map(normalizeProduct) : [],
        );
      })
      .catch(() => setMenuProducts([]))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => {
    const result = menuProducts.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.price <= price &&
        `${p.name} ${p.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    return [...result].sort((a, b) =>
      sort === "Price: Low to High"
        ? a.price - b.price
        : sort === "Price: High to Low"
          ? b.price - a.price
          : sort === "Most Popular"
            ? Number(b.isPopular) - Number(a.isPopular)
            : 0,
    );
  }, [category, menuProducts, price, search, sort]);
  const categoryCount = (name: string) =>
    name === "All"
      ? menuProducts.length
      : menuProducts.filter((p) => p.category === name).length;
  const filters = (
    <div className="menu-filter-content">
      <div className="filter-group category-filter-group">
        <div className="filter-heading">
          <div>
            <span className="filter-label">Browse menu</span>
            <small>Find your favorite</small>
          </div>
          <span className="filter-count">{filtered.length}</span>
        </div>
        <div className="category-options">
          {["All", ...categories.map((c) => c.name)].map((item) => (
            <button
              key={item}
              className={`filter-option ${category === item ? "active" : ""}`}
              onClick={() => {
                setCategory(item);
                setFilterOpen(false);
              }}
            >
              <span className="filter-option-icon">
                {item === "All" ? "✦" : item.slice(0, 1)}
              </span>
              <span>{item}</span>
              <small>{categoryCount(item)}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label-row">
          <span className="filter-label">Price range</span>
          <strong>{formatPrice(price)}</strong>
        </div>
        <input
          className="price-range"
          type="range"
          min="200"
          max="2500"
          step="50"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>Rs. 200</span>
          <span>Rs. 2500</span>
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-label" htmlFor="sort-menu">
          Sort by
        </label>
        <select
          id="sort-menu"
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Recommended</option>
          <option>Most Popular</option>
          <option>Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
      <div className="quick-filter">
        <input id="best-sellers" type="checkbox" />
        <label htmlFor="best-sellers">Best sellers</label>
        <input id="deals-only" type="checkbox" />
        <label htmlFor="deals-only">Deals</label>
      </div>
    </div>
  );
  return (
    <main className="page-main menu-page">
      <section className="menu-hero">
        <div>
          <span className="eyebrow cream">Our menu</span>
          <h1>
            Made for
            <br />
            <i>cravings.</i>
          </h1>
          <p>Big, bold Pakistani flavour for every kind of hungry.</p>
        </div>
        <Image
          src={products[3].image}
          alt="Bilal Broast family feast"
          fill
          sizes="100vw"
        />
      </section>
      <div className="menu-search-row">
        <label className="search-box menu-search">
          <Search size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your favorite food..."
            aria-label="Search your favorite food"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </label>
        <button
          className="mobile-filter-button"
          onClick={() => setFilterOpen(true)}
        >
          <Filter size={16} /> Filter & sort
        </button>
      </div>
      <div className="menu-layout">
        <aside className="menu-sidebar">
          <div className="filter-kicker">Filter the feast</div>
          {filters}
        </aside>
        <section className="menu-results">
          <div className="menu-category-nav">
            {["All", ...categories.map((c) => c.name)].map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="menu-result">
            <span>
              <strong>{filtered.length}</strong> delicious choices
            </span>
            <span className="fresh-note">
              <span /> Freshly prepared
            </span>
          </div>
          {loading ? (
            <div className="empty-state">
              <p>Loading menu...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="product-grid menu-grid">
              {filtered.map((product) => (
                <ProductCard
                  product={product}
                  onAdd={onAdd}
                  canAdd={canAdd}
                  key={product.id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h3>No bites found</h3>
              <p>Try another search or browse all categories.</p>
              <button
                className="button button-primary"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
          <section className="menu-promo">
            <div>
              <span className="eyebrow cream">Weekend box</span>
              <h2>
                Crispy chicken.
                <br />
                <i>Big cravings.</i>
              </h2>
              <p>2 pc chicken, zinger burger, fries and a drink.</p>
              <Link href="/menu/weekend-box" className="button button-light">
                Order the box <ArrowRight size={16} />
              </Link>
            </div>
            <Image
              src={products[7].image}
              alt="Weekend box"
              fill
              sizes="50vw"
            />
          </section>
        </section>
      </div>
      {filterOpen && (
        <div
          className="filter-sheet-backdrop"
          onClick={() => setFilterOpen(false)}
        >
          <aside className="filter-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <strong>Filter the feast</strong>
              <button
                onClick={() => setFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={19} />
              </button>
            </div>
            {filters}
          </aside>
        </div>
      )}
    </main>
  );
}

function DynamicProductPage({
  slug,
  onAdd,
  canAdd,
}: {
  slug: string;
  onAdd: (p: Product, qty?: number) => void;
  canAdd?: () => boolean;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<any>(`/products/${encodeURIComponent(slug)}`)
      .then((response) => {
        const item = response?.product || response?.data || response;
        setProduct(item?.name ? normalizeProduct(item) : null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading)
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <div className="history-spinner" />
          <p>Loading product...</p>
        </div>
      </main>
    );
  if (!product)
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <span className="eyebrow">Menu item unavailable</span>
          <h1>Product not found.</h1>
          <Link href="/menu" className="button button-primary">
            Back to menu
          </Link>
        </div>
      </main>
    );
  return <ProductPage product={product} onAdd={onAdd} canAdd={canAdd} />;
}

function ProductPage({
  product,
  onAdd,
  canAdd,
}: {
  product: Product;
  onAdd: (p: Product, qty?: number) => void;
  canAdd?: () => boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <main className="page-main product-detail">
      <Link href="/menu" className="back-link">
        <ChevronLeft size={16} /> Back to menu
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="55vw"
          />
          {product.isDeal && <span className="badge">Limited deal</span>}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span>
              <Star size={15} fill="currentColor" /> 4.9
            </span>{" "}
            · 120+ happy orders
          </div>
          <div className="detail-price">
            {formatPrice(product.price)}{" "}
            {product.originalPrice && (
              <del>{formatPrice(product.originalPrice)}</del>
            )}
          </div>
          <p className="detail-description">
            {product.description} Prepared fresh in our kitchen with generous
            portions and the unmistakable Bilal Broast crunch.
          </p>
          <h4>What&apos;s inside</h4>
          <div className="ingredient-list">
            {product.ingredients.map((item) => (
              <span key={item}>
                <Check size={14} /> {item}
              </span>
            ))}
          </div>
          <div className="quantity-line">
            <span>Quantity</span>
            <div className="quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={15} />
              </button>
              <strong>{quantity}</strong>
              <button onClick={() => setQuantity(quantity + 1)}>
                <Plus size={15} />
              </button>
            </div>
          </div>
          <div className="detail-actions">
            <button
              className="button button-primary"
              onClick={() =>
                (canAdd ? canAdd() : true) && onAdd(product, quantity)
              }
            >
              Add to cart <ShoppingBag size={17} />
            </button>
            <Link
              href={`/checkout?product=${product.slug}&quantity=${quantity}`}
              className="button button-outline"
            >
              Order now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <section className="related section">
        <SectionTitle
          eyebrow="You may also like"
          title="Keep the feast going"
        />
        <div className="product-grid">
          {relatedProducts(product).map((item) => (
            <ProductCard key={item.id} product={item} onAdd={onAdd} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CartPage({
  cart,
  updateCart,
  onRemove,
}: {
  cart: CartLine[];
  updateCart: (id: string, d: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <main className="page-main">
      <div className="page-intro compact">
        <span className="eyebrow">Your order</span>
        <h1>
          Your <i>cart.</i>
        </h1>
      </div>
      {!cart.length ? (
        <div className="empty-state cart-empty">
          <ShoppingBag size={36} />
          <h3>Your cart is waiting</h3>
          <p>Add something delicious and it will show up here.</p>
          <Link href="/menu" className="button button-primary">
            Browse menu <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.map((item) => (
              <div className="cart-line" key={item.id}>
                <div className="cart-thumb">
                  <Image src={item.image} alt={item.name} fill sizes="90px" />
                </div>
                <div className="cart-line-copy">
                  <span>{item.category}</span>
                  <h3>{item.name}</h3>
                  <strong>{formatPrice(item.price)}</strong>
                </div>
                <div className="quantity">
                  <button onClick={() => updateCart(item.id, -1)}>
                    <Minus size={14} />
                  </button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => updateCart(item.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  className="remove-button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            <Link href="/menu" className="back-link continue">
              <ChevronLeft size={16} /> Continue browsing
            </Link>
          </div>
          <OrderSummary
            subtotal={subtotal}
            cart={cart}
            updateCart={updateCart}
          />
        </div>
      )}
    </main>
  );
}

function OrderSummary({
  subtotal,
  cart = [],
  checkout = false,
  updateCart,
}: {
  subtotal: number;
  cart?: CartLine[];
  checkout?: boolean;
  updateCart?: (id: string, delta: number) => void;
}) {
  const delivery = subtotal >= 1500 ? 0 : 150;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <aside className={`order-summary ${checkout ? "checkout-summary" : ""}`}>
      <div className="summary-heading">
        <div>
          <span className="eyebrow">Fresh from our kitchen</span>
          <h3>Your order</h3>
        </div>
        <span className="summary-count">
          <ShoppingBag size={15} /> {itemCount}{" "}
          {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      {cart.length > 0 ? (
        <div className="summary-items">
          {cart.map((item) => (
            <div className="summary-item" key={item.id}>
              <div className="summary-item-thumb">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="64px" />
                ) : (
                  <ShoppingBag size={20} />
                )}
              </div>
              <div className="summary-item-info">
                <strong className="summary-item-name">{item.name}</strong>
                <span className="summary-item-price">
                  {formatPrice(item.price)} each
                </span>
                  <div className="summary-item-bottom">
                    {updateCart ? (
                      <div className="summary-quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1 && updateCart(item.id, -1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={12} />
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => updateCart(item.id, 1)}
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <strong>{item.quantity} item</strong>
                    )}
                  <strong className="summary-item-total">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="summary-empty">
          <ShoppingBag size={22} />
          <strong>Your cart is empty</strong>
          <span>Add something delicious from our menu.</span>
          {!checkout && (
            <Link href="/menu" className="text-link">
              Browse menu <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
      <div className="summary-prices">
        <div>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div>
          <span>Delivery fee</span>
          <span>{delivery ? formatPrice(delivery) : "Free"}</span>
        </div>
        <div className="summary-total">
          <strong>Grand total</strong>
          <strong>{formatPrice(subtotal + delivery)}</strong>
        </div>
      </div>
      {checkout && <p className="summary-reassurance"><Check size={14} /> Your order will be prepared fresh after confirmation.</p>}
      {!checkout && cart.length > 0 && (
        <Link href="/checkout" className="button button-primary full-button">
          Proceed to checkout <ArrowRight size={16} />
        </Link>
      )}
    </aside>
  );
}

function DynamicCheckoutPage({
  slug,
  quantity,
  cart,
  clearCart,
  updateCart,
}: {
  slug: string;
  quantity: number;
  cart: CartLine[];
  clearCart: () => void;
  updateCart: (id: string, delta: number) => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get<any>(`/products/${encodeURIComponent(slug)}`)
      .then((response) => {
        const item = response?.product || response?.data || response;
        setProduct(item?.name ? normalizeProduct(item) : null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);
  if (loading)
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <div className="history-spinner" />
          <p>Loading checkout...</p>
        </div>
      </main>
    );
  if (!product)
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <span className="eyebrow">Product unavailable</span>
          <h1>We couldn&apos;t load this item.</h1>
          <Link href="/menu" className="button button-primary">
            Back to menu
          </Link>
        </div>
      </main>
    );
  return (
    <CheckoutPage
      cart={cart}
      clearCart={clearCart}
      singleItem={{ ...product, quantity }}
      updateCart={updateCart}
    />
  );
}

function CheckoutPage({
  cart,
  clearCart,
  singleItem,
  updateCart,
}: {
  cart: CartLine[];
  clearCart: () => void;
  singleItem?: CartLine;
  updateCart: (id: string, delta: number) => void;
}) {
  const [placed, setPlaced] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"" | "cod" | "online">("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");
  const [deliverySummary, setDeliverySummary] = useState("");
  const checkoutItems = singleItem ? [singleItem] : cart;
  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
  if (placed)
    return (
      <main className="page-main confirmation">
        <div className="success-icon">
          <Check size={28} />
        </div>
        <span className="eyebrow">Thank you for choosing us</span>
        <h1>
          Order <i>confirmed.</i>
        </h1>
        <p className="confirm-lead">
          Your order is on its way to our kitchen. We&apos;ll have it with you
          in around 35–45 minutes.
        </p>
        <div className="confirm-card">
          <div>
            <span>Order number</span>
            <strong>{orderNumber || "Your order"}</strong>
          </div>
          <div>
            <span>Delivering to</span>
            <strong>{deliverySummary}</strong>
          </div>
          <div>
            <span>Order total</span>
            <strong>
              {formatPrice(subtotal + (subtotal >= 1500 ? 0 : 150))}
            </strong>
          </div>
        </div>
        <Link href="/order-history" className="button button-primary">
          Track your order <ArrowRight size={16} />
        </Link>
      </main>
    );
  return (
    <main className="page-main checkout-page-main">
      <header className="checkout-header">
        <nav className="checkout-breadcrumb" aria-label="Checkout breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <Link href="/cart">Cart</Link>
          <ChevronRight size={13} />
          <span>Checkout</span>
        </nav>
        <span className="eyebrow">Bilal Broast · Freshly prepared</span>
        <h1>Complete <i>your order.</i></h1>
        <p>Just a few details and your delicious meal will be on its way.</p>
      </header>
      {!checkoutItems.length ? (
        <div className="empty-state checkout-empty">
          <ShoppingBag size={32} />
          <h3>Your cart is empty</h3>
          <Link href="/menu" className="button button-primary">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setOrderError("");
              setPlacing(true);
              try {
                const form = new FormData(e.currentTarget);
                const created = await api.post<any>("/orders", {
                  items: checkoutItems.map((item) => ({
                    productId: item.slug || item.id,
                    quantity: item.quantity,
                  })),
                  deliveryAddress: {
                    fullName: String(form.get("name") || ""),
                    phone: String(form.get("phone") || ""),
                    address: String(form.get("house") || ""),
                    area: String(form.get("street") || ""),
                    city: String(form.get("city") || ""),
                    notes: String(form.get("notes") || ""),
                  },
                  email: String(form.get("email") || ""),
                  paymentMethod,
                });
                setOrderNumber(created?.orderNumber || created?._id || "");
                setDeliverySummary(
                  `${String(form.get("name") || "")} · ${String(form.get("house") || "")}, ${String(form.get("street") || "")}, ${String(form.get("city") || "")}`,
                );
                setPlaced(true);
                if (!singleItem) clearCart();
              } catch (error) {
                setOrderError(error instanceof Error ? error.message : "Unable to place your order.");
              } finally {
                setPlacing(false);
              }
            }}
          >
            <section className="form-section">
              <div className="checkout-section-heading">
                <span className="checkout-section-number">01</span>
                <div><h3>Contact details</h3><p>How can we reach you about your order?</p></div>
                <UserRound size={19} />
              </div>
              <div className="form-grid">
                <label>
                  Full name <span className="field-required">Required</span>
                  <input required name="name" placeholder="e.g. Ayesha Khan" />
                </label>
                <label>
                  Phone number <span className="field-required">Required</span>
                  <input required name="phone" type="tel" placeholder="03XX XXXXXXX" />
                </label>
                <label className="wide">
                  Email address <span className="field-optional">Optional</span>
                  <input name="email" type="email" placeholder="you@example.com" />
                </label>
              </div>
            </section>
            <section className="form-section">
              <div className="form-title-row">
                <span className="checkout-section-number">02</span>
                <div><h3>Delivery address</h3><p>Where should we bring your order?</p></div>
                <MapPin size={19} />
              </div>
              <div className="form-grid">
                <label className="wide">
                  House / shop / building
                  <input required name="house" placeholder="e.g. House 14, Street 6" />
                </label>
                <label>
                  Street / area
                  <input required name="street" placeholder="e.g. Gulberg III" />
                </label>
                <label>
                  City
                  <input required name="city" defaultValue="Lahore" />
                </label>
                <label className="wide">
                  Additional instructions <span>(optional)</span>
                  <textarea
                    name="notes"
                    placeholder="Landmark, floor, delivery notes..."
                    rows={3}
                  />
                </label>
              </div>
            </section>
            <section className="form-section">
              <div className="checkout-section-heading">
                <span className="checkout-section-number">03</span>
                <div><h3>Payment method <span className="field-required">Required</span></h3><p>Choose how you would like to pay.</p></div>
                <ShoppingBag size={19} />
              </div>
              <div className="payment-select-wrap checkout-payment-card">
                <span className="payment-card-icon"><ShoppingBag size={16} /></span>
                <span className="payment-card-copy"><strong>{paymentMethod === "cod" ? "Cash on delivery" : paymentMethod === "online" ? "Online payment" : "Select a payment method"}</strong><small>{paymentMethod === "cod" ? "Pay when your fresh order arrives" : paymentMethod === "online" ? "Pay securely online" : "Choose an option to continue"}</small></span>
                <span className="payment-select-control">
                  <select
                    className="payment-select"
                    id="payment-method"
                    name="paymentMethod"
                    required
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as "" | "cod" | "online")}
                    aria-label="Choose payment method (required)"
                  >
                    <option value="" disabled>Select payment</option>
                    <option value="cod">Cash on delivery</option>
                    <option value="online">Online payment</option>
                  </select>
                  <ChevronDown size={17} aria-hidden="true" />
                </span>
              </div>
              <p className="payment-note"><Check size={14} /> Your payment details are handled securely.</p>
            </section>
            {orderError && <p className="checkout-submit-error" role="alert">{orderError}</p>}
            <button
              className="button button-primary full-button submit-order"
              type="submit"
              disabled={placing}
            >
              {placing ? "Placing your order..." : <>Place order <ArrowRight size={17} /></>}
            </button>
          </form>
          <OrderSummary
            subtotal={subtotal}
            cart={checkoutItems}
            checkout
            updateCart={singleItem ? undefined : updateCart}
          />
        </div>
      )}
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page-main about-page">
      <div className="page-intro">
        <span className="eyebrow">Our story</span>
        <h1>
          Good food is
          <br />
          <i>a love language.</i>
        </h1>
        <p>
          For over 25 years, we&apos;ve been bringing Karachi a little more
          crunch, warmth and joy.
        </p>
      </div>
      <div className="about-hero-image">
        <Image
          src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1600&q=85"
          alt="Bilal Broast grilled chicken"
          fill
          priority
          sizes="90vw"
        />
      </div>
      <div className="about-copy-grid">
        <div>
          <span className="eyebrow">Since 1998</span>
          <h2>
            Started with one recipe.
            <br />
            <i>Built with trust.</i>
          </h2>
        </div>
        <div>
          <p>
            Bilal Broast began with a simple idea: serve genuinely great
            chicken, made fresh and served with a smile. From our first little
            shop to the tables of thousands of Lahore families, that idea has
            never changed.
          </p>
          <p>
            We source quality ingredients, marinate every batch ourselves and
            keep our kitchen moving so your food arrives hot, crisp and full of
            flavor.
          </p>
        </div>
      </div>
      <div className="values-grid">
        {[
          ["01", "Quality first", "Every ingredient, every time."],
          ["02", "Made to order", "Fresh is never a compromise."],
          ["03", "For everyone", "Big flavor at fair prices."],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState("General question");
  return (
    <main className="page-main contact-page">
      <div className="contact-hero">
        <div className="page-intro">
          <span className="eyebrow">Come say hello</span>
          <h1>
            We&apos;re here
            <br />
            <i>for you.</i>
          </h1>
          <p>
            Questions, feedback or just want to talk food? Drop us a line and
            our team will get back to you.
          </p>
          <div className="contact-trust">
            <span>
              <Check size={14} /> Usually replies within a day
            </span>
            <span>
              <Star size={14} fill="currentColor" /> Loved across Karachi
            </span>
          </div>
        </div>
        <div className="contact-orbit">
          <span>BB</span>
          <small>
            fresh
            <br />
            conversation
          </small>
        </div>
      </div>
      <div className="contact-grid">
        <div className="contact-details">
          <div className="contact-detail-card">
            <span className="contact-detail-icon" aria-hidden="true"><MapPin size={19} /></span>
            <span>
              <small>Visit us</small>
              <h3>Jamshed Quarters, Karachi</h3>
              <p>{restaurant.address}</p>
            </span>
            <ArrowUpRight size={16} />
          </div>
          <div className="contact-detail-card">
            <span className="contact-detail-icon" aria-hidden="true"><Phone size={19} /></span>
            <span>
              <small>Call us</small>
              <h3>{restaurant.phone}</h3>
              <p>We&apos;re happy to help</p>
            </span>
            <ArrowUpRight size={16} />
          </div>
          <div className="contact-detail-card">
            <span className="contact-detail-icon" aria-hidden="true"><Clock3 size={19} /></span>
            <span>
              <small>Open daily</small>
              <h3>{restaurant.hours}</h3>
              <p>Fresh food, all day</p>
            </span>
            <ArrowUpRight size={16} />
          </div>
          <div className="contact-map">
            <iframe
              title="Bilal Broast location on Google Maps"
              src="https://www.google.com/maps?q=24.881287,67.0423695&z=17&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-overlay">
              <div>
                <MapPin size={18} />
                <span>
                  <strong>Bilal Broast</strong>
                  <small>Gulberg, Lahore</small>
                </span>
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=24.881287,67.0423695"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent ? (
            <div className="contact-success">
              <div>
                <Check size={25} />
              </div>
              <span className="eyebrow">Message received</span>
              <h2>
                Thanks for
                <br />
                <i>reaching out.</i>
              </h2>
              <p>
                Our team will get back to you shortly. We can&apos;t wait to
                hear from you.
              </p>
              <button
                className="button button-outline"
                type="button"
                onClick={() => setSent(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div className="contact-form-heading">
                <span className="eyebrow">Let&apos;s talk</span>
                <h2>
                  Send us a <i>message.</i>
                </h2>
                <p>
                  Tell us what&apos;s on your mind and we&apos;ll take it from
                  there.
                </p>
              </div>
              <div className="contact-form-row">
                <label>
                  Your name
                  <input required placeholder="e.g. Ayesha Khan" />
                </label>
                <label>
                  Email address
                  <input required type="email" placeholder="you@example.com" />
                </label>
              </div>
              <label>
                What can we help with?
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option>General question</option>
                  <option>Feedback</option>
                  <option>Catering enquiry</option>
                  <option>Order support</option>
                </select>
              </label>
              <label>
                Your message
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                />
              </label>
              <button className="button button-primary" type="submit">
                Send message <ArrowRight size={16} />
              </button>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

function LiveOrders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Order | null>(null);
  const filtered = orders.filter(
    (o) =>
      (status === "All" || o.status === status) &&
      `${o.id} ${o.customerName} ${o.phone}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="ops-page">
      <div className="ops-top">
        <div>
          <span className="eyebrow">Bilal Broast · Kitchen</span>
          <h1>Live orders</h1>
          <p>Keep the kitchen moving. Every order, right here.</p>
        </div>
        <div className="ops-date">
          {new Date().toLocaleDateString("en-PK", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          <span className="live-dot" /> Live
        </div>
      </div>
      <div className="ops-stats">
        <div>
          <span>Today&apos;s orders</span>
          <strong>24</strong>
          <small>+12% vs yesterday</small>
        </div>
        <div>
          <span>In the kitchen</span>
          <strong>8</strong>
          <small>2 need attention</small>
        </div>
        <div>
          <span>Revenue today</span>
          <strong>Rs. 32,480</strong>
          <small>Average order Rs. 1,353</small>
        </div>
      </div>
      <div className="ops-toolbar">
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, customers..."
          />
        </label>
        <div className="filter-scroll">
          {[
            "All",
            "New",
            "Confirmed",
            "Preparing",
            "Ready",
            "Out for Delivery",
          ].map((item) => (
            <button
              key={item}
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="orders-list">
        <div className="order-list-head">
          <span>{filtered.length} active orders</span>
          <button>
            Newest first <ChevronDown size={15} />
          </button>
        </div>
        {filtered.map((order) => (
          <article
            className="order-card"
            key={order.id}
            onClick={() => setSelected(order)}
          >
            <div className="order-main">
              <span className="order-id">{order.id}</span>
              <h3>{order.customerName}</h3>
              <p>
                {order.items
                  .map((i) => `${i.quantity}�� ${i.name}`)
                  .join(" · ")}
              </p>
            </div>
            <div className="order-customer">
              <span>
                <Phone size={13} /> {order.phone}
              </span>
              <span>
                <MapPin size={13} /> {order.address}
              </span>
            </div>
            <div className="order-total">
              <strong>{formatPrice(order.total)}</strong>
              <span>{order.createdAt}</span>
            </div>
            <StatusBadge status={order.status} />
            <ChevronRightIcon />
          </article>
        ))}
      </div>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <span className="eyebrow">Order details</span>
            <h2>{selected.id}</h2>
            <StatusBadge status={selected.status} />
            <div className="modal-block">
              <span>Customer</span>
              <strong>{selected.customerName}</strong>
              <p>{selected.phone}</p>
            </div>
            <div className="modal-block">
              <span>Delivery to</span>
              <strong>{selected.address}</strong>
              <p>
                {selected.deliveryInstructions || "No special instructions"}
              </p>
            </div>
            <div className="modal-items">
              {selected.items.map((item) => (
                <div key={item.name}>
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="modal-total">
              <span>Total</span>
              <strong>{formatPrice(selected.total)}</strong>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
function ChevronRightIcon() {
  return <ArrowRight className="order-arrow" size={17} />;
}

function OrderHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<
    "loading" | "login" | "ready" | "empty" | "error"
  >("loading");
  const [orders, setOrders] = useState<any[]>([]);
  const proxyGet = async (path: string) => {
    const response = await fetch(`/api/backend${path}`, {
      credentials: "include",
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        payload.message || `Request failed with status ${response.status}`,
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return payload.data ?? payload;
  };
  useEffect(() => {
    setMounted(true);
    let active = true;
    (async () => {
      try {
        let me: any;
        try {
          me = await proxyGet("/auth/me");
        } catch (authError) {
          const status = (authError as Error & { status?: number }).status;
          if (status === 401 || status === 403 || !status) {
            if (active) setState("login");
            return;
          }
          throw authError;
        }
        const user = me?.user || me?.data?.user || me?.data || me;
        if (
          me?.success === false ||
          (!user?.id && !user?._id && !user?.email && !user?.userId)
        ) {
          if (active) setState("login");
          return;
        }
        let response: any;
        let lastError: unknown;
        for (const endpoint of ["/orders/my", "/orders"]) {
          try {
            response = await proxyGet(endpoint);
            break;
          } catch (error) {
            lastError = error;
          }
        }
        if (response === undefined)
          throw lastError || new Error("Unable to load orders");
        const list = Array.isArray(response)
          ? response
          : response?.orders || response?.items || response?.data || [];
        if (active) {
          setOrders(list);
          setState(list.length ? "ready" : "empty");
        }
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        console.error("[v0] Failed to load customer order history", error);
        if (active)
          setState(status === 401 || status === 403 ? "login" : "error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  if (!mounted || state === "loading")
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <div className="history-spinner" />
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  if (state === "login")
    return (
      <main className="page-main history-page">
        <div className="history-gate">
          <div className="history-gate-icon">
            <UserRound size={28} />
          </div>
          <span className="eyebrow">Your table, remembered</span>
          <h1>
            Order <i>history.</i>
          </h1>
          <p>
            Log in to see your past Bilal Broast orders, receipts, and order
            status in one place.
          </p>
          <Link href="/login" className="button button-primary">
            Log in to continue <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  if (state === "error")
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <span className="eyebrow">Something went wrong</span>
          <h1>
            We couldn&apos;t load your <i>orders.</i>
          </h1>
          <Link href="/order-history" className="button button-outline">
            Try again
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-main history-page">
      <div className="page-intro compact">
        <span className="eyebrow">Welcome back</span>
        <h1>
          Your <i>orders.</i>
        </h1>
        <p>Every delicious memory, in one place.</p>
      </div>
      {state === "empty" ? (
        <div className="history-state">
          <ShoppingBag size={30} />
          <h2>No orders yet</h2>
          <p>Your first delicious order will appear here.</p>
          <Link href="/menu" className="button button-primary">
            Browse menu <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {orders.map((order) => (
            <article
              className="history-card"
              key={order._id || order.id || order.orderNumber}
            >
              <div className="history-card-head">
                <div>
                  <span className="eyebrow">Order placed</span>
                  <h2>{order.orderNumber || order._id || order.id}</h2>
                  <small>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent order"}
                  </small>
                </div>
                <span className="history-status">
                  {order.orderStatus || order.status || "Processing"}
                </span>
              </div>
              <div className="history-items">
                {(order.items || []).map((item: any, index: number) => (
                  <div key={item._id || item.id || index}>
                    <span>
                      {item.quantity || 1} ×{" "}
                      {item.name || item.product?.name || "Item"}
                    </span>
                    <strong>
                      {formatPrice(
                        Number(item.price ?? item.priceSnapshot ?? 0) *
                          Number(item.quantity || 1),
                      )}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="history-card-total">
                <span>Total</span>
                <strong>
                  {formatPrice(Number(order.grandTotal ?? order.total ?? 0))}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function OrderHistoryDashboard({
  orders: initialOrders,
  updateCart,
}: {
  orders: any[];
  updateCart: (id: string, delta: number) => void;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(!initialOrders.length);
  const [loginRequired, setLoginRequired] = useState(false);
  useEffect(() => {
    if (initialOrders.length) return;
    fetch("/api/backend/orders/my", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          setLoginRequired(true);
          return;
        }
        const payload = await response.json();
        const data = payload.data ?? payload;
        setOrders(Array.isArray(data) ? data : data.orders || data.items || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [initialOrders.length]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<any | null>(null);
  if (loading)
    return (
      <main className="page-main history-page">
        <div className="history-state">
          <div className="history-spinner" />
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  if (loginRequired)
    return (
      <main className="page-main history-page">
        <div className="history-gate">
          <div className="history-gate-icon">
            <UserRound size={28} />
          </div>
          <span className="eyebrow">Your table, remembered</span>
          <h1>
            Order <i>history.</i>
          </h1>
          <p>
            Log in to see your past Bilal Broast orders, receipts, and order
            status in one place.
          </p>
          <Link href="/login" className="button button-primary">
            Log in to continue <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  const normalized = orders.map((order, index) => ({
    ...order,
    id:
      order.orderNumber ||
      order.orderId ||
      order._id ||
      order.id ||
      `Order ${index + 1}`,
    status: order.orderStatus || order.status || "Processing",
    total: Number(order.grandTotal ?? order.total ?? order.totalAmount ?? 0),
    items: order.items || order.orderItems || [],
  }));
  const filtered = normalized
    .filter((order) => {
      const haystack =
        `${order.id} ${order.status} ${order.items.map((item: any) => item.name || item.product?.name || "").join(" ")}`.toLowerCase();
      return (
        haystack.includes(query.toLowerCase()) &&
        (status === "All" ||
          order.status.toLowerCase() === status.toLowerCase())
      );
    })
    .sort((a, b) =>
      sort === "oldest"
        ? String(a.createdAt || "").localeCompare(String(b.createdAt || ""))
        : String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    );
  const active = normalized.filter(
    (order) => !["Delivered", "Cancelled"].includes(order.status),
  ).length;
  const spent = normalized.reduce((sum, order) => sum + order.total, 0);
  return (
    <main className="page-main history-page history-dashboard">
      <div className="history-dashboard-head">
        <div>
          <span className="eyebrow">Your table, remembered</span>
          <h1>
            Order <i>history.</i>
          </h1>
          <p>Every delicious memory, in one place.</p>
        </div>
        <Link href="/menu" className="button button-primary">
          Order again <ArrowRight size={16} />
        </Link>
      </div>
      <div className="history-stats">
        <div>
          <span>Total orders</span>
          <strong>{normalized.length}</strong>
          <small>All time</small>
        </div>
        <div>
          <span>In progress</span>
          <strong>{active}</strong>
          <small>Being prepared</small>
        </div>
        <div>
          <span>Total spent</span>
          <strong>{formatPrice(spent)}</strong>
          <small>Across all orders</small>
        </div>
      </div>
      <div className="history-toolbar">
        <label className="history-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders or items..."
          />
        </label>
        <div className="history-filters">
          {[
            "All",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ].map((item) => (
            <button
              key={item}
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort orders"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="history-dashboard-list">
          {filtered.map((order) => (
            <article
              className="history-order-card"
              key={order.id}
              onClick={() => setSelected(order)}
            >
              <div className="history-order-card-top">
                <div>
                  <span className="eyebrow">Order placed</span>
                  <h2>{order.id}</h2>
                  <small>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent order"}
                  </small>
                </div>
                <span
                  className={`history-status status-${String(order.status).toLowerCase().replaceAll(" ", "-")}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="history-order-items">
                {order.items.map((item: any, index: number) => (
                  <div key={item._id || item.id || index}>
                    <span>
                      {item.quantity || 1} ×{" "}
                      {item.name || item.product?.name || "Order item"}
                    </span>
                    <strong>
                      {formatPrice(
                        Number(
                          item.price ??
                            item.unitPrice ??
                            item.priceSnapshot ??
                            0,
                        ) * Number(item.quantity || 1),
                      )}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="history-order-footer">
                <span>
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </span>
                <strong>{formatPrice(order.total)}</strong>
                <ChevronRightIcon />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="history-state">
          <Search size={28} />
          <h2>No matching orders</h2>
          <p>Try another search or filter.</p>
        </div>
      )}
      {selected && (
        <div
          className="history-modal-layer"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <section
            className="history-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${selected.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="history-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              <X size={18} />
            </button>
            <span className="eyebrow">Order details</span>
            <h2>{selected.id}</h2>
            <span
              className={`history-status status-${String(selected.status).toLowerCase().replaceAll(" ", "-")}`}
            >
              {selected.status}
            </span>
            <div className="history-timeline">
              <span className="is-done">Order placed</span>
              <span className={selected.status !== "New" ? "is-done" : ""}>
                Preparing your food
              </span>
              <span
                className={
                  ["Ready", "Out for Delivery", "Delivered"].includes(
                    selected.status,
                  )
                    ? "is-done"
                    : ""
                }
              >
                On its way
              </span>
              <span
                className={selected.status === "Delivered" ? "is-done" : ""}
              >
                Delivered
              </span>
            </div>
            <div className="history-modal-items">
              {selected.items.map((item: any, index: number) => (
                <div key={index}>
                  <span>
                    {item.quantity || 1} ×{" "}
                    {item.name || item.product?.name || "Order item"}
                  </span>
                  <strong>
                    {formatPrice(
                      Number(item.price ?? item.unitPrice ?? 0) *
                        Number(item.quantity || 1),
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <div className="history-modal-total">
              <span>Total</span>
              <strong>{formatPrice(selected.total)}</strong>
            </div>
            <Link
              href="/menu"
              className="button button-primary full-button"
              onClick={() => setSelected(null)}
            >
              Order these items again <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}

function LegacyOrderHistoryPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    setLoggedIn(
      window.localStorage.getItem("bilal-broast-auth") === "true" ||
        window.location.search.includes("demo=true"),
    );
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("bilal-broast-orders") || "[]",
      );
      setOrders(
        saved.length
          ? saved
          : [
              {
                id: "BB-240921",
                createdAt: "2026-09-12T18:30:00.000Z",
                items: [
                  {
                    id: "broast-1",
                    name: "Classic Broast",
                    price: 649,
                    quantity: 2,
                  },
                ],
                total: 1448,
                status: "Delivered",
              },
              {
                id: "BB-240874",
                createdAt: "2026-09-05T20:15:00.000Z",
                items: [
                  {
                    id: "zinger-1",
                    name: "Zinger Burger",
                    price: 499,
                    quantity: 1,
                  },
                  {
                    id: "fries-1",
                    name: "Loaded Fries",
                    price: 299,
                    quantity: 1,
                  },
                ],
                total: 948,
                status: "Delivered",
              },
            ],
      );
    } catch {
      setOrders([]);
    }
  }, []);
  if (!loggedIn)
    return (
      <main className="page-main history-page">
        <div className="history-gate">
          <div className="history-gate-icon">
            <UserRound size={28} />
          </div>
          <span className="eyebrow">Your table, remembered</span>
          <h1>
            Order <i>history.</i>
          </h1>
          <p>
            Log in to see your past Bilal Broast orders, receipts, and order
            status in one place.
          </p>
          <Link href="/login" className="button button-primary">
            Log in to continue <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-main history-page">
      <div className="page-intro compact">
        <span className="eyebrow">Welcome back</span>
        <h1>
          Your <i>orders.</i>
        </h1>
        <p>Every delicious memory, in one place.</p>
      </div>
      {orders.length ? (
        <div className="history-list">
          {orders.map((order) => (
            <article className="history-card" key={order.id}>
              <div className="history-card-head">
                <div>
                  <span className="eyebrow">Order placed</span>
                  <h2>{order.id}</h2>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </div>
                <span className="history-status">{order.status}</span>
              </div>
              <div className="history-items">
                {order.items.map((item: CartLine) => (
                  <div key={item.id}>
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="history-total">
                <span>Grand total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="history-empty">
          <ShoppingBag size={28} />
          <h3>No past orders yet</h3>
          <p>Your next order will appear here.</p>
          <Link href="/menu" className="button button-primary">
            Explore menu <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </main>
  );
}

function CartDrawer({
  cart,
  onClose,
  updateCart,
  onRemove,
}: {
  cart: CartLine[];
  onClose: () => void;
  updateCart: (id: string, d: number) => void;
  onRemove: (id: string) => void;
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <div
      className="cart-drawer-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <button
        className="cart-drawer-backdrop"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside className="cart-drawer">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Your order</span>
            <h2>
              Cart <span>({cart.length})</span>
            </h2>
          </div>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={19} />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="drawer-items">
              {cart.map((item) => (
                <div className="drawer-item" key={item.id}>
                  <div className="drawer-thumb">
                    <Image src={item.image} alt={item.name} fill sizes="76px" />
                  </div>
                  <div className="drawer-item-copy">
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}</span>
                    <div className="drawer-quantity">
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus size={12} />
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        onClick={() => updateCart(item.id, 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="drawer-remove"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-summary">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <small>Delivery fee calculated at checkout</small>
              <Link
                href="/checkout"
                onClick={onClose}
                className="button button-primary full-button"
              >
                Proceed to checkout <ArrowRight size={16} />
              </Link>
              <Link href="/cart" onClick={onClose} className="drawer-view-cart">
                View full cart <ArrowRight size={14} />
              </Link>
            </div>
          </>
        ) : (
          <div className="drawer-empty">
            <div>
              <ShoppingBag size={26} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Good food is only a few clicks away.</p>
            <Link
              href="/menu"
              onClick={onClose}
              className="button button-primary"
            >
              Explore menu <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const path = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const saved = window.localStorage.getItem("bilal-broast-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("bilal-broast-cart");
      }
    }
    setCartHydrated(true);
  }, []);
  useEffect(() => {
    if (cartHydrated) {
      window.localStorage.setItem("bilal-broast-cart", JSON.stringify(cart));
    }
  }, [cart, cartHydrated]);
  useEffect(() => {
    document.body.classList.toggle("cart-drawer-open", drawerOpen);
    return () => document.body.classList.remove("cart-drawer-open");
  }, [drawerOpen]);
  const add = (product: Product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((i) => i.id === product.id);
      const next = found
        ? current.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...current, { ...product, quantity }];
      window.localStorage.setItem("bilal-broast-cart", JSON.stringify(next));
      return next;
    });
  };
  const update = (id: string, delta: number) =>
    setCart((current) => {
      const next = current.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      );
      window.localStorage.setItem("bilal-broast-cart", JSON.stringify(next));
      return next;
    });
  const remove = (id: string) =>
    setCart((current) => {
      const next = current.filter((i) => i.id !== id);
      window.localStorage.setItem("bilal-broast-cart", JSON.stringify(next));
      return next;
    });
  const clear = () => {
    setCart([]);
    window.localStorage.removeItem("bilal-broast-cart");
  };
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const canAdd = () => {
    return true;
  };
  let content: React.ReactNode;
  if (path === "/menu") content = <MenuPage onAdd={add} canAdd={canAdd} />;
  else if (path.startsWith("/menu/"))
    content = (
      <DynamicProductPage
        slug={decodeURIComponent(path.slice("/menu/".length))}
        onAdd={add}
        canAdd={canAdd}
      />
    );
  else if (path === "/cart")
    content = (
      <CartPage
        cart={cart}
        updateCart={update}
        onRemove={remove}
      />
    );
  else if (path === "/order-history")
    content = <OrderHistoryDashboard orders={[]} updateCart={update} />;
  else if (path === "/checkout") {
    const quantity = Math.max(1, Number(searchParams.get("quantity") || 1));
    const productSlug = searchParams.get("product");
    content = productSlug ? (
      <DynamicCheckoutPage
        slug={productSlug}
        quantity={quantity}
        cart={cart}
        clearCart={clear}
        updateCart={update}
      />
    ) : (
      <CheckoutPage
        cart={cart}
        clearCart={clear}
        updateCart={update}
      />
    );
  } else if (path === "/about") content = <AboutPage />;
  else if (path === "/contact") content = <ContactPage />;
  else if (path === "/getLiveOrder") content = <LiveOrders />;
  else content = <Home onAdd={add} />;
  return (
    <div className={path === "/getLiveOrder" ? "app ops-app" : "app"}>
      <Navbar cartCount={cartCount} onCart={() => setDrawerOpen(true)} />
      {content}
      {path !== "/getLiveOrder" && <Footer />}
      {drawerOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setDrawerOpen(false)}
          updateCart={update}
          onRemove={remove}
        />
      )}
    </div>
  );
}
