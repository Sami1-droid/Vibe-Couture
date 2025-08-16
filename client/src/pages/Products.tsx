import React from 'react';

const Products: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Product listings will be implemented here */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold">Product Catalog</h3>
            <p className="text-gray-600">Product listings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;