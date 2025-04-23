import React, { useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';

const ProductList = () => {
    const { filteredItems, status, error } = useSelector(state => state.products);
    const dispatch = useDispatch();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }
    }, [status, dispatch]);

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === 'failed') {
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
        <Grid container spacing={3}>
            {filteredItems.map(product => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} key={product.id}>
                    <ProductCard product={product} />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;
