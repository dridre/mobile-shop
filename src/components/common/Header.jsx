import React from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
    const cartItems = useSelector(state => state.cart.items);
    const location = useLocation();

    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(p => p);

        if (paths.length === 0) {
            return 'Inicio';
        } else if (paths[0] === 'product' && paths.length === 2) {
            return (
                <>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Inicio
                    </Link>
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
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        display: 'flex'
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
                    <Typography color="inherit">
                        {getBreadcrumbs()}
                    </Typography>
                </Box>

                <IconButton color="inherit" aria-label="carrito de compras">
                    <Badge badgeContent={cartItems.length} color="error" showZero>
                        <ShoppingCartIcon />
                    </Badge>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;