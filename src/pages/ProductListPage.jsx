import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import SearchBar from '../components/common/SearchBar';
import ProductList from '../components/product/ProductList';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '../redux/slices/productSlice';

const ProductListPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(setSearchTerm(''));
        };
    }, [dispatch]);

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