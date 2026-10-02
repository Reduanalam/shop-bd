import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk } from "../redux/slices/productSlice.js";
import { fetchCategories } from "../services/productService.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Products() {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  const filters = {
    keyword: searchParams.get("keyword") || "",
    sort: searchParams.get("sort") || "",
    category: searchParams.get("category") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    dispatch(fetchProductsThunk(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchParams]);

  const updateFilter = (patch) => {
    const next = { ...filters, ...patch };
    const params = {};
    if (next.keyword) params.keyword = next.keyword;
    if (next.sort) params.sort = next.sort;
    if (next.category) params.category = next.category;
    if (next.page && next.page !== 1) params.page = next.page;
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border rounded-lg px-3 py-2 flex-1"
          value={filters.keyword}
          onChange={(e) => updateFilter({ keyword: e.target.value, page: 1 })}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={filters.sort}
          onChange={(e) => updateFilter({ sort: e.target.value })}
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => updateFilter({ category: "", page: 1 })}
          className={`text-sm px-3 py-1.5 rounded-full border ${
            !filters.category ? "bg-primary-600 text-white border-primary-600" : ""
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => updateFilter({ category: c._id, page: 1 })}
            className={`text-sm px-3 py-1.5 rounded-full border ${
              filters.category === c._id ? "bg-primary-600 text-white border-primary-600" : ""
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 py-16 text-center">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {list.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilter({ page: p })}
                  className={`w-9 h-9 rounded-lg ${
                    p === filters.page ? "bg-primary-600 text-white" : "bg-white border"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
