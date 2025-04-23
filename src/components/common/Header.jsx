import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartDropdown from '../cart/CartDropdown';
import { fetchProductById } from '../../redux/slices/productSlice';

const Header = () => {
    const cartItems = useSelector(state => state.cart.items);
    const location = useLocation();
    const dispatch = useDispatch();

    // Change from currentProduct to selectedProduct to match your Redux state
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
                <Typography
                    variant="h4"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 0,
                        marginRight: 4,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold'
                    }}
                >
                    Mobile Shop
                </Typography>

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