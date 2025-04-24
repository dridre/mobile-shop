import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Button, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchProductById } from '../redux/slices/productSlice';
import ProductImage from '../components/ProductDetail/ProductImage';
import ProductDescription from '../components/ProductDetail/ProductDescription';
import ProductAction from '../components/ProductDetail/ProductAction';


const ProductDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct, status, error } = useSelector(state => state.products);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <Container sx={{ py: 2, height: isMobile ? 'auto' : '90vh', display: 'flex', flexDirection: 'column' }}>
            <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
            >
                <Button
                    component={Link}
                    to="/"
                    startIcon={<ArrowBackIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Volver a productos
                </Button>
            </Box>

            <Box
                display="flex"
                width="100%"
                flex="1"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="center"
                alignItems="center"
                gap={isMobile ? 4 : 2}
                py={isMobile ? 3 : 0}
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width={isMobile ? '100%' : '50%'}
                    height={isMobile ? 'auto' : '100%'}
                >
                    <ProductImage product={selectedProduct} />
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems={isMobile ? 'center' : 'flex-start'}
                    width={isMobile ? '100%' : '50%'}
                    height={isMobile ? 'auto' : '100%'}
                    textAlign={isMobile ? 'center' : 'left'}
                >
                    <Typography variant={isMobile ? "h5" : "h4"} component="h1" fontWeight="bold" mb={2}>
                        {selectedProduct.brand} - {selectedProduct.model}
                    </Typography>
                    <ProductDescription product={selectedProduct} />
                    <ProductAction product={selectedProduct} />
                </Box>
            </Box>
        </Container>
    );
};

export default ProductDetailPage;