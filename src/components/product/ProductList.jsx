import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, CircularProgress, Pagination, Stack, useTheme, useMediaQuery } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, clearSelectedProduct } from '../../redux/slices/productSlice';

const ProductList = () => {

    // Obtiene el estado de los productos desde Redux
    const { filteredItems, status, error } = useSelector(state => state.products);
    const dispatch = useDispatch();
    const theme = useTheme();

    // Configuración responsive
    const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Estado para la paginación
    const [page, setPage] = useState(1);
    const productsPerPage = 12;

    // Carga los productos al montar el componente
    useEffect(() => {
        dispatch(clearSelectedProduct());
        dispatch(fetchProducts());
    }, [dispatch]);

    // Resetea a la primera página cuando cambia el filtro
    useEffect(() => {
        setPage(1);
    }, [filteredItems.length]);

    // Cambia la página actual y hace scroll hacia arriba
    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ajusta el tamaño de la paginación según el dispositivo
    const getPaginationSize = () => {
        if (isXsScreen) return 'small';
        if (isSmScreen) return 'medium';
        return 'large';
    };

    // Muestra spinner durante la carga
    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Muestra mensaje de error si falla la carga
    if (status === 'failed') {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">
                    Error al cargar los productos: {error}
                </Typography>
            </Box>
        );
    }

    // Muestra mensaje si no hay resultados de búsqueda
    if (filteredItems.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>
                    No se encontraron productos que coincidan con la búsqueda.
                </Typography>
            </Box>
        );
    }

    // Calcula la paginación y los productos a mostrar
    const totalPages = Math.ceil(filteredItems.length / productsPerPage);
    const startIndex = (page - 1) * productsPerPage;
    const currentProducts = filteredItems.slice(startIndex, startIndex + productsPerPage);

    return (
        <>
            {/* Grid de productos */}
            <Grid container spacing={3}>
                {currentProducts.map(product => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {/* Paginación */}
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