import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartDropdown from '../cart/CartDropdown';

const Header = () => {

    // Obtiene los items del carrito del estado de Redux
    const cartItems = useSelector(state => state.cart.items);

    // Obtiene la ubicación actual de la URL
    const location = useLocation();

    // Configuración para diseño responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Obtiene el producto seleccionado del estado
    const selectedProduct = useSelector(state => state.products.selectedProduct);

    // Estado para controlar el dropdown del carrito
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Función para abrir el dropdown del carrito
    const handleCartClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Función para cerrar el dropdown del carrito
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Genera las migas de pan (breadcrumbs) según la ubicación actual
    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(p => p);

        if (paths.length === 0) {
            return 'Inicio';
        } else if (paths[0] === 'product' && paths.length === 2) {
            const productName = selectedProduct ?
                `${selectedProduct.brand} ${selectedProduct.model}` :
                'Cargando...';

            return (
                <>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Inicio
                    </Link>
                    {` > ${productName}`}
                </>
            );
        }

        return paths.join(' > ');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Logo adaptado para dispositivos móviles o desktop */}
                {isMobile ? (
                    <IconButton
                        component={Link}
                        to="/"
                        color="inherit"
                        aria-label="inicio"
                        sx={{
                            fontSize: '1.75rem',
                            marginRight: 2
                        }}
                    >
                        <SmartphoneIcon fontSize="large" />
                    </IconButton>
                ) : (
                    <Box
                        component={Link}
                        to="/"
                        sx={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: 2
                        }}
                    >
                        <SmartphoneIcon fontSize="large" sx={{ marginRight: 1 }} />
                        <Typography variant="h6" component="div">
                            Mobile Shop
                        </Typography>
                    </Box>
                )}

                {/* Breadcrumbs para navegación */}
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    paddingLeft: '5%'
                }}>
                    <Typography variant="body2" color="inherit">
                        {getBreadcrumbs()}
                    </Typography>
                </Box>

                {/* Icono del carrito con badge para mostrar cantidad */}
                <IconButton
                    color="inherit"
                    aria-label="carrito de compras"
                    onClick={handleCartClick}
                >
                    <Badge badgeContent={cartItems.length} color="error" showZero>
                        <ShoppingCartIcon />
                    </Badge>
                </IconButton>

                {/* Componente dropdown del carrito */}
                <CartDropdown
                    anchorEl={anchorEl}
                    open={open}
                    handleClose={handleClose}
                />
            </Toolbar>
        </AppBar>
    );
};

export default Header;