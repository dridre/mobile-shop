import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartDropdown from '../cart/CartDropdown';
import { fetchProductById } from '../../redux/slices/productSlice';

const Header = () => {
    const cartItems = useSelector(state => state.cart.items);
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const selectedProduct = useSelector(state => state.products.selectedProduct);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const paths = location.pathname.split('/').filter(p => p);
        if (paths[0] === 'product' && paths.length === 2) {
            const productId = paths[1];
            dispatch(fetchProductById(productId));
        }
    }, [location.pathname, dispatch]);

    const handleCartClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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

                <IconButton
                    color="inherit"
                    aria-label="carrito de compras"
                    onClick={handleCartClick}
                >
                    <Badge badgeContent={cartItems.length} color="error" showZero>
                        <ShoppingCartIcon />
                    </Badge>
                </IconButton>

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