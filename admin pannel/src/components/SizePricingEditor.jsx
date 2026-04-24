const inputClassName =
  "w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-green-600";

const SizePricingEditor = ({ variants = [], onChange, onAdd, onRemove }) => {
  return (
    <div className="lg:col-span-2 rounded-md border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Size & Price Options</p>
          <p className="text-xs text-gray-500">
            Add optional size-based pricing. The lowest size price becomes the catalog
            price on the storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
        >
          Add Size
        </button>
      </div>

      {variants.length ? (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-white p-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.9fr))_auto]"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Size
                </label>
                <input
                  value={variant.size}
                  onChange={(event) => onChange(variant.id, "size", event.target.value)}
                  placeholder={index === 0 ? 'Small / 4"' : "Large / 10 inch"}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={variant.price}
                  onChange={(event) => onChange(variant.id, "price", event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Discounted Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.discountedPrice}
                  onChange={(event) =>
                    onChange(variant.id, "discountedPrice", event.target.value)
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(event) => onChange(variant.id, "stock", event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onRemove(variant.id)}
                  className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          No size-specific pricing added yet. Use the button above if this product has
          multiple sizes.
        </p>
      )}
    </div>
  );
};

export default SizePricingEditor;
