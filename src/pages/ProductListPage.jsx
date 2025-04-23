import React from 'react';
import { Box, Container } from '@mui/material';
import SearchBar from '../components/common/SearchBar';
import ProductList from '../components/product/ProductList';

const ProductListPage = () => {
    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <SearchBar />
                <ProductList />
            </Box>
        </Container>
    );
};

export default ProductListPage;