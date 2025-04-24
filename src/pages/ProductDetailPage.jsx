import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Button, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchProductById } from '../redux/slices/productSlice';
import ProductImage from '../components/ProductDetail/ProductImage';
import ProductDescription from '../components/ProductDetail/ProductDescription';
import ProductAction from '../components/ProductDetail/ProductAction';

const ProductDetailPage = () => {

    // Obtiene el ID del producto de la URL
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Obtiene el producto seleccionado del estado de Redux
    const { selectedProduct, status, error } = useSelector(state => state.products);

    // Configuración responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Estado local para controlar la carga
    const [isLoading, setIsLoading] = useState(true);

    // Carga el producto al montar el componente
    useEffect(() => {
        const loadProduct = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    await dispatch(fetchProductById(id)).unwrap();
                } catch (err) {
                    console.error('Error cargando producto:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadProduct();
    }, [dispatch, id]);

    // Muestra spinner mientras carga
    if (isLoading || status === 'loading') {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    // Muestra mensaje de error si falla la carga
    if (error) {
        return (
            <Container>
                <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6" color="error">
                        Error: {error}
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                        Volver al listado de productos
                    </Button>
                </Box>
            </Container>
        );
    }

    // Muestra mensaje si no se encuentra el producto
    if (!selectedProduct) {
        return (
            <Container>
                <Box mt={4} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6">
                        No se encontró el producto
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                        Volver al listado de productos
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 2, height: isMobile ? 'auto' : '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Botón para volver al listado */}
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

            {/* Contenedor principal con layout adaptativo */}
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
                {/* Columna izquierda: imagen del producto */}
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width={isMobile ? '100%' : '50%'}
                    height={isMobile ? 'auto' : '100%'}
                >
                    <ProductImage product={selectedProduct} />
                </Box>

                {/* Columna derecha: información y acciones */}
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems={isMobile ? 'center' : 'flex-start'}
                    width={isMobile ? '100%' : '50%'}
                    height={isMobile ? 'auto' : '100%'}
                    textAlign={isMobile ? 'center' : 'left'}
                >
                    {/* Título del producto */}
                    <Typography variant={isMobile ? "h5" : "h4"} component="h1" fontWeight="bold" mb={2}>
                        {selectedProduct.brand} - {selectedProduct.model}
                    </Typography>

                    {/* Componentes de descripción y acciones */}
                    <ProductDescription product={selectedProduct} />
                    <ProductAction product={selectedProduct} />
                </Box>
            </Box>
        </Container>
    );
};

export default ProductDetailPage;