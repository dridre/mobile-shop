import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import SearchBar from '../components/common/SearchBar';
import ProductList from '../components/product/ProductList';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '../redux/slices/productSlice';

const ProductListPage = () => {
    const dispatch = useDispatch();

    // Limpia el término de búsqueda al desmontar el componente
    useEffect(() => {
        return () => {
            dispatch(setSearchTerm(''));
        };
    }, [dispatch]);

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                {/* Barra de búsqueda para filtrar productos */}
                <SearchBar />
                {/* Listado de productos con paginación */}
                <ProductList />
            </Box>
        </Container>
    );
};

export default ProductListPage;