"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="card p-4 cursor-pointer">

        <Image
  src={
    product.image ||
    "https://via.placeholder.com/400x400.png?text=Product"
  }
  alt={product.name}
  fill
  sizes="300px"
/>

        <h3 className="mt-2">{product.name}</h3>

        <p className="text-yellow-400 font-bold">
          ₹{product.price}
        </p>

      </div>
    </Link>
  );
}