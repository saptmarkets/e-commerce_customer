import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';

import Layout from '@layout/Layout';
import ProductCardModern from '@components/product/ProductCardModern';
import ProductServices from '@services/ProductServices';
import { useWishlistIds } from '@hooks/useWishlist';
import Loading from '@components/preloader/Loading';

const MyWishlist = () => {
  const { t } = useTranslation('common');
  const { ids } = useWishlistIds();

  const queries = useQueries({
    queries: (ids || []).map((id) => ({
      queryKey: ['wishlist-product', id],
      queryFn: () => ProductServices.getProductById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const products = useMemo(() => queries.map((q) => q.data).filter(Boolean), [queries]);

  return (
    <Layout title={t('wishlist') || 'Wishlist'} description="Your saved products">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-10">
        <h2 className="text-2xl font-semibold mb-6">{t('wishlist') || 'Wishlist'}</h2>

        {isLoading && <Loading loading={isLoading} />}

        {!isLoading && (!ids || ids.length === 0) && (
          <div className="text-center py-20 text-gray-600">
            {t('noItems') || 'No Items'}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCardModern key={product._id} product={product} />)
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyWishlist; 