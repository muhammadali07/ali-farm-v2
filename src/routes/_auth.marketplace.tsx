import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { marketplaceService } from "@/services/marketplace.service";
import { MarketProduct } from "@/types";
import { ShoppingCart, Loader2, Package } from "lucide-react";

export const Route = createFileRoute("/_auth/marketplace")({
  component: Marketplace,
});

function Marketplace() {
  const [category, setCategory] = useState<
    "ALL" | "Sheep" | "Feed" | "Medicine"
  >("ALL");
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await marketplaceService.findAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    category === "ALL"
      ? products
      : products.filter((p) => p.category === category);

  const handleBuy = (product: MarketProduct) => {
    const message = `Halo Ali Farm! Saya tertarik membeli: ${product.name} (ID: ${product.id}). Harga: Rp ${product.price.toLocaleString("id-ID")}. Apakah masih tersedia?`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat produk...</span>
        </div>
      </div>
    );
  }

  const categories = ["ALL", "Sheep", "Feed", "Medicine"] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Marketplace</h1>
          <p className="text-slate-500 text-sm">
            Beli ternak, pakan, dan perlengkapan berkualitas.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                category === c
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {c === "ALL"
                ? "Semua"
                : c === "Sheep"
                  ? "Domba"
                  : c === "Feed"
                    ? "Pakan"
                    : "Obat"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="card-elevated overflow-hidden group animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              <img
                src={
                  product.imageUrl ||
                  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400"
                }
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`badge ${
                    product.category === "Sheep"
                      ? "badge-success"
                      : product.category === "Feed"
                        ? "badge-warning"
                        : "badge-info"
                  }`}
                >
                  {product.category === "Sheep"
                    ? "Domba"
                    : product.category === "Feed"
                      ? "Pakan"
                      : "Obat"}
                </span>
              </div>
              {product.stock < 5 && product.stock > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="badge badge-danger">Stok Terbatas</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-800 mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-agri-600">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  Stok: {product.stock}
                </span>
              </div>

              <button
                onClick={() => handleBuy(product)}
                disabled={product.stock === 0}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} />
                {product.stock > 0 ? "Beli via WhatsApp" : "Stok Habis"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400">Tidak ada produk dalam kategori ini</p>
        </div>
      )}
    </div>
  );
}
