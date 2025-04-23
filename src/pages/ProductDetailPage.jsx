import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchProductById } from '../redux/slices/productSlice';
import ProductImage from '../components/ProductDetail/ProductImage';
import ProductDescription from '../components/ProductDetail/ProductDescription';
import ProductAction from '../components/ProductDetail/ProductAction';


const ProductDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct, status, error } = useSelector(state => state.products);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    if (status === 'loading') {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6" color="error">
                        Error: {error}
                    </Typography>
                    <Link to="/">Volver al listado de productos</Link>
                </Box>
            </Container>
        );
    }

    if (!selectedProduct) {
        return (
            <Container>
                <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6">
                        No se encontró el producto
                    </Typography>
                    <Link to="/">Volver al listado de productos</Link>
                </Box>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4, height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >
                <Button
                    component={Link}
                    to="/"
                    startIcon={<ArrowBackIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Volver a productos
                </Button>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    {selectedProduct.brand} - {selectedProduct.model}
                </Typography>
                <Box width="130px" />
            </Box>

            <Box display="flex" width="100%" flex="1" justifyContent="center" alignItems="center">
                <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
                    <ProductImage product={selectedProduct} />
                </Box>
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%">
                    <ProductDescription product={selectedProduct} />
                    <ProductAction product={selectedProduct} />
                </Box>
            </Box>
        </Container>
    );
};

export default ProductDetailPage;