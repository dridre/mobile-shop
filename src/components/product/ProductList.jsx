import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { fetchMoreProducts, fetchProducts } from '../../redux/slices/productSlice';

const ProductList = () => {
    const { filteredItems, status, error, hasMore } = useSelector(state => state.products);
    const [page, setPage] = useState(1);
    const dispatch = useDispatch();



    const fetchMoreData = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        dispatch(fetchMoreProducts(nextPage));
    };

    if (status === 'loading' && page === 1) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed' && !filteredItems.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">
                    Error al cargar los productos: {error}
                </Typography>
            </Box>
        );
    }

    if (filteredItems.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>
                    No se encontraron productos que coincidan con la búsqueda.
                </Typography>
            </Box>
        );
    }

    return (
        <InfiniteScroll
            dataLength={filteredItems.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                </Box>
            }
            endMessage={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No hay más productos para mostrar
                    </Typography>
                </Box>
            }
        >
            <Grid container spacing={3}>
                {filteredItems.map(product => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </InfiniteScroll>
    );
};

export default ProductList;
