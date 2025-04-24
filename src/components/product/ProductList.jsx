import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Pagination, Stack } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';

const ProductList = () => {
    const { filteredItems, status, error } = useSelector(state => state.products);
    const dispatch = useDispatch();

    const [page, setPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }
    }, [status, dispatch]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    const totalPages = Math.ceil(filteredItems.length / productsPerPage);
    const startIndex = (page - 1) * productsPerPage;
    const currentProducts = filteredItems.slice(startIndex, startIndex + productsPerPage);

    return (
        <>
            <Grid container spacing={3}>
                {currentProducts.map(product => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Stack spacing={2} sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                    <Typography variant="body2" color="text.secondary">
                        Página {page} de {totalPages} ({filteredItems.length} productos)
                    </Typography>
                </Stack>
            )}
        </>
    );
};

export default ProductList;