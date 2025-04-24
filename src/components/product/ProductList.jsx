import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Pagination, Stack, useTheme, useMediaQuery } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';

const ProductList = () => {
    const { filteredItems, status, error } = useSelector(state => state.products);
    const dispatch = useDispatch();
    const theme = useTheme();

    const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

    const getPaginationSize = () => {
        if (isXsScreen) return 'small';
        if (isSmScreen) return 'medium';
        return 'large';
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
                <Stack spacing={isXsScreen ? 1 : 2} sx={{ display: 'flex', alignItems: 'center', my: isXsScreen ? 2 : 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size={getPaginationSize()}
                        showFirstButton={!isXsScreen}
                        showLastButton={!isXsScreen}
                        siblingCount={isXsScreen ? 0 : 1}
                        boundaryCount={isXsScreen ? 1 : 2}
                    />
                    <Typography
                        variant={isXsScreen ? "caption" : "body2"}
                        color="text.secondary"
                    >
                        Página {page} de {totalPages} ({filteredItems.length} productos)
                    </Typography>
                </Stack>
            )}
        </>
    );
};

export default ProductList;